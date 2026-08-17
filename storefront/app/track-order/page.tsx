'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';
import { Search, Package, Truck, CheckCircle2, AlertCircle, Clock, Calendar, Copy, Check, FileText, CheckCircle } from 'lucide-react';
import TaxInvoiceModal from '@/components/TaxInvoiceModal';
import MobileBottomNav from '@/components/MobileBottomNav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchTrackOrder = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    setCopiedAwb(false);

    try {
      const res = await axios.get(`${API_URL}/api/v1/orders/track/${encodeURIComponent(searchQuery.trim())}`);
      setOrder(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No active order matches the provided Order ID or Phone Number.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackOrder(query);
  };

  const copyAwb = (awbText: string) => {
    navigator.clipboard.writeText(awbText);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const getStepActive = (status: string, stepIndex: number) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED') return true;
    if (s === 'SHIPPED' || s === 'IN_TRANSIT' || s === 'OUT_FOR_DELIVERY') return stepIndex <= 2;
    if (s === 'CONFIRMED' || s === 'PROCESSING') return stepIndex <= 1;
    return stepIndex === 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-xs font-mono font-bold rounded-full border border-blue-200 uppercase">
            REAL-TIME LOGISTICS TRACKING
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight">Track Your Package</h1>
          <p className="text-xs text-slate-500 font-mono">
            Track using <strong>Order ID</strong> (e.g. <code>SA-20260817-XXXX</code>) OR <strong>10-Digit Mobile Number</strong>
          </p>
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
              placeholder="Enter Order ID or 10-Digit Mobile Number"
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
            
            {/* Header Status & Order ID */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
                  LATEST ACTIVE ORDER
                </span>
                <h2 className="text-2xl font-black font-mono text-slate-900 mt-0.5">#{order.order_id}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Order Date: <span className="text-slate-800 font-bold">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold rounded-xl flex items-center space-x-1.5 transition border border-slate-200"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Tax Invoice</span>
                </button>

                <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase border ${
                  order.order_status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  order.order_status === 'SHIPPED' || order.order_status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                  order.order_status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-300' :
                  'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {order.order_status}
                </span>
              </div>
            </div>

            {/* Delivered Special Banner */}
            {order.order_status === 'DELIVERED' ? (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start space-x-4">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-emerald-950 font-mono uppercase">🎉 Package Delivered Successfully!</h3>
                  <p className="text-xs text-emerald-800 leading-relaxed font-mono">
                    Order <strong>#{order.order_id}</strong> has been handed over to <strong>{order.customer_name}</strong> at <strong>{order.shipping_address}</strong>.
                  </p>
                  <p className="text-[11px] text-emerald-700 font-mono font-semibold pt-1">
                    Thank you for shopping with SHADOW ARROW Prime Marketplace!
                  </p>
                </div>
              </div>
            ) : (
              /* In-Transit ETA Banner */
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated Delivery Date</p>
                    <p className="font-bold text-slate-900 text-sm">{order.delivery_eta}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px] uppercase">IN-TRANSIT</span>
              </div>
            )}

            {/* Logistics Status Progress Bar */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <p className="text-[10px] font-bold font-mono text-slate-500 uppercase">Live Delivery Milestones</p>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                {['Confirmed', 'Processing', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                  const active = getStepActive(order.order_status, idx);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className={`h-2 rounded-full transition-all ${active ? 'bg-blue-600' : 'bg-slate-200'}`} />
                      <p className={`font-bold truncate ${active ? 'text-slate-900' : 'text-slate-400'}`}>{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AWB Courier Shipment Card */}
            {(order.awb_number || order.tracking_number) && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-950 font-mono uppercase">
                      🚚 Courier Partner: {order.courier_partner || order.courier_name || 'Express Courier'}
                    </p>
                    <p className="text-xs font-mono text-purple-800 font-bold mt-0.5">
                      AWB Tracking No: <span className="text-slate-900 font-black">{order.awb_number || order.tracking_number}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
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

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase font-mono">Recipient & Contact</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{order.customer_name} ({order.customer_phone})</p>
                <p className="text-slate-500 font-mono text-[11px]">{order.customer_email}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase font-mono">Payment Mode & Total</p>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">₹{order.total_amount?.toFixed(2)} ({order.payment_method})</p>
                <p className="text-slate-500 font-mono text-[11px]">Payment Status: <strong className="text-emerald-700 uppercase">{order.payment_status}</strong></p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase font-mono">Delivery Address</p>
              <p className="font-semibold text-slate-900">{order.shipping_address}</p>
            </div>

            {/* Recent / Other Orders Picker if available */}
            {order.recent_orders && order.recent_orders.length > 1 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <p className="text-[11px] font-bold font-mono text-slate-900 uppercase">
                  📜 All Orders Found for this Phone Number ({order.recent_orders.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {order.recent_orders.map((o: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(o.order_id);
                        fetchTrackOrder(o.order_id);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono text-left transition ${
                        order.order_id === o.order_id
                          ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-bold">#{o.order_id}</span>
                      <span className="text-[10px] opacity-80 block">{o.order_status} • ₹{o.total_amount?.toFixed(0)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tax Invoice Modal */}
        {showInvoiceModal && order && (
          <TaxInvoiceModal order={order} onClose={() => setShowInvoiceModal(false)} />
        )}
      </main>

      <Footer />
      <MobileBottomNav onToggleAI={() => {}} />
    </div>
  );
}
