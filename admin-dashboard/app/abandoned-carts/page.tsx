'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { ShoppingCart, Phone, MessageSquare, Mail, RefreshCw, Clock, ArrowRight, UserCheck, Package } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) {
      setToken(saved);
      fetchAbandonedCarts(saved);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAbandonedCarts = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/abandoned-carts`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCarts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch abandoned carts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/';
  };

  const totalAbandonedValue = carts.reduce((acc, c) => acc + (c.total_amount || 0), 0);
  const totalCartItems = carts.reduce((acc, c) => acc + (c.items ? c.items.length : 0), 0);

  const getWhatsAppLink = (phone: string, name: string, items: any[]) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const num = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const itemListStr = items.map((i) => `• ${i.title} (Qty: ${i.quantity})`).join('\n');
    const msg = `Hi ${name || 'there'}! 👋 We noticed you left some stylish items in your SHADOW ARROW cart:\n\n${itemListStr}\n\nComplete your order now & claim FREE express delivery! 🚀\nShop now: http://localhost:3000/checkout`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={handleLogout} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ops-700 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 font-mono text-xs rounded border border-blue-500/20 font-bold uppercase">
                REMARKETING & LEADS HUB
              </span>
            </div>
            <h1 className="text-3xl font-black font-mono tracking-tight text-white mt-1">
              Abandoned Carts Monitor
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Live persistent cart tracking & instant customer follow-up portal
            </p>
          </div>

          <button
            onClick={() => token && fetchAbandonedCarts(token)}
            className="flex items-center space-x-2 px-4 py-2 bg-ops-700 hover:bg-ops-600 border border-ops-600 rounded-xl text-xs font-mono text-gray-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Leads</span>
          </button>
        </div>

        {/* Analytics Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-mono font-bold uppercase">Active Lead Carts</span>
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-black font-mono text-white">{carts.length}</p>
            <p className="text-[11px] text-gray-500 font-mono">Uncompleted customer checkouts</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-mono font-bold uppercase">Recoverable Revenue</span>
              <span className="text-emerald-400 font-bold font-mono text-lg">₹</span>
            </div>
            <p className="text-3xl font-black font-mono text-emerald-400">₹{totalAbandonedValue.toFixed(2)}</p>
            <p className="text-[11px] text-gray-500 font-mono">Total value waiting in carts</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-mono font-bold uppercase">Total Pending Items</span>
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-black font-mono text-white">{totalCartItems}</p>
            <p className="text-[11px] text-gray-500 font-mono">Individual product units in cart</p>
          </div>
        </div>

        {/* Abandoned Carts Table */}
        <div className="bg-ops-800 border border-ops-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-ops-700 flex justify-between items-center">
            <h2 className="font-mono font-bold text-sm uppercase text-white tracking-wider">
              Customer Cart Session Registry ({carts.length})
            </h2>
            <span className="text-xs font-mono text-gray-400">Real-time LocalStorage + DB Sync</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400 font-mono text-xs">
              Loading active cart sessions...
            </div>
          ) : carts.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-mono text-xs">
              No abandoned carts found in database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-ops-700/50 text-gray-400 border-b border-ops-700 font-bold uppercase">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Cart Contents</th>
                    <th className="p-4 text-right">Total Value</th>
                    <th className="p-4">Last Updated</th>
                    <th className="p-4 text-center">Follow-up Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ops-700/50">
                  {carts.map((c) => (
                    <tr key={c.id || c.session_id} className="hover:bg-ops-700/30 transition">
                      
                      {/* Customer Info */}
                      <td className="p-4 space-y-1">
                        <p className="font-bold text-white text-sm">{c.customer_name || 'Guest User'}</p>
                        <p className="text-blue-400 font-bold">{c.customer_phone || 'Phone not provided'}</p>
                        <p className="text-gray-400 text-[11px]">{c.customer_email || 'Email not provided'}</p>
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {c.status === 'PENDING_ONLINE_PAYMENT' ? (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold">
                              ⏳ PENDING ONLINE PAY
                            </span>
                          ) : c.status === 'PAYMENT_CANCELLED' ? (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-[10px] font-bold">
                              ❌ PAY POPUP CANCELLED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[10px] font-bold">
                              🛒 ABANDONED CART
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 bg-ops-700 text-gray-400 rounded text-[9px]">
                            ID: {c.session_id ? c.session_id : 'Unknown'}
                          </span>
                        </div>
                      </td>

                      {/* Items List */}
                      <td className="p-4">
                        <div className="space-y-2 max-w-xs">
                          {c.items && c.items.map((it: any, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2 bg-ops-900/60 p-2 rounded-lg border border-ops-700/50">
                              {it.image && (
                                <img src={it.image} alt={it.title} className="w-8 h-8 rounded object-cover shrink-0" />
                              )}
                              <div className="truncate">
                                <p className="font-bold text-gray-200 truncate">{it.title}</p>
                                <p className="text-[10px] text-gray-400">
                                  Size: {it.size || 'Default'} • Qty: {it.quantity} • ₹{it.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 text-right font-bold text-emerald-400 text-sm">
                        ₹{c.total_amount ? c.total_amount.toFixed(2) : '0.00'}
                      </td>

                      {/* Last Updated */}
                      <td className="p-4 text-gray-400">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          <span>{new Date(c.updated_at).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Follow-up Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          {c.customer_phone ? (
                            <>
                              <a
                                href={getWhatsAppLink(c.customer_phone, c.customer_name, c.items || [])}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl transition flex items-center space-x-1 font-bold text-[11px]"
                                title="Send WhatsApp Cart Reminder"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>WhatsApp</span>
                              </a>

                              <a
                                href={`tel:${c.customer_phone}`}
                                className="p-2.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition flex items-center space-x-1 font-bold text-[11px]"
                                title="Call Customer"
                              >
                                <Phone className="w-4 h-4" />
                                <span>Call</span>
                              </a>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-500 italic">No phone details</span>
                          )}

                          {c.customer_email && (
                            <a
                              href={`mailto:${c.customer_email}?subject=Your SHADOW ARROW Cart is Waiting!&body=Hi ${c.customer_name || 'Customer'},\n\nWe saved your cart items! Complete your purchase today with Free Delivery: http://localhost:3000/checkout`}
                              className="p-2.5 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded-xl transition flex items-center space-x-1 font-bold text-[11px]"
                              title="Send Email Reminder"
                            >
                              <Mail className="w-4 h-4" />
                              <span>Email</span>
                            </a>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
