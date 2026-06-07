// src/InboxScreen.jsx
// Firestore "messages"e bağlı Gelen Kutusu. Prototipteki InboxTab + Conversation
// yerine geçer; demo veri yerine webhook'un yazdığı gerçek DM'leri gösterir.
import React, { useState, useEffect, useMemo } from "react";
import {
  AtSign, ChevronLeft, Sparkles, User, Phone, MapPin, Inbox, Package, Copy, Check, Send,
} from "lucide-react";
import { subscribeThreads } from "./firestore/messages";
import { upsertCustomer } from "./firestore/customers";
import { sendMessage } from "./firestore/messaging";
import { subscribeTemplates, fillTemplate } from "./firestore/templates";
import { parseMessage } from "./lib/parser";

const DISPLAY = "'Bricolage Grotesque', sans-serif";

const initials = (s = "") => s.replace(/^@/, "").slice(0, 2).toLocaleUpperCase("tr");
function fmtTime(ts) {
  if (!ts || !ts.toDate) return "";
  const d = ts.toDate();
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
}

export default function InboxScreen({ businessId, flash }) {
  const [threads, setThreads] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!businessId) return;
    const unsub = subscribeThreads(
      businessId,
      (rows) => { setThreads(rows); setLoading(false); },
      (err) => { setError(err.message || "Bağlantı hatası"); setLoading(false); }
    );
    return () => unsub();
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    const unsub = subscribeTemplates(businessId, (rows) => setTemplates(rows), () => {});
    return () => unsub();
  }, [businessId]);

  const active = threads.find((t) => t.igsid === activeId);

  if (loading) return <div className="p-10 text-center text-stone-400 text-sm">Yükleniyor…</div>;
  if (error) return <div className="p-6 text-center text-rose-600 text-sm">Mesajlar alınamadı: {error}</div>;

  if (active) return <Conversation businessId={businessId} thread={active} templates={templates} onBack={() => setActiveId(null)} flash={flash} />;

  if (threads.length === 0)
    return (
      <div className="text-center py-20 text-stone-400 px-6">
        <Inbox size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">Henüz mesaj yok. Bir müşteri Instagram'dan DM attığında burada görünecek.</p>
      </div>
    );

  return (
    <div>
      {threads.map((t) => (
        <button key={t.igsid} onClick={() => setActiveId(t.igsid)}
          className="w-full text-left px-4 py-3.5 flex gap-3 border-b border-stone-100 bg-white active:bg-stone-50">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">{initials(t.username)}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm truncate">@{t.username}</span>
              <span className="text-[11px] text-stone-400 shrink-0">{fmtTime(t.lastAt)}</span>
            </div>
            <p className="text-xs text-stone-500 truncate mt-0.5">{t.lastText}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function Conversation({ businessId, thread, templates = [], onBack, flash }) {
  const [saving, setSaving] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const customerText = thread.messages.filter((m) => m.from !== "me").map((m) => m.text).join("\n");
  const parsed = useMemo(() => parseMessage(customerText, thread.username), [customerText, thread.username]);

  const send = async () => {
    const text = reply.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await sendMessage(businessId, thread.igsid, text);
      setReply(""); // gönderilen mesaj canlı dinleme ile sohbete düşer
    } catch (e) {
      flash && flash(e.message || "Gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  const addToList = async () => {
    setSaving(true);
    try {
      await upsertCustomer(businessId, { igsid: thread.igsid, username: thread.username, ...parsed });
      flash && flash("Müşteri listeye eklendi ✓");
      onBack();
    } catch (e) {
      flash && flash("Eklenemedi, tekrar dene");
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="px-2 py-2.5 border-b border-stone-200 bg-white flex items-center gap-1 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 text-stone-500 active:text-rose-600"><ChevronLeft size={22} /></button>
        <AtSign size={14} className="text-stone-400" />
        <span className="font-semibold text-sm">{thread.username}</span>
      </div>

      <div className="px-4 py-4 space-y-2.5 bg-stone-50">
        {thread.messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${m.from === "me" ? "bg-rose-600 text-white rounded-br-md" : "bg-white border border-stone-200 rounded-bl-md"}`}>{m.text}</div>
          </div>
        ))}
      </div>

      {templates.length > 0 && (
        <div className="flex gap-1.5 px-3 pt-2.5 overflow-x-auto bg-white">
          {templates.map((t) => (
            <button key={t.id} onClick={() => setReply(fillTemplate(t.body, parsed.name || thread.username))}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border border-stone-200 bg-stone-50 text-stone-600 active:bg-stone-100 shrink-0">
              {t.title}
            </button>
          ))}
        </div>
      )}

      <div className="px-3 py-2.5 border-t border-stone-200 bg-white flex items-center gap-2">
        <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Cevap yaz..." disabled={sending}
          className="flex-1 px-3.5 py-2.5 rounded-full border border-stone-200 text-sm focus:outline-none focus:border-rose-400 disabled:bg-stone-50" />
        <button onClick={send} disabled={sending || !reply.trim()}
          className="w-10 h-10 rounded-full bg-rose-600 active:bg-rose-700 disabled:bg-stone-200 disabled:text-stone-400 text-white flex items-center justify-center shrink-0">
          <Send size={17} />
        </button>
      </div>

      <div className="bg-white border-t border-stone-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-rose-600" />
          <h3 className="font-semibold text-sm" style={{ fontFamily: DISPLAY }}>Otomatik Ayıklanan Bilgiler</h3>
        </div>
        <InfoRow icon={User} label="İsim" value={parsed.name} />
        <InfoRow icon={Phone} label="Telefon" value={parsed.phone} copyable onCopy={flash} />
        <InfoRow icon={MapPin} label="Adres" value={parsed.address} copyable onCopy={flash} />
        <InfoRow icon={MapPin} label="Şehir" value={parsed.city} />
        <InfoRow icon={Inbox} label="Posta Kodu" value={parsed.postal} />
        <button onClick={addToList} disabled={saving || (!parsed.phone && !parsed.address)}
          className="mt-4 w-full bg-rose-600 active:bg-rose-700 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-2xl py-3.5 text-base font-semibold flex items-center justify-center gap-2 transition-colors">
          <Package size={18} /> {saving ? "Ekleniyor…" : "Listeye Ekle"}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, copyable, onCopy }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(value); setCopied(true); onCopy && onCopy(`${label} kopyalandı`); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-stone-100 last:border-0">
      <Icon size={15} className="text-stone-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-stone-400">{label}</div>
        <div className={`text-sm ${value ? "text-stone-800" : "text-stone-300 italic"}`}>{value || "tespit edilemedi"}</div>
      </div>
      {copyable && value && (
        <button onClick={copy} className="p-1 text-stone-400 active:text-rose-600 shrink-0">
          {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
        </button>
      )}
    </div>
  );
}
