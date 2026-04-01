// src/lib/firebase.ts
// ─────────────────────────────────────────────────────────────────────────────
// Replace the values below with your own Firebase project credentials.
// Firebase Console → Project Settings → Your apps → SDK setup & config
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || "YOUR_API_KEY",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        || "YOUR_AUTH_DOMAIN",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         || "YOUR_PROJECT_ID",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID|| "YOUR_MESSAGING_SENDER_ID",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             || "YOUR_APP_ID",
};

// Prevent duplicate initialization in Next.js hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);

// Messaging is only available in browser environments that support it
export const getFirebaseMessaging = async () => {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};

export default app;
