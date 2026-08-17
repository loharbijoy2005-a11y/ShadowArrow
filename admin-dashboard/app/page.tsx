'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { Lock, ShieldCheck, DollarSign, ShoppingBag, AlertTriangle, ArrowUpRight, TrendingUp, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchAnalytics(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const res = await axios.post(`${API_URL}/api/v1/admin/login`, { passcode });
      if (res.data && res.data.token) {
        localStorage.setItem('ops_admin_token', res.data.token);
        setToken(res.data.token);
        fetchAnalytics(res.data.token);
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Authentication failed. Verify master passkey.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ops_admin_token');
    setToken(null);
  };

  const fetchAnalytics = async (authToken: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/analytics`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-ops-900 flex items-center justify-center p-4">
        <div className="bg-ops-800 border border-ops-700 max-w-md w-full rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-600/20 text-blue-400 rounded-xl mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-mono font-bold text-white tracking-wider">OPS CONTROL GATEWAY</h1>
            <p className="text-xs text-gray-400 font-mono">Restricted Access • Master Security Clearance Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Master Security Passkey</label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-ops-900 border border-ops-700 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-center space-x-2 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Authenticate Gateway'}</span>
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-[11px] text-gray-500 font-mono">Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100">
      <Navigation onLogout={handleLogout} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center pb-6 border-b border-ops-700">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight text-white">OPS CONTROL OVERVIEW</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">Real-time fulfillment metrics & inventory monitor</p>
          </div>
          <div className="flex items-center space-x-3 bg-ops-800 border border-ops-700 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 font-medium">Gateway Active</span>
          </div>
        </header>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs uppercase tracking-wider font-bold">Total Sales Revenue</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white">
              ₹{analytics ? analytics.total_revenue?.toLocaleString('en-IN') : '0'}
            </p>
            <div className="flex items-center space-x-1 text-xs text-emerald-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Verified Revenue</span>
            </div>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs uppercase tracking-wider font-bold">Customer Orders</span>
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white">
              {analytics ? analytics.total_orders : '0'}
            </p>
            <p className="text-xs text-gray-400">Total Orders Placed</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs uppercase tracking-wider font-bold">Cancelled / Refunded</span>
              <XCircle className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-3xl font-black text-rose-400">
              {analytics?.status_breakdown ? analytics.status_breakdown.cancelled || 0 : '0'}
            </p>
            <p className="text-xs text-rose-400/80 font-bold">Cancelled & Refunded</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs uppercase tracking-wider font-bold">Inventory Alerts</span>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-white">
              {analytics ? analytics.low_stock_count : '0'}
            </p>
            <p className="text-xs text-amber-400">Low Stock (&lt; 10 units left)</p>
          </div>
        </div>

        {/* Order Status Breakdown */}
        {analytics?.status_breakdown && (
          <section className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">Fulfillment Pipeline Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-ops-900 border border-ops-700 rounded-xl text-center space-y-1">
                <p className="text-xs text-gray-400 uppercase font-bold">Confirmed</p>
                <p className="text-2xl font-black text-blue-400">{analytics.status_breakdown.confirmed}</p>
              </div>
              <div className="p-4 bg-ops-900 border border-ops-700 rounded-xl text-center space-y-1">
                <p className="text-xs text-gray-400 uppercase font-bold">Processing</p>
                <p className="text-2xl font-black text-amber-400">{analytics.status_breakdown.processing}</p>
              </div>
              <div className="p-4 bg-ops-900 border border-ops-700 rounded-xl text-center space-y-1">
                <p className="text-xs text-gray-400 uppercase font-bold">Shipped</p>
                <p className="text-2xl font-black text-cyan-400">{analytics.status_breakdown.shipped}</p>
              </div>
              <div className="p-4 bg-ops-900 border border-ops-700 rounded-xl text-center space-y-1">
                <p className="text-xs text-gray-400 uppercase font-bold">Delivered</p>
                <p className="text-2xl font-black text-emerald-400">{analytics.status_breakdown.delivered}</p>
              </div>
              <div className="p-4 bg-ops-900 border border-rose-500/30 bg-rose-500/5 rounded-xl text-center space-y-1">
                <p className="text-xs text-rose-400 uppercase font-bold">Cancelled</p>
                <p className="text-2xl font-black text-rose-400">{analytics.status_breakdown.cancelled || 0}</p>
              </div>
            </div>
          </section>
        )}

        {/* Low Stock Warnings */}
        {analytics?.low_stock_warnings && analytics.low_stock_warnings.length > 0 && (
          <section className="bg-ops-800 border border-ops-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider">Critical Low Stock Inventory</h2>
            </div>
            <div className="divide-y divide-ops-700 border border-ops-700 rounded-lg overflow-hidden">
              {analytics.low_stock_warnings.map((prod: any) => (
                <div key={prod.id || prod._id} className="p-4 bg-ops-900 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white text-sm">{prod.title}</p>
                    <p className="text-xs text-gray-400 font-mono">Category: {prod.category} • HSN: {prod.specs?.hsn_code || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded font-mono font-bold text-xs">
                      {prod.stock} units left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
