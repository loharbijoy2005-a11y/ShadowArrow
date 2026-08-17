'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { User, Smartphone, ArrowRight, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '@/lib/firebase';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function AccountLoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // State for post-Google phone number linking modal
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null);
  const [googleMobileInput, setGoogleMobileInput] = useState('');
  const [googleMobileError, setGoogleMobileError] = useState('');
  const [linkingLoading, setLinkingLoading] = useState(false);

  // Option 1: Firebase Google Sign-In with MongoDB Profile Sync & Mandatory Mobile Prompt
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const baseUserPayload = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Customer',
        email: user.email || '',
        phone: user.phoneNumber || '',
        photo_url: user.photoURL || '',
      };

      // Try initial sync with backend
      let existingPhone = user.phoneNumber || '';
      try {
        const syncRes = await axios.post(`${API_URL}/api/v1/auth/google-sync`, baseUserPayload);
        if (syncRes.data && syncRes.data.phone) {
          existingPhone = syncRes.data.phone;
        }
      } catch (err) {
        console.warn('Initial google sync offline fallback', err);
      }

      // If user has no phone number linked, prompt them to enter mobile number
      if (!existingPhone || !/^[6-9]\d{9}$/.test(existingPhone)) {
        setPendingGoogleUser(baseUserPayload);
        setShowPhoneModal(true);
        setGoogleLoading(false);
        return;
      }

      // If phone is already linked, complete login
      const mergedUser = {
        ...baseUserPayload,
        phone: existingPhone,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('shadow_user', JSON.stringify(mergedUser));
      router.push('/account');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Submit phone number to link with Google profile in MongoDB
  const handleLinkGoogleMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleMobileInput.trim() || !/^[6-9]\d{9}$/.test(googleMobileInput.trim())) {
      setGoogleMobileError('Please enter a valid 10-digit Indian phone number starting with 6-9.');
      return;
    }

    setLinkingLoading(true);
    setGoogleMobileError('');

    try {
      const updatedPayload = {
        ...pendingGoogleUser,
        phone: googleMobileInput.trim(),
      };

      const syncRes = await axios.post(`${API_URL}/api/v1/auth/google-sync`, updatedPayload);
      const mergedUser = {
        ...(syncRes.data || updatedPayload),
        phone: googleMobileInput.trim(),
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('shadow_user', JSON.stringify(mergedUser));
      setShowPhoneModal(false);
      router.push('/account');
    } catch (err: any) {
      // Fallback local save if backend sync fails
      const fallbackUser = {
        ...pendingGoogleUser,
        phone: googleMobileInput.trim(),
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('shadow_user', JSON.stringify(fallbackUser));
      setShowPhoneModal(false);
      router.push('/account');
    } finally {
      setLinkingLoading(false);
    }
  };

  // Option 2: Direct Phone Login with Backend Merging
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Full Name and a valid 10-digit Phone Number (starting 6-9) are compulsory.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/v1/auth/phone-login`, {
        name: fullName.toUpperCase().trim(),
        phone: phone.trim(),
        email: '',
      });

      const mergedUser = {
        ...res.data,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('shadow_user', JSON.stringify(mergedUser));
      router.push('/account');
    } catch (err: any) {
      // Local fallback
      const fallbackUser = {
        name: fullName.toUpperCase().trim(),
        phone: phone.trim(),
        email: '',
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('shadow_user', JSON.stringify(fallbackUser));
      router.push('/account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="bg-white border border-slate-200 max-w-md w-full rounded-3xl p-8 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-slate-900 text-white rounded-2xl mb-1">
              <User className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">SHADOW ARROW Auth</h1>
            <p className="text-xs text-slate-500">Sign in via 1-Click Google or Direct 10-Digit Phone Login.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-mono">
              {error}
            </div>
          )}

          {/* Option 1: 1-Click Firebase Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-3 shadow transition active:scale-98 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] text-slate-400 uppercase font-mono font-bold">OR PHONE LOGIN</span>
          </div>

          {/* Option 2: Direct Phone Login */}
          <form onSubmit={handlePhoneLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 uppercase font-mono">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter Full Name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1.5 uppercase font-mono">
                10-Digit Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-Digit Mobile Number"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow disabled:opacity-50"
            >
              <span>{loading ? 'Logging In...' : 'Continue with Phone'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Mandatory Mobile Linking Modal for Google Sign-In Users */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-md w-full rounded-3xl p-8 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-1">
                <Smartphone className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">Link Your Mobile Number</h2>
              <p className="text-xs text-slate-500">
                Hi <span className="font-bold text-slate-900">{pendingGoogleUser?.name}</span>! Please enter your 10-digit mobile number to complete your profile & enable order tracking.
              </p>
            </div>

            {googleMobileError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-mono">
                {googleMobileError}
              </div>
            )}

            <form onSubmit={handleLinkGoogleMobile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1.5 uppercase font-mono">
                  10-Digit Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={googleMobileInput}
                    onChange={(e) => setGoogleMobileInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-Digit Mobile Number"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={linkingLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow disabled:opacity-50"
              >
                {linkingLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Link Mobile & Complete Profile</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
