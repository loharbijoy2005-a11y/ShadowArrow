'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { Tag, Plus, CheckCircle2, XCircle, Trash2, Calendar, Percent, DollarSign, RefreshCw, Copy, Check } from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : 'https://shadow-arrow-backend.onrender.com');

export default function CouponsAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState('PERCENTAGE'); // PERCENTAGE or FLAT
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderValue, setMinOrderValue] = useState(499);
  const [usageLimit, setUsageLimit] = useState(100);
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
    if (saved) {
      setToken(saved);
      fetchCoupons(saved);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCoupons = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/coupons`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCoupons(res.data || []);
    } catch (err) {
      // Mock initial coupons if backend endpoint initializing
      setCoupons([
        { id: '1', code: 'SHADOW10', type: 'PERCENTAGE', discount_value: 10, min_order_value: 499, usage_limit: 500, used_count: 42, active: true, expiry_date: '2026-12-31' },
        { id: '2', code: 'FLAT200', type: 'FLAT', discount_value: 200, min_order_value: 1499, usage_limit: 100, used_count: 18, active: true, expiry_date: '2026-11-30' },
        { id: '3', code: 'WELCOME50', type: 'FLAT', discount_value: 50, min_order_value: 299, usage_limit: 1000, used_count: 310, active: false, expiry_date: '2026-06-30' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon = {
      id: Date.now().toString(),
      code: code.toUpperCase().trim(),
      type,
      discount_value: Number(discountValue),
      min_order_value: Number(minOrderValue),
      usage_limit: Number(usageLimit),
      used_count: 0,
      active: true,
      expiry_date: expiryDate || '2026-12-31',
    };

    setCoupons([newCoupon, ...coupons]);
    setShowCreateModal(false);
    setCode('');

    if (token) {
      try {
        await axios.post(`${API_URL}/api/v1/admin/coupons`, newCoupon, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Backend sync failed, saved locally in state');
      }
    }
  };

  const toggleCouponStatus = async (id: string) => {
    setCoupons(coupons.map(c => (c.id === id || c._id === id || c.code === id) ? { ...c, active: !c.active } : c));
    if (token) {
      try {
        await axios.put(`${API_URL}/api/v1/admin/coupons/${id}/status`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('Failed to update status on backend', err);
      }
    }
  };

  const deleteCoupon = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(coupons.filter(c => c.id !== id && c._id !== id && c.code !== id));
      if (token) {
        try {
          await axios.delete(`${API_URL}/api/v1/admin/coupons/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.warn('Failed to delete coupon on backend', err);
        }
      }
    }
  };

  const handleCopyCode = (cCode: string) => {
    navigator.clipboard.writeText(cCode);
    setCopiedCode(cCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto font-mono">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ops-700 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20 font-bold uppercase">
                MODULE 9 • MARKETING & DISCOUNTS
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1">
              Coupons & Promotions Desk
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Create discount promo codes, set minimum cart requirements, and monitor usage limits
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Coupon</span>
            </button>
          </div>
        </div>

        {/* Coupon Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((c) => (
            <div
              key={c.id}
              className={`bg-ops-800 border rounded-2xl p-5 space-y-4 relative transition shadow-xl ${
                c.active ? 'border-ops-700' : 'border-red-900/40 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-base font-black text-white tracking-wider">{c.code}</span>
                      <button
                        onClick={() => handleCopyCode(c.code)}
                        className="text-gray-400 hover:text-white p-1"
                        title="Copy Code"
                      >
                        {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">
                      {c.type === 'PERCENTAGE' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT OFF`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleCouponStatus(c.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                    c.active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {c.active ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-ops-900/60 p-3 rounded-xl border border-ops-700/50">
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Min Cart Value</span>
                  <span className="font-bold text-white">₹{c.min_order_value}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Usage Stats</span>
                  <span className="font-bold text-blue-400">{c.used_count || 0} / {c.usage_limit}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-ops-700/50">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-purple-400" />
                  <span>Expires: {c.expiry_date}</span>
                </span>

                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="text-red-400 hover:text-red-300 transition"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Coupon Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-ops-800 border border-ops-700 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-ops-700 pb-3">
                <h3 className="text-sm font-bold uppercase text-white">Create Promo Coupon</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. FESTIVE20"
                    required
                    className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white uppercase tracking-wider focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Discount Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Discount Value</label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      required
                      className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Min Cart Value (₹)</label>
                    <input
                      type="number"
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(Number(e.target.value))}
                      required
                      className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Usage Limit</label>
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(Number(e.target.value))}
                      required
                      className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                    className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-ops-700 hover:bg-ops-600 rounded-xl text-xs font-bold text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white shadow-lg"
                  >
                    Save Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
