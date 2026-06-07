// src/billing.js
// Abonelik başlatma — backend createCheckout callable'ını çağırır.
// Sağlayıcı bağlanınca paymentUrl döner ve oraya yönlendiririz.
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

const functions = getFunctions(app, "europe-west1");

export async function startCheckout() {
  try {
    const res = await httpsCallable(functions, "createCheckout")();
    return res.data; // { configured, paymentUrl? }
  } catch (e) {
    throw new Error(e.message || "Ödeme başlatılamadı.");
  }
}

// Tek tip plan bilgisi (fiyatı sağlayıcı kurulumunda netleştir)
export const PLAN = {
  name: "Standart Plan",
  priceLabel: "₺— / ay",
  period: "aylık",
};
