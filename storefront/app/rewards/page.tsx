'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Coins, Shield, Crown, Gem, AlertTriangle, ArrowUpRight, CheckCircle2, Clock, XCircle, RefreshCw, Loader2, Info } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function RewardsPassbookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rewardsData, setRewardsData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('shadow_user');
    if (!savedUserStr) {
      router.push('/account/login');
      return;
    }

    try {
      const u = JSON.parse(savedUserStr);
      setUser(u);
      fetchRewardsData(u.phone, u.email);
    } catch (e) {
      router.push('/account/login');
    }
  }, []);

  const fetchRewardsData = async (phone: string, email: string) => {
    setLoading(true);
    try {
      let queryUrl = `${API_URL}/api/v1/user/rewards?`;
      if (email) queryUrl += `email=${encodeURIComponent(email)}&`;
      if (phone) queryUrl += `phone=${encodeURIComponent(phone)}`;

      const res = await axios.get(queryUrl);
      if (res.data) {
        setRewardsData(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch rewards passbook', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'DIAMOND':
        return <Gem className="w-8 h-8 text-cyan-400 shrink-0" />;
      case 'GOLD':
        return <Crown className="w-8 h-8 text-amber-400 shrink-0" />;
      default:
        return <Shield className="w-8 h-8 text-slate-300 shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 pb-28 w-full space-y-8">
        
        {/* Header & Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-xl">
                <Coins className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase font-mono tracking-tight">
                ArrowCoins Rewards Passbook
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              1 ArrowCoin = ₹1 INR Checkout Discount • 3-Tier Rolling Membership Loyalty
            </p>
          </div>

          <button
            onClick={() => user && fetchRewardsData(user.phone, user.email)}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-mono text-xs font-bold rounded-xl transition flex items-center space-x-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Ledger</span>
          </button>
        </div>

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading ArrowCoins passbook ledger...</p>
          </div>
        ) : (
          <>
            {/* Expiration Alert Banner */}
            {rewardsData?.expiring_in_30_days > 0 && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-3 text-amber-900 text-xs shadow-sm font-mono">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
                    <AlertTriangle className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase text-amber-950">Expiry Warning</h3>
                    <p className="text-slate-700 mt-0.5">
                      <strong className="text-amber-900 font-black text-sm">{rewardsData.expiring_in_30_days} ArrowCoins</strong> are expiring in the next 30 days. Use them before expiry!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/checkout')}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shrink-0 shadow"
                >
                  Redeem Now
                </button>
              </div>
            )}

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Active Balance Card */}
              <div className="bg-slate-900 text-white p-7 rounded-3xl border border-slate-800 shadow-2xl space-y-5 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider">
                      TOTAL ACTIVE BALANCE
                    </span>
                    <div className="flex items-baseline space-x-2 mt-2">
                      <span className="text-5xl font-black font-mono text-white tracking-tight">
                        {rewardsData?.coin_balance || 0}
                      </span>
                      <span className="text-sm font-bold text-amber-400 font-mono">ArrowCoins</span>
                    </div>
                  </div>
                  <div className="p-3.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
                    <Coins className="w-8 h-8" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Redemption Rate: <strong>1 Coin = ₹1 INR</strong></span>
                  <span>Max Cart Cap: <strong>20% Total Cart</strong></span>
                </div>
              </div>

              {/* Tier Status & Progress Card */}
              <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">
                      12-MONTH ROLLING MEMBERSHIP TIER
                    </span>
                    <h2 className="text-2xl font-black font-mono text-slate-900 mt-1 uppercase flex items-center space-x-2">
                      <span>{rewardsData?.current_tier || 'SILVER'} TIER</span>
                    </h2>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-2xl">
                    {getTierIcon(rewardsData?.current_tier || 'SILVER')}
                  </div>
                </div>

                {/* Tier Perks Badges */}
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {rewardsData?.current_tier === 'DIAMOND' && (
                    <>
                      <span className="px-3 py-1 bg-cyan-50 text-cyan-800 border border-cyan-300 font-bold rounded-full">
                        💎 3% Coin Cashback (Max 200/ord)
                      </span>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold rounded-full">
                        🚚 Free Express Delivery Flag Enabled
                      </span>
                      <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 font-bold rounded-full">
                        👑 Priority 24/7 VIP Support
                      </span>
                    </>
                  )}
                  {rewardsData?.current_tier === 'GOLD' && (
                    <>
                      <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 font-bold rounded-full">
                        👑 2% Coin Cashback (Max 100/ord)
                      </span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-300 font-bold rounded-full">
                        ⭐ Priority Support Flag Enabled
                      </span>
                    </>
                  )}
                  {rewardsData?.current_tier === 'SILVER' && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-full">
                      🛡️ 1% Coin Cashback (Max 50/ord)
                    </span>
                  )}
                </div>

                {/* Next Tier Progress Bar */}
                <div className="space-y-2 pt-2 border-t border-slate-100 font-mono text-xs">
                  <div className="flex justify-between items-center text-slate-700 font-bold">
                    <span>
                      {rewardsData?.next_tier === 'MAX_TIER'
                        ? 'Highest Tier Achieved!'
                        : `Progress to ${rewardsData?.next_tier} Tier`}
                    </span>
                    <span className="text-slate-500">
                      {rewardsData?.delivered_orders_12m} / {rewardsData?.current_tier === 'SILVER' ? 5 : 15} Orders Delivered
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, rewardsData?.progress_pct || 0)}%` }}
                    />
                  </div>
                  {rewardsData?.orders_needed_for_next_tier > 0 && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Deliver <strong className="text-slate-900 font-bold">{rewardsData.orders_needed_for_next_tier} more order(s)</strong> in rolling 12 months to unlock {rewardsData.next_tier} Tier.
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* 3-Tier Hierarchy Rules Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 font-mono text-xs">
              <h3 className="font-bold text-slate-900 uppercase flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>3-Tier Membership Earning Rules</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span>SILVER TIER (0-4 Orders)</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">Earn 1% Coin Cashback (1 Coin per ₹100 spent), max 50 coins per order.</p>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-amber-900">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>GOLD TIER (5-14 Orders)</span>
                  </div>
                  <p className="text-amber-800 text-[11px]">Earn 2% Coin Cashback (2 Coins per ₹100 spent), max 100 coins per order. Priority Support flag enabled.</p>
                </div>

                <div className="p-4 bg-cyan-50/50 border border-cyan-200 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-cyan-950">
                    <Gem className="w-4 h-4 text-cyan-500" />
                    <span>DIAMOND TIER (15+ Orders)</span>
                  </div>
                  <p className="text-cyan-900 text-[11px]">Earn 3% Coin Cashback (3 Coins per ₹100 spent), max 200 coins per order. Free Express Delivery flag enabled.</p>
                </div>
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base uppercase text-slate-900 font-mono">
                  Transaction Ledger History ({rewardsData?.ledger?.length || 0})
                </h3>
              </div>

              {rewardsData?.ledger?.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-mono space-y-2">
                  <Coins className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs">No ArrowCoins transactions recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                        <th className="p-3">Date</th>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Coins Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rewardsData?.ledger?.map((tx: any, idx: number) => {
                        const isCredit = tx.type === 'CREDIT' || tx.type === 'REFUND';
                        const dateStr = new Date(tx.created_at || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });

                        return (
                          <tr key={tx.id || idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 text-slate-600">{dateStr}</td>
                            <td className="p-3 font-bold text-slate-900">
                              {tx.order_code ? `#${tx.order_code}` : 'N/A'}
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                tx.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                tx.type === 'REFUND' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700 max-w-xs truncate">{tx.description}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tx.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                                tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                tx.status === 'USED' ? 'bg-slate-200 text-slate-700' :
                                tx.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className={`p-3 text-right font-black text-sm ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isCredit ? `+${tx.amount}` : `-${tx.amount}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </>
        )}

      </main>

      <MobileBottomNav onToggleAI={() => {}} />
    </div>
  );
}
