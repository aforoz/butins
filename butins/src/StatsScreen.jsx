// src/StatsScreen.jsx
// Özet paneli — canlı müşteri verisinden günlük/toplam istatistik üretir.
import React, { useState, useEffect, useMemo } from "react";
import { ShoppingBag, Users, Wallet, Clock } from "lucide-react";
import { subscribeCustomers } from "./firestore/customers";

const DISPLAY = "'Bricolage Grotesque', sans-serif";
const STATUS = {
  new: { label: "Yeni", color: "#d97706" },
  confirmed: { label: "Onaylandı", color: "#2563eb" },
  shipped: { label: "Kargoda", color: "#7c3aed" },
  done: { label: "Tamamlandı", color: "#059669" },
  cancelled: { label: "İptal", color: "#e11d48" },
};
const STATUS_ORDER = ["new", "confirmed", "shipped", "done", "cancelled"];
const fmtTL = (n) => (Number(n) || 0).toLocaleString("tr-TR") + " ₺";
const isToday = (ts) => {
  if (!ts || !ts.toDate) return false;
  return ts.toDate().toDateString() === new Date().toDateString();
};

export default function StatsScreen({ businessId }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!businessId) return;
    const unsub = subscribeCustomers(
      businessId,
      (rows) => { setCustomers(rows); setLoading(false); },
      (err) => { setError(err.message || "Bağlantı hatası"); setLoading(false); }
    );
    return () => unsub();
  }, [businessId]);

  const s = useMemo(() => {
    const todayCount = customers.filter((c) => isToday(c.createdAt)).length;
    const collected = customers.reduce((a, c) => a + (Number(c.paid) || 0), 0);
    const pending = customers.reduce((a, c) => a + Math.max(0, (Number(c.total) || 0) - (Number(c.paid) || 0)), 0);
    const byStatus = STATUS_ORDER.map((k) => ({ k, n: customers.filter((c) => (c.status || "new") === k).length }));
    const max = Math.max(1, ...byStatus.map((x) => x.n));

    // Son 7 gün — sipariş tutarı (createdAt'e göre)
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      days.push({ t: d.getTime(), label: d.toLocaleDateString("tr-TR", { weekday: "short" }), value: 0, count: 0 });
    }
    customers.forEach((c) => {
      if (!c.createdAt || !c.createdAt.toDate) return;
      const cd = c.createdAt.toDate(); cd.setHours(0, 0, 0, 0);
      const b = days.find((x) => x.t === cd.getTime());
      if (b) { b.value += Number(c.total) || 0; b.count += 1; }
    });
    const dailyMax = Math.max(1, ...days.map((d) => d.value));

    return { todayCount, collected, pending, total: customers.length, byStatus, max, days, dailyMax };
  }, [customers]);

  if (loading) return <div className="p-10 text-center text-stone-400 text-sm">Yükleniyor…</div>;
  if (error) return <div className="p-6 text-center text-rose-600 text-sm">Veri alınamadı: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg mb-3" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>Özet</h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Kpi icon={ShoppingBag} label="Bugünkü sipariş" value={s.todayCount} tint="bg-amber-50 text-amber-700" />
        <Kpi icon={Users} label="Toplam müşteri" value={s.total} tint="bg-blue-50 text-blue-700" />
        <Kpi icon={Wallet} label="Tahsil edilen" value={fmtTL(s.collected)} tint="bg-emerald-50 text-emerald-700" />
        <Kpi icon={Clock} label="Bekleyen tahsilat" value={fmtTL(s.pending)} tint="bg-rose-50 text-rose-700" />
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4">
        <h3 className="font-semibold text-sm mb-3" style={{ fontFamily: DISPLAY }}>Son 7 gün — sipariş tutarı</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {s.days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <span className="text-[10px] text-stone-500 font-medium">{d.value > 0 ? fmtTL(d.value) : ""}</span>
              <div className="w-full rounded-t-lg bg-rose-500 transition-all" style={{ height: `${(d.value / s.dailyMax) * 100}%`, minHeight: d.value > 0 ? 4 : 0 }} />
              <span className="text-[10px] text-stone-400">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-4">
        <h3 className="font-semibold text-sm mb-3" style={{ fontFamily: DISPLAY }}>Duruma göre dağılım</h3>
        <div className="space-y-2.5">
          {s.byStatus.map(({ k, n }) => (
            <div key={k} className="flex items-center gap-3">
              <span className="text-xs text-stone-600 w-20 shrink-0">{STATUS[k].label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(n / s.max) * 100}%`, background: STATUS[k].color }} />
              </div>
              <span className="text-xs font-semibold text-stone-700 w-6 text-right">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-3.5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${tint}`}><Icon size={18} /></div>
      <div className="text-xl font-bold text-stone-800" style={{ fontFamily: DISPLAY }}>{value}</div>
      <div className="text-[11px] text-stone-400 mt-0.5">{label}</div>
    </div>
  );
}
