// src/firestore/messaging.js
// Backend "sendMessage" callable'ını çağırır. İşletme kimliği de gönderilir;
// backend çağıranın o işletmenin üyesi olduğunu doğrular ve doğru token'ı kullanır.
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase";

const functions = getFunctions(app, "europe-west1"); // backend ile aynı bölge

export async function sendMessage(businessId, igsid, text) {
  const fn = httpsCallable(functions, "sendMessage");
  try {
    const res = await fn({ businessId, igsid, text });
    return res.data; // { ok: true, messageId }
  } catch (e) {
    throw new Error(e.message || "Mesaj gönderilemedi.");
  }
}
