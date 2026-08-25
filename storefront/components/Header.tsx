'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Bot, User, Menu, X, Coins, Shield, Crown, Gem, ChevronDown, Info } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onToggleAI: () => void;
}

export default function Header({ onSearch, onToggleAI }: HeaderProps) {
  const { totalCount, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coinPopoverOpen, setCoinPopoverOpen] = useState(false);
  const [rewardsInfo, setRewardsInfo] = useState<{
    coin_balance: number;
    current_tier: string;
    delivered_orders_12m?: number;
    next_tier?: string;
    orders_needed_for_next_tier?: number;
    expiring_in_30_days?: number;
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('shadow_user');
    if (saved) {
      setIsLoggedIn(true);
      try {
        const u = JSON.parse(saved);
        if (u.email || u.phone) {
          axios
            .get(`${API_URL}/api/v1/user/rewards?email=${encodeURIComponent(u.email || '')}&phone=${encodeURIComponent(u.phone || '')}`)
            .then((res) => {
              if (res.data) {
                setRewardsInfo({
                  coin_balance: res.data.coin_balance || 0,
                  current_tier: res.data.current_tier || 'SILVER',
                  delivered_orders_12m: res.data.delivered_orders_12m || 0,
                  next_tier: res.data.next_tier || '',
                  orders_needed_for_next_tier: res.data.orders_needed_for_next_tier || 0,
                  expiring_in_30_days: res.data.expiring_in_30_days || 0,
                });
              }
            })
            .catch(() => {});
        }
      } catch (e) {}
    }
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setCoinPopoverOpen(false);
      }
    };
    if (coinPopoverOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [coinPopoverOpen]);

  const renderTierIcon = (tier: string, size = 'sm') => {
    const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
    switch (tier) {
      case 'DIAMOND':
        return <Gem className={`${cls} text-cyan-400 shrink-0`} />;
      case 'GOLD':
        return <Crown className={`${cls} text-amber-400 shrink-0`} />;
      default:
        return <Shield className={`${cls} text-slate-300 shrink-0`} />;
    }
  };

  const tierColor = (tier: string) => {
    switch (tier) {
      case 'DIAMOND': return 'text-cyan-400';
      case 'GOLD': return 'text-amber-400';
      default: return 'text-slate-300';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d0e0f]/80 backdrop-blur-xl border-b border-[#343535]/50 shadow-2xl transition-colors duration-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="sa_logo_badge w-9 h-9 border border-[#00e0ff]/60 bg-[#121414] text-[#00e0ff] font-sora font-black text-sm tracking-tight flex items-center justify-center shadow-lg">
            SA
          </div>
          <span className="font-sora font-extrabold text-lg sm:text-xl tracking-widest text-white uppercase group-hover:text-[#00e0ff] transition-colors">
            SHADOW ARROW
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">
            Shop Catalog
          </Link>
          <Link href="/#catalog" className="hover:text-white transition-colors">
            Collections
          </Link>
        </nav>

        {/* Live Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search heavy tees, sneakers..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* ArrowCoins Badge — Popover (no redirect to /rewards) */}
          {isLoggedIn && rewardsInfo && (
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => setCoinPopoverOpen((prev) => !prev)}
                className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition shadow-sm"
                title="View ArrowCoins Balance & Tier Details"
              >
                <div className="p-1 bg-amber-500/20 text-amber-400 rounded-full">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <span className="text-amber-300 font-black">{rewardsInfo.coin_balance}</span>
                <span className="h-3.5 w-px bg-slate-800" />
                <div className="flex items-center space-x-1 text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                  {renderTierIcon(rewardsInfo.current_tier)}
                  <span className="hidden sm:inline">{rewardsInfo.current_tier}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${coinPopoverOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* ArrowCoins Detail Popover */}
              {coinPopoverOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/10 border-b border-slate-700/60 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black font-mono text-amber-300 uppercase">ArrowCoins Balance</p>
                        <p className="text-[10px] text-slate-400 font-mono">1 Coin = ₹1 INR Discount</p>
                      </div>
                    </div>
                    <span className="text-3xl font-black font-mono text-white">{rewardsInfo.coin_balance}</span>
                  </div>

                  {/* Tier Info */}
                  <div className="px-4 py-3 border-b border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {renderTierIcon(rewardsInfo.current_tier, 'md')}
                        <span className={`text-sm font-black font-mono uppercase ${tierColor(rewardsInfo.current_tier)}`}>
                          {rewardsInfo.current_tier} TIER
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rewardsInfo.delivered_orders_12m || 0} orders (12mo)
                      </span>
                    </div>
                    {(rewardsInfo.orders_needed_for_next_tier ?? 0) > 0 && (
                      <p className="text-[10px] text-slate-400 font-mono">
                        <span className="text-white font-bold">{rewardsInfo.orders_needed_for_next_tier}</span> more orders to unlock{' '}
                        <span className="font-bold text-amber-300">{rewardsInfo.next_tier}</span>
                      </p>
                    )}
                    {rewardsInfo.next_tier === 'MAX_TIER' && (
                      <p className="text-[10px] text-cyan-400 font-mono font-bold">👑 Highest Tier Achieved!</p>
                    )}
                  </div>

                  {/* How it works */}
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center space-x-1">
                      <Info className="w-3 h-3" />
                      <span>How ArrowCoins Work</span>
                    </p>
                    <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>🛡️ SILVER (0–4 orders)</span>
                        <span className="text-white font-bold">1% cashback, max 50/order</span>
                      </div>
                      <div className="flex justify-between">
                        <span>👑 GOLD (5–19 orders)</span>
                        <span className="text-amber-300 font-bold">2% cashback, max 100/order</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💎 DIAMOND (20+ orders)</span>
                        <span className="text-cyan-300 font-bold">5% cashback, max 200/order</span>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Max redeem: <strong className="text-white">5% of cart</strong></span>
                      <span>Coins expire: <strong className="text-white">after 365 days</strong></span>
                    </div>

                    {rewardsInfo.expiring_in_30_days && rewardsInfo.expiring_in_30_days > 0 ? (
                      <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] font-mono text-amber-300">
                        ⚠️ <strong>{rewardsInfo.expiring_in_30_days} coins</strong> expiring in 30 days!
                      </div>
                    ) : null}

                    <Link
                      href="/account"
                      onClick={() => setCoinPopoverOpen(false)}
                      className="mt-2 w-full block text-center py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs uppercase font-mono rounded-xl transition"
                    >
                      View Full History →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shadow AI Stylist Button */}
          <button
            onClick={onToggleAI}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3.5 py-2 rounded-full text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shadow AI</span>
          </button>

          {/* User Account / Profile Button */}
          <Link
            href="/account"
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-full border border-slate-800 transition active:scale-95 relative"
            title="User Account & Orders"
          >
            <User className="w-5 h-5" />
            {isLoggedIn && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
            )}
          </Link>

          {/* Cart Icon & Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full border border-slate-800 transition active:scale-95"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {totalCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search items..."
            className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
          />
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-300">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              Shop Catalog
            </Link>
            <Link href="/#catalog" onClick={() => setMobileMenuOpen(false)}>
              Collections
            </Link>
            <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>User Account Profile</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
