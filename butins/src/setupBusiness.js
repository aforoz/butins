// src/setupBusiness.js
// İşletme oluşturma + Instagram bağlama (deneme buradan başlar) callable'ları.
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

const functions = getFunctions(app, "europe-west1");

export async function setupBusiness(name) {
  try {
    const res = await httpsCallable(functions, "setupBusiness")({ name });
    return res.data; // { businessId, existing }
  } catch (e) {
    throw new Error(e.message || "İşletme oluşturulamadı.");
  }
}

export async function connectInstagram(igAccountId) {
  try {
    const res = await httpsCallable(functions, "connectInstagram")({ igAccountId });
    return res.data; // { ok, trialGranted }
  } catch (e) {
    throw new Error(e.message || "Instagram bağlanamadı.");
  }
}
