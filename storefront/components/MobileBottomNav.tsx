'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bot, User, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface MobileBottomNavProps {
  onToggleAI: () => void;
}

export default function MobileBottomNav({ onToggleAI }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0e0f]/90 backdrop-blur-2xl border-t border-[#343535]/50 flex justify-around items-center h-16 px-4 md:hidden pb-safe">
      {/* Home Link */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center transition-all ${
          pathname === '/'
            ? 'text-[#00e0ff] bg-[#1e2020] px-3 py-1 rounded-full'
            : 'text-[#bac9cd] hover:text-[#00e0ff]'
        }`}
      >
        <Home className="w-4 h-4 mb-0.5" />
        <span className="font-label-caps text-[9px] tracking-widest uppercase">HOME</span>
      </Link>

      {/* Explore Catalog */}
      <a
        href="#catalog"
        className="flex flex-col items-center justify-center text-[#bac9cd] hover:text-[#00e0ff] transition-all"
      >
        <Compass className="w-4 h-4 mb-0.5" />
        <span className="font-label-caps text-[9px] tracking-widest uppercase">EXPLORE</span>
      </a>

      {/* AI Stylist Assistant */}
      <button
        onClick={onToggleAI}
        className="flex flex-col items-center justify-center text-[#00e0ff] hover:text-cyan-300 transition-all"
      >
        <Bot className="w-4 h-4 mb-0.5 animate-pulse" />
        <span className="font-label-caps text-[9px] tracking-widest uppercase">AI LAB</span>
      </button>

      {/* Cart Quick Toggle */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center justify-center text-[#bac9cd] hover:text-[#00e0ff] transition-all relative"
      >
        <div className="relative">
          <ShoppingBag className="w-4 h-4 mb-0.5" />
          {totalCount > 0 && (
            <span className="absolute -top-2 -right-2.5 bg-[#00e0ff] text-[#050505] text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
              {totalCount}
            </span>
          )}
        </div>
        <span className="font-label-caps text-[9px] tracking-widest uppercase">CART</span>
      </button>

      {/* User Account */}
      <Link
        href="/account"
        className={`flex flex-col items-center justify-center transition-all ${
          pathname.startsWith('/account')
            ? 'text-[#00e0ff] bg-[#1e2020] px-3 py-1 rounded-full'
            : 'text-[#bac9cd] hover:text-[#00e0ff]'
        }`}
      >
        <User className="w-4 h-4 mb-0.5" />
        <span className="font-label-caps text-[9px] tracking-widest uppercase">PROFILE</span>
      </Link>
    </nav>
  );
}

