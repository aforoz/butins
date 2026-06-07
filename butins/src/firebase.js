// src/firebase.js
// Firebase başlatma — gerçek proje yapılandırmasıyla bağlı (butins-97e29).
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDI6C5ab5nJwiBXUbGjn9BbDh1-yN8KTI4",
  authDomain: "butins-97e29.firebaseapp.com",
  projectId: "butins-97e29",
  storageBucket: "butins-97e29.firebasestorage.app",
  messagingSenderId: "223982933650",
  appId: "1:223982933650:web:f45cfa4788394c2d01b84b",
  measurementId: "G-68G3BXRW54",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
