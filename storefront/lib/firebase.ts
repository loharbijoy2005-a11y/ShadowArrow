import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB7ZcKqTou5FOXFfKVK0N4YRY_hEZ6CAEI",
  authDomain: "shadowarrow.firebaseapp.com",
  projectId: "shadowarrow",
  storageBucket: "shadowarrow.firebasestorage.app",
  messagingSenderId: "466133114360",
  appId: "1:466133114360:web:956df256f2e78e17ed8a0d"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };
