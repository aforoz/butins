// src/auth.js
// Firebase Auth sarmalayıcı — e-posta/şifre girişi.
import { auth } from "./firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// Oturum durumunu dinler. cb(null) = çıkış, cb(user) = giriş yapılmış.
export function watchAuth(cb) {
  return onAuthStateChanged(auth, (user) => cb(user || null));
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function signOutUser() {
  return signOut(auth);
}

// Firebase hata kodlarını Türkçe mesaja çevirir
export function authErrorMessage(code) {
  switch (code) {
    case "auth/invalid-email": return "Geçersiz e-posta adresi.";
    case "auth/user-disabled": return "Bu hesap devre dışı bırakılmış.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "E-posta veya şifre hatalı.";
    case "auth/too-many-requests": return "Çok fazla deneme yapıldı. Biraz sonra tekrar dene.";
    case "auth/network-request-failed": return "Bağlantı hatası. İnterneti kontrol et.";
    default: return "Giriş yapılamadı, tekrar dene.";
  }
}
