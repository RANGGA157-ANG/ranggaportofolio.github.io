// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMc1RnKN7Dg6KKhGE4XsbjpwzjswIgY0M",
  authDomain: "website-portofolio-f86a9.firebaseapp.com",
  projectId: "website-portofolio-f86a9",
  storageBucket: "website-portofolio-f86a9.appspot.com", // ← Diperbaiki
  messagingSenderId: "459582256476",
  appId: "1:459582256476:web:25af6f7d6dc613ed697d99",
  measurementId: "G-MJNP1068P4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore & Storage to export
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth to export
export const auth = getAuth(app);

// Optional analytics
export const analytics = getAnalytics(app);

// Anonymous authentication
export async function authenticateAnonymously() {
  try {
    console.log("Attempting anonymous authentication...");
    const userCredential = await signInAnonymously(auth);
    console.log("Anonymous user signed in successfully:", userCredential.user.uid);
    return userCredential.user;
  } catch (e) {
    console.error("Anonymous auth failed:", e);
    // Provide more specific error messages
    if (e.code === 'auth/operation-not-allowed') {
      throw new Error("Anonymous authentication tidak diaktifkan di Firebase Console. Silakan aktifkan di Authentication > Sign-in method > Anonymous.");
    } else if (e.code === 'auth/network-request-failed') {
      throw new Error("Gagal koneksi jaringan. Periksa koneksi internet.");
    } else {
      throw new Error(`Gagal autentikasi anonim: ${e.message}`);
    }
  }
}

// Email/password authentication
export async function authenticateWithEmailPassword(email, password) {
  try {
    console.log("Attempting email/password authentication...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully:", userCredential.user.uid);
    return userCredential.user;
  } catch (e) {
    console.error("Email/password auth failed:", e);
    // Provide more specific error messages
    if (e.code === 'auth/user-not-found') {
      throw new Error("Email tidak ditemukan. Silakan periksa email Anda.");
    } else if (e.code === 'auth/wrong-password') {
      throw new Error("Password salah. Silakan coba lagi.");
    } else if (e.code === 'auth/invalid-email') {
      throw new Error("Format email tidak valid.");
    } else if (e.code === 'auth/network-request-failed') {
      throw new Error("Gagal koneksi jaringan. Periksa koneksi internet.");
    } else {
      throw new Error(`Gagal autentikasi: ${e.message}`);
    }
  }
}

// Email/password registration
export async function registerWithEmailPassword(email, password) {
  try {
    console.log("Attempting email/password registration...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered and signed in successfully:", userCredential.user.uid);
    return userCredential.user;
  } catch (e) {
    console.error("Registration failed:", e);
    // Provide more specific error messages
    if (e.code === 'auth/email-already-in-use') {
      throw new Error("Email sudah terdaftar. Silakan gunakan email lain atau login.");
    } else if (e.code === 'auth/weak-password') {
      throw new Error("Password terlalu lemah. Gunakan minimal 6 karakter.");
    } else if (e.code === 'auth/invalid-email') {
      throw new Error("Format email tidak valid.");
    } else if (e.code === 'auth/network-request-failed') {
      throw new Error("Gagal koneksi jaringan. Periksa koneksi internet.");
    } else {
      throw new Error(`Gagal registrasi: ${e.message}`);
    }
  }
}

// Connection check
export async function checkFirebaseConnection() {
  try {
    // Simple connection test by trying to get a non-existent doc
    // This verifies config and network access to Firestore
    const testDocRef = doc(db, '_test_connection', 'doc');
    await getDoc(testDocRef);
    return true; // Connection is OK
  } catch (e) {
    console.error("Firebase connection check failed:", e);
    return false; // Connection failed
  }
}

// Connection check
export async function checkFirebaseConnection() {
  try {
    // Simple connection test
    const testRef = doc(db, '_test', 'connection');
    await getDoc(testRef);
    return true;
  } catch (e) {
    console.error("Firebase connection failed:", e);
    return false;
  }
}
