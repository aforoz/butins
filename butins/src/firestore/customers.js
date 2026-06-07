// src/firestore/customers.js
// "customers" veri katmanı — her işletmenin kendi alt koleksiyonu altında.
import {
  query, orderBy, onSnapshot, updateDoc, deleteDoc, setDoc, serverTimestamp,
} from "firebase/firestore";
import { customersCol, customerDoc } from "./paths";

/** Bir işletmenin müşterilerini canlı dinler (en son güncellenen üstte). */
export function subscribeCustomers(businessId, onData, onError) {
  const q = query(customersCol(businessId), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => { console.error("customers dinleme hatası:", err); onError && onError(err); }
  );
}

export function updateCustomer(businessId, id, patch) {
  return updateDoc(customerDoc(businessId, id), { ...patch, updatedAt: serverTimestamp() });
}

export function deleteCustomer(businessId, id) {
  return deleteDoc(customerDoc(businessId, id));
}

export function upsertCustomer(businessId, data) {
  const id = data.igsid || "manual_" + Date.now();
  return setDoc(
    customerDoc(businessId, id),
    {
      igsid: id, status: "new", total: 0, paid: 0,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      ...data,
    },
    { merge: true }
  );
}
