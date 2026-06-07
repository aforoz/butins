// src/firestore/templates.js
// Hazır cevap şablonları — işletmeye göre kapsamlı.
import { query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { templatesCol, templateDoc } from "./paths";

export function subscribeTemplates(businessId, onData, onError) {
  const q = query(templatesCol(businessId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => { console.error("templates dinleme hatası:", err); onError && onError(err); }
  );
}

export function addTemplate(businessId, title, body) {
  return addDoc(templatesCol(businessId), { title: title.trim(), body: body.trim(), createdAt: serverTimestamp() });
}
export function updateTemplate(businessId, id, patch) {
  return updateDoc(templateDoc(businessId, id), patch);
}
export function deleteTemplate(businessId, id) {
  return deleteDoc(templateDoc(businessId, id));
}

// {ad} / {isim} yer tutucusunu müşteri adıyla değiştirir (saf fonksiyon)
export function fillTemplate(body, name) {
  return (body || "").replace(/\{ad\}|\{isim\}/gi, (name || "").split(" ")[0] || "");
}
