'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { Coins, Shield, Crown, Gem, Settings, Search, PlusCircle, MinusCircle, AlertCircle, RefreshCw, Loader2, DollarSign, Users, Clock, CheckCircle2 } from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : 'https://shadow-arrow-backend.onrender.com');

export default function AdminLoyaltyPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Config State
  const [conversionRate, setConversionRate] = useState(1.0);
  const [maxRedemptionPct, setMaxRedemptionPct] = useState(20.0);
  const [returnHoldDays, setReturnHoldDays] = useState(7);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState('');

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);

  // User Ledger Search State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUserLedger, setSearchedUserLedger] = useState<any>(null);
  const [searchingUser, setSearchingUser] = useState(false);

  // Manual Adjustment Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustUserSearch, setAdjustUserSearch] = useState('');
  const [adjustAmount, setAdjustAmount] = useState<number | ''>('');
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchLoyaltyData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchLoyaltyData = async (authToken: string) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      // Config
      const cfgRes = await axios.get(`${API_URL}/api/v1/admin/loyalty/config`, { headers });
      if (cfgRes.data) {
        setConversionRate(cfgRes.data.conversion_rate || 1.0);
        setMaxRedemptionPct(cfgRes.data.max_redemption_pct || 20.0);
        setReturnHoldDays(cfgRes.data.return_hold_delay_days || 7);
      }

      // Analytics
      const analyticsRes = await axios.get(`${API_URL}/api/v1/admin/loyalty/analytics`, { headers });
      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error('Failed to load loyalty data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSavingConfig(true);
    setConfigMsg('');
    try {
      const res = await axios.put(
        `${API_URL}/api/v1/admin/loyalty/config`,
        {
          conversion_rate: Number(conversionRate),
          max_redemption_pct: Number(maxRedemptionPct),
          return_hold_delay_days: Number(returnHoldDays),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        setConfigMsg('Global Loyalty configurations updated successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSearchUserLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSearchQuery.trim()) return;

    setSearchingUser(true);
    try {
      const query = userSearchQuery.trim();
      const url = `${API_URL}/api/v1/user/rewards?${query.includes('@') ? 'email=' : 'phone='}${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      if (res.data) {
        setSearchedUserLedger(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'User not found or has no rewards activity.');
      setSearchedUserLedger(null);
    } finally {
      setSearchingUser(false);
    }
  };

  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !adjustUserSearch.trim() || !adjustAmount || !adjustReason.trim()) {
      setAdjustError('Please fill all fields including mandatory audit reason note.');
      return;
    }

    setAdjusting(true);
    setAdjustError('');

    try {
      await axios.post(
        `${API_URL}/api/v1/admin/loyalty/adjust`,
        {
          user_search: adjustUserSearch.trim(),
          amount: Number(adjustAmount),
          type: adjustType,
          reason_note: adjustReason.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowAdjustModal(false);
      setAdjustAmount('');
      setAdjustReason('');
      fetchLoyaltyData(token);
      alert('Manual ArrowCoins adjustment processed successfully!');
    } catch (err: any) {
      setAdjustError(err.response?.data?.error || 'Failed to process manual adjustment');
    } finally {
      setAdjusting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-ops-900 flex items-center justify-center p-4 text-white font-mono">
        <p>Please authenticate from the Admin Gateway first.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => localStorage.removeItem('ops_admin_token')} />

      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto font-sans">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-ops-700">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Coins className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-mono font-bold text-white tracking-tight uppercase">
                ARROWCOINS LOYALTY CONTROLS
              </h1>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Global config settings, manual credits/debits & circulation liability metrics
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setAdjustUserSearch('');
                setShowAdjustModal(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center space-x-2 shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Manual Coin Adjustment</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="p-16 bg-ops-800 rounded-2xl border border-ops-700 text-center space-y-3 font-mono">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
            <p className="text-xs text-gray-400">Loading loyalty control metrics...</p>
          </div>
        ) : (
          <>
            {/* Analytics Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-gray-400 font-mono text-xs uppercase font-bold">
                  <span>Circulation Liability (INR)</span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-black text-white font-mono">
                    ₹{analytics?.total_liability_inr?.toLocaleString('en-IN') || '0'}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Total active coins: <strong className="text-amber-400">{analytics?.total_circulation_coins || 0} ArrowCoins</strong>
                  </p>
                </div>
              </div>

              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-gray-400 font-mono text-xs uppercase font-bold">
                  <span>Users Per Tier</span>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex justify-between items-center text-xs font-mono pt-1">
                  <div className="text-center">
                    <p className="text-gray-400 uppercase text-[10px] font-bold">Silver</p>
                    <p className="text-xl font-black text-slate-200">{analytics?.users_per_tier?.silver || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-amber-400 uppercase text-[10px] font-bold">Gold</p>
                    <p className="text-xl font-black text-amber-400">{analytics?.users_per_tier?.gold || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-cyan-400 uppercase text-[10px] font-bold">Diamond</p>
                    <p className="text-xl font-black text-cyan-400">{analytics?.users_per_tier?.diamond || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-gray-400 font-mono text-xs uppercase font-bold">
                  <span>Monthly Expired vs Redeemed</span>
                  <Clock className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex justify-between text-xs font-mono pt-1">
                  <div>
                    <p className="text-rose-400 font-bold uppercase text-[10px]">Expired (30d)</p>
                    <p className="text-xl font-black text-rose-400">{analytics?.monthly_expired_coins || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold uppercase text-[10px]">Redeemed (30d)</p>
                    <p className="text-xl font-black text-emerald-400">{analytics?.monthly_redeemed_coins || 0}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Global Configurations & Search User Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Global Config Form */}
              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center space-x-2 pb-3 border-b border-ops-700">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                    Global System Parameters
                  </h2>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Conversion Rate (1 Coin = X INR Discount)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={conversionRate}
                      onChange={(e) => setConversionRate(parseFloat(e.target.value))}
                      className="w-full bg-ops-900 border border-ops-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Max Order Redemption Cap (%)</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="100"
                      required
                      value={maxRedemptionPct}
                      onChange={(e) => setMaxRedemptionPct(parseFloat(e.target.value))}
                      className="w-full bg-ops-900 border border-ops-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Return Hold Delay Window (Days)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={returnHoldDays}
                      onChange={(e) => setReturnHoldDays(parseInt(e.target.value))}
                      className="w-full bg-ops-900 border border-ops-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {configMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{configMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider flex items-center justify-center space-x-2 transition disabled:opacity-50"
                  >
                    {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Global Configurations'}
                  </button>
                </form>
              </div>

              {/* User Search & Ledger Inspector */}
              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center space-x-2 pb-3 border-b border-ops-700">
                  <Search className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                    Search Customer Coin Ledger
                  </h2>
                </div>

                <form onSubmit={handleSearchUserLedger} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by customer phone or email..."
                    className="flex-1 bg-ops-900 border border-ops-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={searchingUser}
                    className="px-4 py-2.5 bg-ops-700 hover:bg-ops-600 text-white font-mono font-bold text-xs uppercase rounded-xl"
                  >
                    {searchingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </button>
                </form>

                {searchedUserLedger && (
                  <div className="space-y-4 pt-2 font-mono text-xs">
                    <div className="p-4 bg-ops-900 border border-ops-700 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Customer Tier</span>
                        <p className="text-base font-black text-amber-400 uppercase">{searchedUserLedger.current_tier}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Active Balance</span>
                        <p className="text-2xl font-black text-emerald-400">{searchedUserLedger.coin_balance} Coins</p>
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {searchedUserLedger.ledger?.map((tx: any, idx: number) => (
                        <div key={idx} className="p-3 bg-ops-900/60 border border-ops-700/80 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white text-[11px]">{tx.description}</p>
                            <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleString()}</p>
                          </div>
                          <span className={`font-black ${tx.type === 'CREDIT' || tx.type === 'REFUND' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.type === 'CREDIT' || tx.type === 'REFUND' ? `+${tx.amount}` : `-${tx.amount}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </>
        )}

      </main>

      {/* Manual Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ops-800 border border-ops-700 max-w-md w-full rounded-2xl p-6 shadow-2xl text-white space-y-4 font-mono">
            <h3 className="text-base font-bold uppercase tracking-wider text-white">Manual ArrowCoins Adjustment</h3>
            
            <form onSubmit={handleManualAdjustment} className="space-y-4 text-xs">
              {adjustError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adjustError}</span>
                </div>
              )}

              <div>
                <label className="block text-gray-400 uppercase mb-1">Target Customer Email / Phone</label>
                <input
                  type="text"
                  required
                  value={adjustUserSearch}
                  onChange={(e) => setAdjustUserSearch(e.target.value)}
                  placeholder="Enter email or phone"
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Adjustment Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full bg-ops-900 border border-ops-700 rounded-xl px-3 py-2.5 text-white font-bold"
                  >
                    <option value="CREDIT">CREDIT (+)</option>
                    <option value="DEBIT">DEBIT (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 uppercase mb-1">Coins Amount</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="e.g. 50"
                    className="w-full bg-ops-900 border border-ops-700 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Mandatory Audit Reason Note</label>
                <textarea
                  required
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Manual compensation for damaged shipping package ref #123"
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-3 bg-ops-700 hover:bg-ops-600 rounded-xl font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold uppercase shadow"
                >
                  {adjusting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
