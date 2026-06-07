// src/TemplatesScreen.jsx
// Hazır cevap şablonlarını yönet (ekle / düzenle / sil).
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X, MessageSquare } from "lucide-react";
import { subscribeTemplates, addTemplate, updateTemplate, deleteTemplate } from "./firestore/templates";

const DISPLAY = "'Bricolage Grotesque', sans-serif";

export default function TemplatesScreen({ businessId, flash }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!businessId) return;
    const unsub = subscribeTemplates(businessId, (rows) => { setList(rows); setLoading(false); });
    return () => unsub();
  }, [businessId]);

  const save = async () => {
    if (!title.trim() || !body.trim()) { flash && flash("Başlık ve metin gerekli"); return; }
    try {
      if (editId) { await updateTemplate(businessId, editId, { title: title.trim(), body: body.trim() }); flash && flash("Güncellendi ✓"); }
      else { await addTemplate(businessId, title, body); flash && flash("Şablon eklendi ✓"); }
      setTitle(""); setBody(""); setEditId(null);
    } catch (e) { flash && flash("Kaydedilemedi"); }
  };
  const startEdit = (t) => { setEditId(t.id); setTitle(t.title); setBody(t.body); };
  const cancelEdit = () => { setEditId(null); setTitle(""); setBody(""); };
  const remove = async (id) => { try { await deleteTemplate(businessId, id); flash && flash("Silindi"); } catch (e) { flash && flash("Silinemedi"); } };

  return (
    <div className="p-4">
      <h2 className="text-lg mb-1" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>Hazır Cevaplar</h2>
      <p className="text-sm text-stone-500 mb-3">Sohbette tek dokunuşla kullanabilirsin. <span className="text-stone-400">{"{ad}"} müşteri adıyla değişir.</span></p>

      <div className="bg-white border border-stone-200 rounded-2xl p-3.5 mb-4 space-y-2.5">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık (örn. Kargo bilgisi)"
          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-400" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Merhaba {ad}, siparişin kargoya verildi 📦"
          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-400 resize-none" />
        <div className="flex gap-2">
          <button onClick={save} className="flex-1 bg-rose-600 active:bg-rose-700 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
            {editId ? <><Check size={16} /> Güncelle</> : <><Plus size={16} /> Ekle</>}
          </button>
          {editId && <button onClick={cancelEdit} className="px-4 rounded-xl border border-stone-200 text-stone-500 active:bg-stone-50"><X size={16} /></button>}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-stone-400 text-sm">Yükleniyor…</div>
      ) : list.length === 0 ? (
        <div className="text-center py-14 text-stone-400">
          <MessageSquare size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Henüz şablon yok. Yukarıdan ekleyebilirsin.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map((t) => (
            <div key={t.id} className="bg-white border border-stone-200 rounded-2xl p-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-sm">{t.title}</span>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(t)} className="p-1.5 text-stone-400 active:text-blue-600"><Pencil size={15} /></button>
                  <button onClick={() => remove(t.id)} className="p-1.5 text-stone-400 active:text-rose-600"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="text-xs text-stone-500 mt-1 whitespace-pre-wrap">{t.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
