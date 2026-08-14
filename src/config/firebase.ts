/// <reference types="vite/client" />

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const key = import.meta.env.VITE_FIREBASE_API_KEY || '';

const firebaseConfig = {
  apiKey: key,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Check if a real production Firebase API Key is provided
export const isFirebaseConfigured = Boolean(
  key && key.length > 20 && !key.includes('DemoKey')
);

// Initialize Firebase App instance safely with try-catch block
let appInstance: any = null;
let authInstance: any = null;
let providerInstance: any = null;

try {
  if (isFirebaseConfigured) {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(appInstance);
    providerInstance = new GoogleAuthProvider();
    providerInstance.setCustomParameters({ prompt: 'select_account' });
  }
} catch (err) {
  console.warn('Firebase top-level initialization skipped safely:', err);
}

export const auth = authInstance;
export const googleProvider = providerInstance;
