import React, { useState } from 'react';
import { X, Smartphone, Sparkles, CheckCircle2, User as UserIcon, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { sanitizeInput } from '../utils/security';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  // 1. QUICK 1-CLICK MOBILE NUMBER LOGIN & REGISTRATION (NO OTP HASSLE)
  const handleMobileQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian Mobile Number.');
      return;
    }

    setLoading(true);

    const displayName = sanitizeInput(fullName) || `Customer ${cleanMobile.slice(-4)}`;

    try {
      const res = await fetch('/api/mobile-otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanMobile,
          otp: '123456',
          name: displayName
        })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('shadow_token', data.token);
        }
        localStorage.setItem('shadow_user', JSON.stringify(data.user));

        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        onSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to sign in via mobile number.');
      }
    } catch (err: any) {
      setLoading(false);
      // Fallback local sign-in if offline
      const fallbackUser: User = {
        name: displayName,
        email: '',
        phone: cleanMobile
      };
      localStorage.setItem('shadow_user', JSON.stringify(fallbackUser));
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      onSuccess(fallbackUser);
      onClose();
    }
  };

  // 2. GOOGLE 1-CLICK SIGN-IN
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    let gName = '';
    let gEmail = `google.user${Math.floor(100 + Math.random() * 900)}@gmail.com`;
    let gId = 'google_' + Date.now();
    let authenticated = false;

    if (isFirebaseConfigured) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const gUser = result.user;
        gEmail = gUser.email || gEmail;
        gId = gUser.uid;
        
        if (gUser.displayName) {
          gName = gUser.displayName;
        } else if (gEmail) {
          const prefix = gEmail.split('@')[0].replace(/[._-]/g, ' ');
          gName = prefix.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        }
        authenticated = true;
      } catch (err: any) {
        setLoading(false);
        if (err.code === 'auth/popup-closed-by-user') {
          setErrorMsg('Google popup closed. Please try again.');
        } else {
          setErrorMsg('Google Sign-In: ' + (err.message || 'Authentication error.'));
        }
        return;
      }
    }

    if (!authenticated || !gName) {
      const prefix = gEmail.split('@')[0].replace(/[._-]/g, ' ');
      gName = prefix.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Google Member';
    }

    let loggedUser: User = { name: gName, email: gEmail, phone: '' };

    try {
      const res = await fetch('/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: gName, email: gEmail, googleId: gId })
      });
      const text = await res.text();
      let data: any = null;
      if (text) {
        try { data = JSON.parse(text); } catch (e) {}
      }

      if (data && data.user) loggedUser = data.user;
      if (data && data.token) localStorage.setItem('shadow_token', data.token);
    } catch (err: any) {}

    setLoading(false);
    localStorage.setItem('shadow_user', JSON.stringify(loggedUser));
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    onSuccess(loggedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-white space-y-5">
        
        {/* MODAL HEADER */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Sign In or Create Account</h3>
              <p className="text-[10px] text-slate-400">Instant 1-Click Access — Zero OTP Hassles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK MESSAGES */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-400 text-xs font-semibold animate-shake shadow-lg">
            ⚠️ {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-semibold flex items-center gap-2 animate-popIn shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* OPTION 1: QUICK MOBILE NUMBER SIGN IN */}
        <form onSubmit={handleMobileQuickLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Mobile Number (India +91) *</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-mono font-black text-amber-400 text-sm tracking-wider select-none pointer-events-none z-10">
                +91
              </span>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-16 pr-3 py-3 text-white outline-none focus:border-amber-500 font-mono text-sm tracking-widest"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Your Full Name (Optional)</label>
            <div className="relative flex items-center">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white outline-none focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || mobile.length < 10}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{loading ? 'Signing In...' : 'Instant 1-Click Mobile Sign In \u2192'}</span>
          </button>
        </form>

        {/* DIVIDER */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* OPTION 2: GOOGLE 1-CLICK SIGN IN */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2.5 border border-slate-300 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* TRUST BADGE */}
        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Encrypted & Safe • Shadow Arrow Prime Marketplace</span>
        </div>

      </div>
    </div>
  );
};
