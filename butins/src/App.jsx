// src/App.jsx
// Çok-kiracılı uygulama kabuğu: giriş → işletme (tenant) çözümü → sekmeli panel.
import React, { useState, useEffect } from "react";
import { Instagram, Inbox, Package, Sparkles, MessageSquare, Users, LogOut } from "lucide-react";
import { watchAuth, signOutUser } from "./auth";
import { subscribeBusiness } from "./tenant";
import { resolveMembership } from "./membership";
import { subscriptionState } from "./subscription";
import LoginScreen from "./LoginScreen";
import Onboarding from "./Onboarding";
import ConnectInstagram from "./ConnectInstagram";
import Paywall from "./Paywall";
import InboxScreen from "./InboxScreen";
import CrmScreen from "./CrmScreen";
import StatsScreen from "./StatsScreen";
import TemplatesScreen from "./TemplatesScreen";
import TeamScreen from "./TeamScreen";

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";

export default function App() {
  const [user, setUser] = useState(undefined);             // undefined=kontrol, null=çıkış
  const [businessId, setBusinessId] = useState(undefined); // undefined=yükleniyor, null=yok
  const [business, setBusiness] = useState(undefined);     // undefined=yükleniyor, null=yok

  useEffect(() => watchAuth(setUser), []);

  useEffect(() => {
    if (!user) { setBusinessId(undefined); return; }
    let alive = true;
    resolveMembership()
      .then((bid) => { if (alive) setBusinessId(bid); })
      .catch(() => { if (alive) setBusinessId(null); });
    return () => { alive = false; };
  }, [user]);

  useEffect(() => {
    if (!businessId) { setBusiness(undefined); return; }
    const unsub = subscribeBusiness(businessId, setBusiness, () => setBusiness(null));
    return () => unsub();
  }, [businessId]);

  let content = null;
  if (user === undefined) content = null;
  else if (!user) content = <LoginScreen />;
  else if (businessId === undefined) content = <Centered>Yükleniyor…</Centered>;
  else if (!businessId) content = <Onboarding onDone={setBusinessId} />;
  else if (business === undefined) content = <Centered>Yükleniyor…</Centered>;
  else if (!business.igAccountId) content = <ConnectInstagram />;
  else {
    const st = subscriptionState(business);
    content = st.access
      ? <Dashboard businessId={businessId} sub={st} />
      : <Paywall business={business} />;
  }

  return (
    <div className="w-full min-h-screen bg-stone-100 flex justify-center" style={{ fontFamily: FONT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div className="w-full max-w-md bg-stone-50 min-h-screen flex flex-col relative shadow-xl">
        {content}
      </div>
    </div>
  );
}

function Dashboard({ businessId, sub }) {
  const [tab, setTab] = useState("inbox");
  const [toast, setToast] = useState(null);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2000); };

  return (
    <>
      <header className="bg-white border-b border-stone-200 px-4 h-14 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center">
            <Instagram size={17} className="text-white" />
          </div>
          <span className="text-base" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>Satış Takip</span>
        </div>
        <button onClick={() => signOutUser()} className="flex items-center gap-1.5 text-xs text-stone-500 active:text-rose-600 px-2 py-1">
          <LogOut size={15} /> Çıkış
        </button>
      </header>

      {sub && sub.state === "trialing" && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs text-center py-1.5 px-3">
          Ücretsiz deneme — {sub.daysLeft} gün kaldı
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-20">
        {tab === "stats" && <StatsScreen businessId={businessId} />}
        {tab === "inbox" && <InboxScreen businessId={businessId} flash={flash} />}
        {tab === "crm" && <CrmScreen businessId={businessId} flash={flash} />}
        {tab === "templates" && <TemplatesScreen businessId={businessId} flash={flash} />}
        {tab === "team" && <TeamScreen businessId={businessId} flash={flash} />}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex h-16 z-20">
        {[
          { k: "stats", label: "Özet", icon: Sparkles },
          { k: "inbox", label: "Gelen", icon: Inbox },
          { k: "crm", label: "Müşteri", icon: Package },
          { k: "templates", label: "Şablon", icon: MessageSquare },
          { k: "team", label: "Ekip", icon: Users },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 ${tab === t.k ? "text-rose-600" : "text-stone-400"}`}>
            <t.icon size={20} />
            <span className="text-[11px] font-medium">{t.label}</span>
          </button>
        ))}
      </nav>

      {toast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg z-30 whitespace-nowrap">
          {toast}
        </div>
      )}
    </>
  );
}

function Centered({ children }) {
  return <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">{children}</div>;
}
