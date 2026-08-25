'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { BarChart3, DollarSign, ShoppingBag, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : 'https://shadow-arrow-backend.onrender.com');

export default function AnalyticsAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchAnalytics(savedToken);
    } else {
      window.location.href = '/';
    }
  }, []);

  const fetchAnalytics = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/analytics`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center pb-6 border-b border-ops-700">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight text-white">SYSTEM ANALYTICS & INVENTORY HEALTH</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">Gross merchandise value, order volume, and low stock telemetry</p>
          </div>
          <button
            onClick={() => token && fetchAnalytics(token)}
            className="p-2.5 bg-ops-800 border border-ops-700 rounded-lg text-gray-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-ops-800 border border-ops-700 rounded-xl p-6 space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-mono uppercase tracking-wider">Gross Revenue</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-mono font-bold text-white">
              ₹{analytics ? analytics.total_revenue?.toLocaleString('en-IN') : '0'}
            </p>
            <p className="text-xs text-gray-400 font-mono">Calculated from PAID & COD orders</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-xl p-6 space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-mono uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-mono font-bold text-white">
              {analytics ? analytics.total_orders : '0'}
            </p>
            <p className="text-xs text-gray-400 font-mono">Processed across all customer channels</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-xl p-6 space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-mono uppercase tracking-wider">Low Stock Inventory</span>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-mono font-bold text-white">
              {analytics ? analytics.low_stock_count : '0'}
            </p>
            <p className="text-xs text-amber-400 font-mono">Items below 10 unit threshold</p>
          </div>
        </div>

        {/* Low Stock Telemetry Table */}
        <div className="bg-ops-800 border border-ops-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-300">
            Low Stock Inventory Warnings (&lt; 10 units)
          </h2>

          <div className="divide-y divide-ops-700 border border-ops-700 rounded-lg overflow-hidden">
            {analytics?.low_stock_warnings && analytics.low_stock_warnings.length > 0 ? (
              analytics.low_stock_warnings.map((prod: any) => (
                <div key={prod.id || prod._id} className="p-4 bg-ops-900 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white text-sm">{prod.title}</p>
                    <p className="text-xs text-gray-400 font-mono">Category: {prod.category} • Price: ₹{prod.price}</p>
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded font-mono font-bold text-xs">
                      {prod.stock} units remaining
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 font-mono text-xs">
                All catalog items maintain healthy inventory levels (&ge; 10 units).
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
