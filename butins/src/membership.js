// src/membership.js
// Ekip/üyelik: davet ve üyelik çözümü (callable'lar) + üye listesi (canlı).
import { getFunctions, httpsCallable } from "firebase/functions";
import { query, orderBy, onSnapshot } from "firebase/firestore";
import { app } from "./firebase";
import { membersCol } from "./firestore/paths";

const functions = getFunctions(app, "europe-west1");

// Giriş yapan kullanıcıyı işletmesine bağlar; businessId | null döner.
export async function resolveMembership() {
  const res = await httpsCallable(functions, "resolveMembership")();
  return (res.data && res.data.businessId) || null;
}

// İşletme sahibi yeni üye davet eder.
export async function inviteMember(email, role = "staff") {
  try {
    const res = await httpsCallable(functions, "inviteMember")({ email, role });
    return res.data;
  } catch (e) {
    throw new Error(e.message || "Davet gönderilemedi.");
  }
}

// İşletmenin üyelerini canlı dinler.
export function subscribeMembers(businessId, onData, onError) {
  const q = query(membersCol(businessId), orderBy("addedAt", "asc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))),
    (err) => { console.error("members dinleme hatası:", err); onError && onError(err); }
  );
}
