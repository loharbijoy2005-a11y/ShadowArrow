import React from 'react';
import { Sparkles, ShieldCheck, Truck, Award, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types';

interface WelcomeModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, user, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative max-w-md w-full bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl z-[101] text-center transform transition-all animate-in fade-in zoom-in-95">
        
        {/* GLOWING BADGE */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>
        </div>

        <div>
          <span className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs px-3 py-1 rounded-full font-mono mb-2">
            👑 SHADOW ARROW ELITE MEMBER
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome, {user.name || 'Valued Customer'}! 🎉
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Your account is 100% verified & synced with MongoDB Atlas Live.
          </p>
        </div>

        {/* PERKS LIST */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Free Express Air Shipping</div>
              <div className="text-[10px] text-slate-400">Priority fulfillment direct from Warehouse 722157</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">100% Authentic Brand Warranty</div>
              <div className="text-[10px] text-slate-400">Downloadable Official GST Invoices & Certificates</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">VIP Priority Customer Support</div>
              <div className="text-[10px] text-slate-400">24/7 dedicated assistant via Shadow AI</div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 transform hover:scale-[1.02]"
        >
          <span>Explore Market Deals</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
