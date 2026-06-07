// src/Paywall.jsx
// Deneme süresi dolduğunda / abonelik pasifken gösterilir.
import React, { useState } from "react";
import { Lock, Check, LogOut } from "lucide-react";
import { signOutUser } from "./auth";
import { startCheckout, PLAN } from "./billing";

const DISPLAY = "'Bricolage Grotesque', sans-serif";

export default function Paywall({ business }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const subscribe = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await startCheckout();
      if (r.configured && r.paymentUrl) {
        window.location.href = r.paymentUrl; // sağlayıcı ödeme sayfası
      } else {
        setMsg("Ödeme entegrasyonu yakında aktif olacak.");
      }
    } catch (e) {
      setMsg(e.message || "Ödeme başlatılamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-7 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
        <Lock size={30} className="text-rose-600" />
      </div>
      <h1 className="text-2xl" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>Deneme süren doldu</h1>
      <p className="text-sm text-stone-500 mt-2 mb-6">
        {business?.name ? `${business.name} için ` : ""}15 günlük ücretsiz deneme tamamlandı.
        Kullanmaya devam etmek için abone ol.
      </p>

      <div className="bg-white border border-stone-200 rounded-2xl p-5 text-left mb-5">
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-semibold" style={{ fontFamily: DISPLAY }}>{PLAN.name}</span>
          <span className="text-sm font-bold text-stone-800">{PLAN.priceLabel}</span>
        </div>
        {["Sınırsız müşteri ve mesaj takibi", "Otomatik bilgi ayıklama", "Hazır cevaplar ve özet paneli", "Ödeme ve kargo takibi"].map((f) => (
          <div key={f} className="flex items-start gap-2 text-sm text-stone-600 mb-1.5">
            <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> {f}
          </div>
        ))}
      </div>

      <button onClick={subscribe} disabled={busy}
        className="w-full bg-rose-600 active:bg-rose-700 disabled:bg-stone-300 text-white rounded-2xl py-3.5 text-base font-semibold transition-colors">
        {busy ? "Yönlendiriliyor…" : "Abone Ol"}
      </button>
      {msg && <p className="text-xs text-stone-500 mt-2">{msg}</p>}

      <button onClick={() => signOutUser()} className="mt-6 inline-flex items-center justify-center gap-1.5 text-sm text-stone-500 active:text-rose-600">
        <LogOut size={15} /> Çıkış yap
      </button>
    </div>
  );
}
