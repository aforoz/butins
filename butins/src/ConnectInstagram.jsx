// src/ConnectInstagram.jsx
// İşletmesi olup henüz IG bağlamamış kullanıcıya gösterilir.
// IG bağlanınca deneme başlar (ya da o IG denemesini kullandıysa Paywall'a düşer).
import React, { useState } from "react";
import { Instagram } from "lucide-react";
import { connectInstagram } from "./setupBusiness";

const DISPLAY = "'Bricolage Grotesque', sans-serif";

export default function ConnectInstagram() {
  const [igId, setIgId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!igId.trim()) { setErr("Instagram hesap ID gerekli."); return; }
    setBusy(true); setErr("");
    try {
      await connectInstagram(igId.trim());
      // Başarılıysa işletme belgesi canlı güncellenir; App otomatik panele/paywall'a geçer.
    } catch (e) {
      setErr(e.message || "Bağlanamadı.");
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-7">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
          <Instagram size={30} className="text-white" />
        </div>
        <h1 className="text-2xl" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>Instagram'ını bağla</h1>
        <p className="text-sm text-stone-400 mt-1">Bağlayınca 15 günlük ücretsiz deneme başlar</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Instagram size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={igId} onChange={(e) => setIgId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Instagram hesap ID" autoCapitalize="none"
            className="w-full pl-11 pr-3 py-3.5 rounded-2xl border border-stone-200 bg-white text-base focus:outline-none focus:border-rose-400" />
        </div>
        {err && <p className="text-sm text-rose-600 px-1">{err}</p>}
        <button onClick={submit} disabled={busy}
          className="w-full bg-rose-600 active:bg-rose-700 disabled:bg-stone-300 text-white rounded-2xl py-3.5 text-base font-semibold transition-colors">
          {busy ? "Bağlanıyor…" : "Bağla ve Başla"}
        </button>
      </div>
      <p className="text-[11px] text-stone-400 text-center mt-6 leading-relaxed">
        Profesyonel hesabının ID'si. Her Instagram hesabı yalnızca bir kez ücretsiz deneme alır.
      </p>
    </div>
  );
}
