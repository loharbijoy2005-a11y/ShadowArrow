'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Sparkles, User, Menu, X, Coins, Shield, Crown, Gem } from 'lucide-react';
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
  const [rewardsInfo, setRewardsInfo] = useState<{
    coin_balance: number;
    current_tier: string;
  } | null>(null);

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
                });
              }
            })
            .catch(() => {});
        }
      } catch (e) {}
    }
  }, []);

  const renderTierIcon = (tier: string) => {
    switch (tier) {
      case 'DIAMOND':
        return <Gem className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'GOLD':
        return <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl transition-colors duration-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="sa_logo_badge w-9 h-9 rounded-lg text-sm tracking-tight font-black shadow-lg">
            SA
          </div>
          <span className="shadow_arrow_logo font-black text-xl tracking-tighter text-white uppercase">
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
          <Link href="/rewards" className="hover:text-amber-400 transition-colors flex items-center space-x-1.5 font-bold font-mono text-xs text-amber-400/90">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>ArrowCoins Passbook</span>
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
          
          {/* ArrowCoins User Tier & Balance Badge */}
          {isLoggedIn && rewardsInfo && (
            <Link
              href="/rewards"
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition shadow-sm"
              title="View ArrowCoins Passbook & Tier Benefits"
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
            </Link>
          )}

          {/* Shadow AI Stylist Button */}
          <button
            onClick={onToggleAI}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3.5 py-2 rounded-full text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stylist Advice</span>
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
