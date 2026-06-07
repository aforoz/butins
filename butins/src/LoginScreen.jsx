// src/LoginScreen.jsx
// Firebase Auth ile giriş ekranı — prototipteki kod-içi şifrenin yerine geçer.
import React, { useState } from "react";
import { Instagram, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn, authErrorMessage } from "./auth";

const DISPLAY = "'Bricolage Grotesque', sans-serif";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !pass) { setErr("E-posta ve şifre gerekli."); return; }
    setBusy(true); setErr("");
    try {
      await signIn(email, pass);
      // Başarılı olursa onAuthStateChanged App'i otomatik günceller.
    } catch (e) {
      setErr(authErrorMessage(e.code));
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-7">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
          <Instagram size={32} className="text-white" />
        </div>
        <h1 className="text-2xl" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>Satış Takip CRM</h1>
        <p className="text-sm text-stone-400 mt-1">Yönetici girişi</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            type="email" placeholder="E-posta" autoCapitalize="none" autoComplete="email"
            className="w-full pl-11 pr-3 py-3.5 rounded-2xl border border-stone-200 bg-white text-base focus:outline-none focus:border-rose-400" />
        </div>
        <div className="relative">
          <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            type={show ? "text" : "password"} placeholder="Şifre" autoComplete="current-password"
            className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-stone-200 bg-white text-base focus:outline-none focus:border-rose-400" />
          <button onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {err && <p className="text-sm text-rose-600 px-1">{err}</p>}
        <button onClick={submit} disabled={busy}
          className="w-full bg-rose-600 active:bg-rose-700 disabled:bg-stone-300 text-white rounded-2xl py-3.5 text-base font-semibold transition-colors">
          {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </div>

      <p className="text-[11px] text-stone-400 text-center mt-6 leading-relaxed">
        Hesabı Firebase Console &gt; Authentication bölümünden oluşturursun.
      </p>
    </div>
  );
}
