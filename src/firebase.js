import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// NOTE: You provided explicit Firebase config values. It's fine to use
// them for a quick setup, but for production it's recommended to use
// environment variables. See `.env.example` for placeholders.
const firebaseConfig = {
  apiKey: "AIzaSyCDs6O-KD7mCuvRCZC6xdmVBkjlyHFF4xs",
  authDomain: "lexicdys-4787a.firebaseapp.com",
  projectId: "lexicdys-4787a",
  storageBucket: "lexicdys-4787a.firebasestorage.app",
  messagingSenderId: "957986959122",
  appId: "1:957986959122:web:53db109f45f0b53cd14dcb",
  measurementId: "G-FFB1S5PL93",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optional: initialize analytics (may require hosting on https and supported browsers)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (err) {
  // Analytics initialization can fail in some environments — keep app usable.
  analytics = null;
}

// Initialize Firebase services and export them
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const firebaseAnalytics = analytics;

export default app;
