import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB7ZcKqTou5FOXFfKVK0N4YRY_hEZ6CAEI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "shadowarrow.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "shadowarrow",
  storageBucket: "shadowarrow.firebasestorage.app",
  messagingSenderId: "466133114360",
  appId: "1:466133114360:web:956df256f2e78e17ed8a0d"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** Use redirect on mobile (popup gets blocked), popup on desktop */
export const signInWithGoogle = async () => {
  const isMobile = typeof window !== 'undefined' &&
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  if (isMobile) {
    await signInWithRedirect(auth, googleProvider);
    return null; // result comes via getRedirectResult on next page load
  }
  return signInWithPopup(auth, googleProvider);
};

export { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult };
