// src/tenant.js
// Giriş yapan kullanıcıyı işletmesine (businessId) bağlar ve işletme belgesini dinler.
// users/{uid} = { businessId, role, email }
import { db } from "./firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { businessDoc } from "./firestore/paths";

export async function getUserBusiness(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data().businessId || null;
}

// İşletme belgesini canlı dinler (deneme/abonelik durumu anlık güncellensin diye)
export function subscribeBusiness(businessId, cb, onError) {
  return onSnapshot(
    businessDoc(businessId),
    (s) => cb(s.exists() ? { id: s.id, ...s.data() } : null),
    (err) => { console.error("business dinleme hatası:", err); onError && onError(err); }
  );
}
