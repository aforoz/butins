// src/Onboarding.jsx
// İşletmesi olmayan kullanıcıya gösterilir — işletme adı ile başlar.
// Instagram bağlama ve deneme, sonraki adımda (ConnectInstagram) yapılır.
import React, { useState } from "react";
import { Store } from "lucide-react";
import { setupBusiness } from "./setupBusiness";

const DISPLAY = "'Bricolage Grotesque', sans-serif";

export default function Onboarding({ onDone }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!name.trim()) { setErr("İşletme adı gerekli."); return; }
    setBusy(true); setErr("");
    try {
      const { businessId } = await setupBusiness(name.trim());
      onDone(businessId);
    } catch (e) {
      setErr(e.message || "Oluşturulamadı.");
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-7">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
          <Store size={30} className="text-white" />
        </div>
        <h1 className="text-2xl" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>İşletmeni oluştur</h1>
        <p className="text-sm text-stone-400 mt-1">Başlamak için işletme adını gir</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Store size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="İşletme adı (örn. Moda Butik)"
            className="w-full pl-11 pr-3 py-3.5 rounded-2xl border border-stone-200 bg-white text-base focus:outline-none focus:border-rose-400" />
        </div>
        {err && <p className="text-sm text-rose-600 px-1">{err}</p>}
        <button onClick={submit} disabled={busy}
          className="w-full bg-rose-600 active:bg-rose-700 disabled:bg-stone-300 text-white rounded-2xl py-3.5 text-base font-semibold transition-colors">
          {busy ? "Oluşturuluyor…" : "Devam Et"}
        </button>
      </div>
      <p className="text-[11px] text-stone-400 text-center mt-6 leading-relaxed">
        Sonraki adımda Instagram hesabını bağlayınca 15 günlük ücretsiz deneme başlar.
      </p>
    </div>
  );
}
