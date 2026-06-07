// src/TeamScreen.jsx
// Ekip yönetimi — üyeleri listele, e-posta ile davet et (yalnızca sahip).
import React, { useState, useEffect } from "react";
import { Users, UserPlus, Crown, Mail } from "lucide-react";
import { auth } from "./firebase";
import { subscribeMembers, inviteMember } from "./membership";

const DISPLAY = "'Bricolage Grotesque', sans-serif";

export default function TeamScreen({ businessId, flash }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    const unsub = subscribeMembers(businessId, (rows) => { setMembers(rows); setLoading(false); });
    return () => unsub();
  }, [businessId]);

  const myUid = auth.currentUser && auth.currentUser.uid;
  const me = members.find((m) => m.uid === myUid);
  const isOwner = me && me.role === "owner";

  const invite = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@")) { flash && flash("Geçerli e-posta gir"); return; }
    setBusy(true);
    try {
      await inviteMember(e);
      setEmail("");
      flash && flash("Davet oluşturuldu ✓");
    } catch (err) {
      flash && flash(err.message || "Davet gönderilemedi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg mb-1" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>Ekip</h2>
      <p className="text-sm text-stone-500 mb-3">İşletmene yalnızca davet ettiğin kişiler erişebilir.</p>

      {isOwner && (
        <div className="bg-white border border-stone-200 rounded-2xl p-3.5 mb-4">
          <div className="text-[11px] uppercase tracking-wide text-stone-400 mb-2 flex items-center gap-1"><UserPlus size={12} /> Yeni üye davet et</div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && invite()}
                type="email" placeholder="eposta@ornek.com" autoCapitalize="none"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-400" />
            </div>
            <button onClick={invite} disabled={busy}
              className="px-4 rounded-xl bg-rose-600 active:bg-rose-700 disabled:bg-stone-300 text-white text-sm font-semibold">
              Davet
            </button>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">Davet edilen kişi bu e-posta ile kayıt olup giriş yapınca otomatik ekibe katılır.</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-stone-400 text-sm">Yükleniyor…</div>
      ) : (
        <div className="space-y-2.5">
          {members.map((m) => (
            <div key={m.uid} className="bg-white border border-stone-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                <Users size={18} className="text-stone-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{m.email || m.uid}</div>
                <div className="text-xs text-stone-400">{m.uid === myUid ? "Sen" : "Üye"}</div>
              </div>
              {m.role === "owner" && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Crown size={12} /> Sahip
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
