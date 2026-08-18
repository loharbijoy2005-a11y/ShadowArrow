'use client';

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function FloatingCartBar() {
  const { totalCount, subtotal, setIsCartOpen, isCartOpen } = useCart();

  if (totalCount === 0 || isCartOpen) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-40 font-sans animate-in fade-in slide-in-from-bottom-6 duration-300">
      <button
        onClick={() => setIsCartOpen(true)}
        className="bg-slate-900/95 hover:bg-black text-white px-5 py-3 rounded-full shadow-2xl border border-blue-500/40 backdrop-blur-xl flex items-center space-x-4 transition-all duration-300 hover:scale-105 active:scale-95 group"
      >
        {/* Cart Icon & Badge */}
        <div className="relative">
          <div className="p-2 bg-blue-600 rounded-full text-white shadow">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
            {totalCount}
          </span>
        </div>

        {/* Text Details */}
        <div className="text-left font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs uppercase tracking-wider text-white">View Cart</span>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded-full font-bold">
              {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <p className="text-xs font-black text-emerald-400">₹{subtotal.toLocaleString('en-IN')}</p>
        </div>

        {/* Arrow Trigger */}
        <div className="p-1.5 bg-slate-800 group-hover:bg-blue-600 rounded-full text-slate-300 group-hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    </div>
  );
}
