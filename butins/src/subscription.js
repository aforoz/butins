// src/subscription.js
// Deneme/abonelik durumunu tek yerden hesaplar (backend mantığıyla aynı).
const DAY = 86400000;

export function subscriptionState(biz) {
  if (!biz) return { access: false, state: "expired", daysLeft: 0 };
  const now = Date.now();
  const ms = (t) => (t && t.toDate ? t.toDate().getTime() : (t ? new Date(t).getTime() : 0));
  const sub = ms(biz.subscribedUntil);
  const trial = ms(biz.trialEndsAt);
  if (sub > now) return { access: true, state: "active", daysLeft: Math.ceil((sub - now) / DAY) };
  if (trial > now) return { access: true, state: "trialing", daysLeft: Math.ceil((trial - now) / DAY) };
  return { access: false, state: "expired", daysLeft: 0 };
}
