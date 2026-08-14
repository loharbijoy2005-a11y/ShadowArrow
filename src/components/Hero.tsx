import React from 'react';
import { Zap, ArrowRight, ShieldCheck, Truck, Star } from 'lucide-react';

interface HeroProps {
  onExploreDeals: () => void;
  onOpenAi: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreDeals, onOpenAi }) => {
  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 lg:py-16 border-b border-slate-800/80 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* HERO TEXT CONTENT */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 shadow-sm">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-black text-amber-300 tracking-wider uppercase">
                ⚡ ROTATING FESTIVAL DEALS (Updates Every 5 Hours)
              </span>
            </div>

            <h1 className="font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none">
              Shadow Arrow <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Live Deal Rotator
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Automatic rotating discounts every 5 hours with 3 - 4 Days Express Delivery across India. Shop top mechanical gear, curved monitors, & techwear apparel.
            </p>

            {/* CTA BUTTONS & CALLOUT */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreDeals}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.4)] transition transform hover:-translate-y-0.5 flex items-center gap-3"
              >
                <span>Explore Deals</span>
                <span className="bg-slate-950 text-amber-400 text-xs px-2 py-0.5 rounded-md font-bold">UP TO 60% OFF</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenAi}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm px-6 py-3.5 rounded-xl transition flex items-center gap-2"
              >
                <span>Shadow AI Finder</span>
              </button>
            </div>

            {/* STATS */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0 text-left">
              <div>
                <div className="font-black text-xl text-white flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-amber-500" /> 100%
                </div>
                <div className="text-[11px] text-slate-400">Genuine Prime Gear</div>
              </div>
              <div>
                <div className="font-black text-xl text-emerald-400 flex items-center gap-1">
                  <Truck className="w-4 h-4 text-emerald-400" /> 3 - 4 Days
                </div>
                <div className="text-[11px] text-slate-400">Express Delivery</div>
              </div>
              <div>
                <div className="font-black text-xl text-amber-400 flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 5.0 ★
                </div>
                <div className="text-[11px] text-slate-400">Verified Quality</div>
              </div>
            </div>

          </div>

          {/* HERO MEDIA IMAGE CARD */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl p-4 group">
              <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src="/assets/hero_banner.png"
                  alt="Shadow Arrow Prime Banner"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Zap className="w-3.5 h-3.5 fill-slate-950" /> 60% OFF Prime Deal
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-0.5">Featured Prime Edition</div>
                  <h3 className="font-black text-lg sm:text-xl text-white">Shadow Stealth Pro Gaming Setup</h3>
                  <p className="text-xs text-slate-300 line-clamp-1">Hot-swappable keyboard + 26K DPI Mouse + 2K Curved Screen</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
