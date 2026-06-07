// src/firestore/messages.js
// "messages" veri katmanı — işletmeye göre kapsamlı. Mesajları gönderene
// göre gruplayıp Gelen Kutusu için sohbet listesi üretir.
import { query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { messagesCol } from "./paths";

export function subscribeThreads(businessId, onData, onError, max = 300) {
  const q = query(messagesCol(businessId), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(
    q,
    (snap) => {
      const map = new Map();
      snap.docs.forEach((d) => {
        const m = d.data();
        if (!m.igsid) return;
        if (!map.has(m.igsid)) {
          map.set(m.igsid, {
            igsid: m.igsid,
            username: m.username || m.igsid,
            lastText: m.text,
            lastAt: m.createdAt,
            messages: [],
          });
        }
        map.get(m.igsid).messages.push({ from: m.from || "them", text: m.text, at: m.createdAt });
      });
      const threads = [...map.values()].map((t) => ({ ...t, messages: t.messages.slice().reverse() }));
      onData(threads);
    },
    (err) => { console.error("messages dinleme hatası:", err); onError && onError(err); }
  );
}
