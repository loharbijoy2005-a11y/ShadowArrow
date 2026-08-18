'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartToast() {
  const { toast, setToast, setIsCartOpen } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Delay clearing the state slightly for slide-out animation to complete
        setTimeout(() => setToast(null), 300);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast) return null;

  const handleCheckout = () => {
    setIsVisible(false);
    setToast(null);
    router.push('/checkout');
  };

  const handleViewCart = () => {
    setIsVisible(false);
    setToast(null);
    setIsCartOpen(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setToast(null), 300);
  };

  return (
    <div
      className={`fixed bottom-24 md:bottom-8 right-4 sm:right-8 z-50 max-w-sm w-[calc(100vw-2rem)] bg-slate-950/95 border-2 border-blue-500/50 rounded-3xl p-4 shadow-2xl backdrop-blur-xl text-white font-sans transition-all duration-300 ease-out transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Success Icon */}
        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>

        {/* Text details */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-blue-400">
              Added to Cart
            </span>
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close Notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-3 pt-1.5">
            <img
              src={toast.image}
              alt={toast.title}
              className="w-12 h-12 object-cover rounded-xl border border-slate-800 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-white truncate leading-snug">
                {toast.title}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {toast.size && <span>Size: {toast.size} • </span>}
                <span className="text-emerald-400 font-bold">₹{toast.price}</span>
              </p>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="grid grid-cols-2 gap-2 pt-3 font-mono text-[10px]">
            <button
              onClick={handleViewCart}
              className="py-2 bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl transition flex items-center justify-center space-x-1 uppercase font-bold"
            >
              <ShoppingBag className="w-3 h-3 text-blue-400" />
              <span>View Cart</span>
            </button>

            <button
              onClick={handleCheckout}
              className="py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition flex items-center justify-center space-x-1 uppercase font-bold shadow-md shadow-blue-600/25"
            >
              <span>Checkout</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
