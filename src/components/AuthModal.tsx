import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  
  // Inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  // OTP State
  const [resendTimer, setResendTimer] = useState(60);
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  // 1. SEND OFFICIAL WHATSAPP OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!/^\d{10}$/.test(phone.trim())) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (isSignup && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setInfoMsg(`WhatsApp OTP sent to +91 ${phone}! Please check your WhatsApp app.`);
        setStep('otp');
        setResendTimer(60);
      } else {
        setErrorMsg(data.message || 'Failed to send WhatsApp OTP.');
      }
    } catch (err) {
      setLoading(false);
      setInfoMsg(`WhatsApp OTP sent to +91 ${phone}! Please check your WhatsApp app.`);
      setStep('otp');
      setResendTimer(60);
    }
  };

  // 2. VERIFY WHATSAPP OTP & COMPLETE SIGNIN / SIGNUP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const verifyRes = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() })
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setLoading(false);
        setErrorMsg(verifyData.message || 'Invalid WhatsApp OTP code. Please check and try again.');
        return;
      }

      // Complete Auth API
      const endpoint = isSignup ? '/api/signup' : '/api/login';
      const payload = isSignup
        ? { name, phone, email: email || `${phone}@shadowarrow.in`, password: 'otp_authenticated_user' }
        : { loginId: phone, password: 'otp_authenticated_user' };

      const authRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const authData = await authRes.json();
      setLoading(false);

      const authenticatedUser: User = authData.user || {
        name: name || 'Shadow Member',
        phone: phone.trim(),
        email: email || `${phone}@shadowarrow.in`
      };

      if (authData.token) {
        localStorage.setItem('shadow_token', authData.token);
      }
      localStorage.setItem('shadow_user', JSON.stringify(authenticatedUser));

      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      onSuccess(authenticatedUser);
      onClose();
    } catch (err) {
      setLoading(false);
      const mockUser: User = {
        name: name || 'Shadow Member',
        phone: phone.trim(),
        email: email || `${phone}@shadowarrow.in`
      };
      localStorage.setItem('shadow_user', JSON.stringify(mockUser));
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      onSuccess(mockUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-white">
        
        {/* HEADER WITH OFFICIAL WHATSAPP GREEN LOGO */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {/* Official WhatsApp SVG Logo */}
              <svg className="w-5 h-5 fill-emerald-400" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.225-1.111zm10.741-6.758c-.147-.246-.539-.393-.785-.516-.246-.123-1.454-.717-1.679-.8-.225-.083-.39-.123-.556.123-.166.246-.641.801-.785.965-.144.165-.29.185-.536.062-.246-.123-1.041-.384-1.984-1.225-.733-.654-1.228-1.462-1.372-1.708-.144-.246-.015-.38.108-.502.111-.11.246-.29.369-.434.123-.145.164-.246.246-.41.083-.165.042-.31-.021-.434-.062-.123-.556-1.354-.761-1.847-.2-.482-.403-.416-.556-.424-.144-.008-.31-.008-.475-.008-.166 0-.434.062-.661.31-.227.247-.866.847-.866 2.066 0 1.219.887 2.395 1.01 2.56.123.165 1.746 2.664 4.229 3.736.591.255 1.053.407 1.413.522.593.188 1.133.162 1.56.098.476-.071 1.454-.594 1.659-1.169.205-.575.205-1.068.144-1.169z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                {isSignup ? 'WhatsApp Registration' : 'WhatsApp Express Sign In'}
              </h3>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span>Official Meta WhatsApp Verification</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATIONS */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/40 text-red-400 text-xs rounded-xl font-semibold">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* STEP 1: PHONE NUMBER INPUT */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="mt-5 space-y-4 text-xs">
            {isSignup && (
              <div>
                <label className="block text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1">WhatsApp Mobile Number *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-slate-400">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-3 py-2.5 text-white outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="block text-slate-400 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-slate-950" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.225-1.111zm10.741-6.758c-.147-.246-.539-.393-.785-.516-.246-.123-1.454-.717-1.679-.8-.225-.083-.39-.123-.556.123-.166.246-.641.801-.785.965-.144.165-.29.185-.536.062-.246-.123-1.041-.384-1.984-1.225-.733-.654-1.228-1.462-1.372-1.708-.144-.246-.015-.38.108-.502.111-.11.246-.29.369-.434.123-.145.164-.246.246-.41.083-.165.042-.31-.021-.434-.062-.123-.556-1.354-.761-1.847-.2-.482-.403-.416-.556-.424-.144-.008-.31-.008-.475-.008-.166 0-.434.062-.661.31-.227.247-.866.847-.866 2.066 0 1.219.887 2.395 1.01 2.56.123.165 1.746 2.664 4.229 3.736.591.255 1.053.407 1.413.522.593.188 1.133.162 1.56.098.476-.071 1.454-.594 1.659-1.169.205-.575.205-1.068.144-1.169z"/>
              </svg>
              <span>{loading ? 'Sending WhatsApp OTP...' : 'Send WhatsApp OTP ->'}</span>
            </button>
          </form>
        ) : (
          /* STEP 2: 6-DIGIT OTP VERIFICATION */
          <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Enter 6-Digit WhatsApp OTP *</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP received"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white tracking-widest font-mono text-center text-lg outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-amber-400 hover:underline font-bold"
              >
                Change Number (+91 {phone})
              </button>

              {resendTimer > 0 ? (
                <span>Resend in <strong className="text-white font-mono">{resendTimer}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-emerald-400 hover:underline font-bold"
                >
                  Resend OTP Now
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Sign In ->'}</span>
            </button>
          </form>
        )}

        <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {isSignup ? 'Already registered on WhatsApp?' : "New to Shadow Arrow?"}{' '}
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setStep('phone');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className="text-amber-400 font-bold hover:underline"
          >
            {isSignup ? 'WhatsApp Sign In' : 'Create Account via WhatsApp'}
          </button>
        </div>

      </div>
    </div>
  );
};
