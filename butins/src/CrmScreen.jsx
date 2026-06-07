// src/CrmScreen.jsx
// Firestore'a bağlı müşteri ekranı. Mevcut tek dosyalık prototipteki
// CrmTab'in yerine geçer — window.storage yerine canlı Firestore kullanır.
import React, { useState, useEffect, useMemo } from "react";
import { Search, Phone, MapPin, Download, Trash2, Package, Truck } from "lucide-react";
import { subscribeCustomers, updateCustomer, deleteCustomer } from "./firestore/customers";

const STATUS = {
  new:       { label: "Yeni",        cls: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Onaylandı",   cls: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped:   { label: "Kargoda",     cls: "bg-violet-50 text-violet-700 border-violet-200" },
  done:      { label: "Tamamlandı",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "İptal",       cls: "bg-rose-50 text-rose-700 border-rose-200" },
};
const STATUS_ORDER = ["new", "confirmed", "shipped", "done", "cancelled"];
const fmtTL = (n) => (Number(n) || 0).toLocaleString("tr-TR") + " ₺";
const fullAddress = (c) => [c.address, c.city, c.postal].filter(Boolean).join(", ");

export default function CrmScreen({ businessId, flash }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Canlı dinleme — bileşen kapanınca aboneliği bırak
  useEffect(() => {
    if (!businessId) return;
    const unsub = subscribeCustomers(
      businessId,
      (rows) => { setCustomers(rows); setLoading(false); },
      (err) => { setError(err.message || "Bağlantı hatası"); setLoading(false); }
    );
    return () => unsub();
  }, [businessId]);

  const filtered = useMemo(() => customers.filter((c) => {
    const q = search.toLocaleLowerCase("tr");
    const hay = [c.name, c.phone, c.address, c.city, c.username].filter(Boolean).join(" ").toLocaleLowerCase("tr");
    return (!q || hay.includes(q)) && (statusFilter === "all" || c.status === statusFilter);
  }), [customers, search, statusFilter]);

  const sum = filtered.reduce((a, c) => ({ t: a.t + (Number(c.total) || 0), p: a.p + (Number(c.paid) || 0) }), { t: 0, p: 0 });

  const patch = async (id, data) => {
    try { await updateCustomer(businessId, id, data); }
    catch (e) { flash && flash("Kaydedilemedi, tekrar dene"); }
  };
  const remove = async (id) => {
    try { await deleteCustomer(businessId, id); flash && flash("Silindi"); }
    catch (e) { flash && flash("Silinemedi"); }
  };

  if (loading) return <div className="p-10 text-center text-stone-400 text-sm">Yükleniyor…</div>;
  if (error) return <div className="p-6 text-center text-rose-600 text-sm">Firestore'a bağlanılamadı: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ara..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-rose-400" />
        </div>
        <button onClick={() => exportCSV(customers, flash)} disabled={!customers.length}
          className="px-3.5 rounded-xl border border-stone-200 bg-white text-stone-600 active:bg-stone-50 disabled:text-stone-300 flex items-center">
          <Download size={17} />
        </button>
      </div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Tümü</Chip>
        {STATUS_ORDER.map((s) => <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{STATUS[s].label}</Chip>)}
      </div>

      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="Alınacak" value={fmtTL(sum.t)} cls="bg-white border-stone-200 text-stone-800" labelCls="text-stone-400" />
          <Stat label="Alınan" value={fmtTL(sum.p)} cls="bg-emerald-50 border-emerald-200 text-emerald-700" labelCls="text-emerald-600" />
          <Stat label="Kalan" value={fmtTL(sum.t - sum.p)} cls="bg-rose-50 border-rose-200 text-rose-700" labelCls="text-rose-600" />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Package size={38} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">{customers.length === 0 ? "Henüz müşteri yok. Müşteri DM attıkça liste otomatik dolacak." : "Eşleşen kayıt yok."}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => {
            const S = STATUS[c.status] || STATUS.new;
            return (
              <div key={c.id} className="bg-white border border-stone-200 rounded-2xl p-3.5">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <span className="font-semibold text-sm">{c.name || "—"}</span>
                    {c.username && <span className="text-xs text-stone-400 ml-1.5">@{c.username}</span>}
                  </div>
                  <button onClick={() => remove(c.id)} className="p-1.5 text-stone-300 active:text-rose-600 shrink-0"><Trash2 size={15} /></button>
                </div>
                <div className="space-y-1 text-xs text-stone-600 mb-2.5">
                  {c.phone && <div className="flex items-center gap-1.5"><Phone size={13} className="text-stone-400 shrink-0" />{c.phone}</div>}
                  {fullAddress(c) && <div className="flex items-start gap-1.5"><MapPin size={13} className="text-stone-400 shrink-0 mt-0.5" /><span>{fullAddress(c)}</span></div>}
                </div>

                <TextField label="Ürün / Not" value={c.product} placeholder="Sipariş detayı, beden, renk…"
                  multiline onCommit={(v) => patch(c.id, { product: v })} />

                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  <MoneyField label="Alınacak" value={c.total} onCommit={(v) => patch(c.id, { total: v })} />
                  <MoneyField label="Alınan" value={c.paid} onCommit={(v) => patch(c.id, { paid: v })} accent="border-emerald-200 bg-emerald-50/60" />
                  <MoneyField label="Kalan" value={(Number(c.total) || 0) - (Number(c.paid) || 0)} readOnly accent="border-rose-200 bg-rose-50/60" />
                </div>
                <div className="mb-2.5"><PayBadge total={c.total} paid={c.paid} /></div>

                <div className="mb-2.5">
                  <TextField label="Kargo Takip No" value={c.trackingNo} placeholder="Aras kargo takip numarası"
                    icon={Truck} onCommit={(v) => patch(c.id, { trackingNo: v })} />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select value={c.status || "new"} onChange={(e) => patch(c.id, { status: e.target.value })}
                    className={`text-xs font-semibold rounded-lg border px-2.5 py-1.5 focus:outline-none ${S.cls}`}>
                    {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, cls, labelCls }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${cls}`}>
      <div className={`text-[10px] uppercase tracking-wide ${labelCls}`}>{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}

// Metin alanı — değer odak kaybında (blur) Firestore'a yazılır
function TextField({ label, value, placeholder, onCommit, multiline, icon: Icon }) {
  const [v, setV] = useState(value ?? "");
  useEffect(() => { setV(value ?? ""); }, [value]);
  const commit = () => { if ((v || "") !== (value || "")) onCommit(v.trim()); };
  const base = "w-full bg-transparent text-sm text-stone-800 focus:outline-none placeholder:text-stone-300";
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 mb-2.5">
      <div className="text-[10px] uppercase tracking-wide text-stone-400 flex items-center gap-1">
        {Icon && <Icon size={11} />}{label}
      </div>
      {multiline ? (
        <textarea rows={2} value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} onBlur={commit}
          className={base + " resize-none"} />
      ) : (
        <input value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} onBlur={commit} className={base} />
      )}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${active ? "bg-rose-600 text-white border-rose-600" : "bg-white text-stone-500 border-stone-200"}`}>
      {children}
    </button>
  );
}

// Değer sadece blur'da yazılır → her tuşta Firestore'a yazmaz
function MoneyField({ label, value, onCommit, readOnly, accent }) {
  const [v, setV] = useState(value ?? 0);
  useEffect(() => { setV(value ?? 0); }, [value]);
  return (
    <div className={`rounded-xl border px-2.5 py-1.5 ${accent || "border-stone-200 bg-stone-50"}`}>
      <div className="text-[10px] uppercase tracking-wide text-stone-400">{label}</div>
      {readOnly ? (
        <div className="text-sm font-bold text-stone-800">{fmtTL(value)}</div>
      ) : (
        <div className="flex items-center">
          <input type="number" inputMode="numeric" min="0" value={v || ""} placeholder="0"
            onChange={(e) => setV(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
            onBlur={() => onCommit(Number(v) || 0)}
            className="w-full bg-transparent text-sm font-bold text-stone-800 focus:outline-none" />
          <span className="text-xs text-stone-400 ml-0.5">₺</span>
        </div>
      )}
    </div>
  );
}

function PayBadge({ total, paid }) {
  const t = Number(total) || 0, p = Number(paid) || 0;
  let label, cls;
  if (t > 0 && p >= t) { label = "Ödendi"; cls = "bg-emerald-100 text-emerald-700"; }
  else if (p > 0) { label = "Kısmi ödeme"; cls = "bg-amber-100 text-amber-700"; }
  else { label = "Ödeme bekliyor"; cls = "bg-stone-100 text-stone-500"; }
  return <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function exportCSV(rows, flash) {
  const head = ["İsim", "Kullanıcı", "Telefon", "Adres", "Ürün/Not", "Durum", "Alınacak", "Alınan", "Kalan", "Kargo Takip No", "Tarih"];
  const data = rows.map((c) => {
    const t = Number(c.total) || 0, p = Number(c.paid) || 0;
    const date = c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString("tr-TR") : "";
    return [c.name, c.username, c.phone, fullAddress(c), c.product, (STATUS[c.status] || STATUS.new).label, t, p, t - p, c.trackingNo, date];
  });
  const csv = [head, ...data].map((r) => r.map((x) => `"${(x ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "musteri-listesi.csv"; a.click();
  URL.revokeObjectURL(url);
  flash && flash("CSV indirildi ✓");
}
