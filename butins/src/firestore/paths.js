// src/firestore/paths.js
// Tüm Firestore yolları tek yerden, işletmeye (businessId) göre kapsamlanır.
// Her işletmenin verisi businesses/{businessId}/... altında, tamamen izole.
import { db } from "../firebase";
import { collection, doc } from "firebase/firestore";

export const businessDoc  = (bid)      => doc(db, "businesses", bid);
export const customersCol = (bid)      => collection(db, "businesses", bid, "customers");
export const customerDoc  = (bid, id)  => doc(db, "businesses", bid, "customers", id);
export const messagesCol  = (bid)      => collection(db, "businesses", bid, "messages");
export const templatesCol = (bid)      => collection(db, "businesses", bid, "templates");
export const templateDoc  = (bid, id)  => doc(db, "businesses", bid, "templates", id);
export const membersCol   = (bid)      => collection(db, "businesses", bid, "members");
