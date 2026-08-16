'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import axios from 'axios';
import { Search, Package, Truck, CheckCircle, AlertCircle, Clock, Calendar, Copy, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedAwb, setCopiedAwb] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);
    setCopiedAwb(false);

    try {
      const res = await axios.get(`${API_URL}/api/v1/orders/track/${encodeURIComponent(query.trim())}`);
      setOrder(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No order matches the provided Order ID, Email, or Phone Number.');
    } finally {
      setLoading(false);
    }
  };

  const copyAwb = (awbText: string) => {
    navigator.clipboard.writeText(awbText);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1 bg-slate-100 text-slate-900 text-xs font-mono font-bold rounded-full border border-slate-300">
            REAL-TIME LOGISTICS TRACKING
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight">Track Your Shipment</h1>
          <p className="text-xs text-slate-500 font-mono">Enter your Order ID (format: SA-YYYYMMDD-XXXX) or registered phone number</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTrack} className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. SA-20260816-1234 or Enter Phone Number"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Package'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs text-center flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Order Details Card */}
        {order && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">VERIFIED ORDER</span>
                <h2 className="text-2xl font-black font-mono text-slate-900">#{order.order_id}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Estimated Delivery: <strong className="text-slate-900">{order.delivery_eta}</strong></p>
              </div>

              <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase border ${
                order.order_status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                order.order_status === 'SHIPPED' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                order.order_status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-300' :
                'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {order.order_status}
              </span>
            </div>

            {/* AWB Shipment Card */}
            {(order.awb_number || order.tracking_number) && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-950 font-mono uppercase">
                      🚚 Shipped via {order.courier_partner || order.courier_name || 'Express Courier'}
                    </p>
                    <p className="text-xs font-mono text-purple-800 font-bold mt-0.5">
                      AWB / Tracking: <span className="text-slate-900 font-black">{order.awb_number || order.tracking_number}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => copyAwb(order.awb_number || order.tracking_number)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow"
                >
                  {copiedAwb ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy AWB</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase font-mono">Customer Name & Phone</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{order.customer_name} ({order.customer_phone})</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase font-mono">Payment Mode & Total</p>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">₹{order.total_amount?.toFixed(2)} ({order.payment_method})</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p><strong className="text-slate-900">Destination Address:</strong> {order.shipping_address}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
