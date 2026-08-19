'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bot, Truck, User, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface MobileBottomNavProps {
  onToggleAI: () => void;
}

export default function MobileBottomNav({ onToggleAI }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2 text-white shadow-2xl">
      <div className="flex items-center justify-around text-[10px] font-mono">
        {/* Home Link */}
        <Link
          href="/"
          className={`flex flex-col items-center space-y-1 transition ${
            pathname === '/' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        {/* AI Stylist Assistant */}
        <button
          onClick={onToggleAI}
          className="flex flex-col items-center space-y-1 text-blue-400 hover:text-blue-300 transition"
        >
          <div className="relative">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <span>Shadow AI</span>
        </button>

        {/* Cart Quick Toggle */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center space-y-1 text-slate-400 hover:text-white transition relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* User Account */}
        <Link
          href="/account"
          className={`flex flex-col items-center space-y-1 transition ${
            pathname.startsWith('/account') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Account</span>
        </Link>
      </div>
    </div>
  );
}
