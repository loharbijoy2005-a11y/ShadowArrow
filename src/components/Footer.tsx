import React from 'react';
import { Truck, RefreshCw, Headset, ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (type: 'about' | 'privacy' | 'terms' | 'returns') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 4 KEY TRUST BADGES GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800/80">
          
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div className="text-left">
              <div className="text-xs font-black text-white uppercase">3 - 4 Days Express Delivery</div>
              <div className="text-[11px] text-slate-400">Prime Free Delivery on orders &gt; ₹999</div>
            </div>
          </div>

          {/* 100% SECURE PAYMENT WITH MATCHED SHIELDCHECK ICON */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                <span>100% Secure Payment</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-slate-400">Powered by</span>
                {/* Official Razorpay Badge */}
                <span className="inline-flex items-center bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black text-blue-400 tracking-tight">
                  <span className="text-white font-extrabold">Razor</span>pay
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <div className="text-left">
              <div className="text-xs font-black text-white uppercase">Easy 7-Day Returns</div>
              <div className="text-[11px] text-slate-400">Hassle-free replacement policy</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Headset className="w-8 h-8 text-purple-400 flex-shrink-0" />
            <div className="text-left">
              <div className="text-xs font-black text-white uppercase">24/7 AI Support</div>
              <div className="text-[11px] text-slate-400">Instant Shadow AI care</div>
            </div>
          </div>

        </div>

        {/* FOOTER LINKS & LEGAL MODAL TRIGGERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10 text-left">
          <div className="space-y-3">
            <div className="font-black text-xl text-white">
              SHADOW <span className="text-amber-500">ARROW</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              India's premier high-performance marketplace for gaming peripherals, dark-mode accessories, curved displays, & techwear apparel.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-white text-sm mb-3">Customer Service</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onOpenLegal('about')} className="hover:text-amber-400 transition">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('returns')} className="hover:text-amber-400 transition">
                  7-Day Return Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-amber-400 transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('terms')} className="hover:text-amber-400 transition">
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white text-sm mb-3">Popular Departments</h4>
            <ul className="space-y-2 text-xs">
              <li>Gaming Mechanical Keyboards</li>
              <li>26K DPI Wireless Mice</li>
              <li>34" Ultra-Wide 2K Curved Monitors</li>
              <li>Cyberpunk Shadow Bomber Jackets</li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white text-sm mb-3">Official Payment Gateways</h4>
            <p className="text-xs text-slate-400 mb-3">Supports UPI, Google Pay, PhonePe, Cards, NetBanking, & Cash on Delivery.</p>
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 border border-slate-800 text-[11px] font-bold text-white px-2.5 py-1 rounded-lg">
                Razorpay
              </span>
              <span className="bg-slate-900 border border-slate-800 text-[11px] font-bold text-emerald-400 px-2.5 py-1 rounded-lg">
                UPI / GPay
              </span>
              <span className="bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-400 px-2.5 py-1 rounded-lg">
                COD Active
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <div>2026 SHADOW ARROW — Registered E-Commerce. <span className="text-slate-400 font-mono">GSTIN: <strong className="text-amber-400 font-bold">19BVKPL6301H1ZH</strong></span></div>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">Privacy Policy</a>
            <button onClick={() => onOpenLegal('terms')} className="hover:text-slate-400">Terms of Service</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
