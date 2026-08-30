'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { UserPlus, Smartphone, ArrowRight, Loader2 } from 'lucide-react';
import { auth, signInWithGoogle, getRedirectResult } from '@/lib/firebase';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function AccountRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle redirect result on page load (mobile Google Sign-In)
  useEffect(() => {
    setGoogleLoading(true);
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return;
        const user = result.user;
        const userObj = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: user.phoneNumber || '',
          photoURL: user.photoURL || '',
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
        };
        try { await axios.post(`${API_URL}/api/v1/auth/google-sync`, userObj); } catch (e) {}
        localStorage.setItem('shadow_user', JSON.stringify(userObj));
        router.push('/account');
      })
      .catch((err) => {
        if (err.code !== 'auth/no-current-user') setError(err.message || 'Google sign-in fail hua.');
      })
      .finally(() => setGoogleLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle();
      if (!result) return; // Mobile redirect — result comes via useEffect
      const user = result.user;
      const userObj = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: user.phoneNumber || '',
        photoURL: user.photoURL || '',
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      };
      try {
        await axios.post(`${API_URL}/api/v1/auth/google-sync`, userObj);
      } catch (err) {
        console.warn('Backend sync note:', err);
      }
      localStorage.setItem('shadow_user', JSON.stringify(userObj));
      router.push('/account');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Please enter a valid Full Name and 10-digit Phone Number starting with 6-9.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Check if phone is already linked to any account
      const checkRes = await axios.get(`${API_URL}/api/v1/user/profile?phone=${encodeURIComponent(phone.trim())}`);
      if (checkRes.data && checkRes.data.phone) {
        setError('This phone number is already linked to an account. Please Sign In.');
        setLoading(false);
        return;
      }
    } catch (err: any) {
      // 404 is expected since the user shouldn't exist. If it's a different error, log it.
      if (err.response?.status !== 404) {
        console.warn('Phone uniqueness check API note:', err);
      }
    }

    try {
      // 2. Call phone-login to register the account on the backend
      const res = await axios.post(`${API_URL}/api/v1/auth/phone-login`, {
        name: fullName.toUpperCase().trim(),
        phone: phone.trim(),
        email: `${phone.trim()}@shadowarrow.com`,
      });

      const userObj = {
        ...res.data,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('shadow_user', JSON.stringify(userObj));
      router.push('/account');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-600/20 text-blue-400 rounded-2xl mb-1">
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Create Account</h1>
            <p className="text-xs text-slate-400">Join SHADOW ARROW via 1-Click Google or Direct Phone Login.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs text-center font-mono">
              {error}
            </div>
          )}

          {/* Option 1: 1-Click Firebase Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-3 shadow-lg transition active:scale-98 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            )}
            <span>Sign up with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-mono font-bold">OR DIRECT REGISTER</span>
          </div>

          {/* Option 2: Direct Phone Register */}
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1.5 uppercase font-mono">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter Full Name"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5 uppercase font-mono">10-Digit Phone Number</label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-Digit Phone Number"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/account/login" className="text-blue-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
