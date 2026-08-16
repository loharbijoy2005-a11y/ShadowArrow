'use client';

import React, { useState } from 'react';
import { Package, X, Search, Truck, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function TrackOrderBubbleModal() {
  const [modalOpen, setModalOpen] = useState(false);
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
      setError(err.response?.data?.message || 'No active order matches the provided Order ID or Phone Number.');
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
    <>
      {/* Icon-Only Circular Floating Track Order Bubble at Bottom-Right */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-full shadow-2xl border border-slate-700 transition-all hover:scale-105 flex items-center justify-center"
        title="Track Order Status"
        aria-label="Track Order Status"
      >
        <Package className="w-5 h-5 text-white" />
      </button>

      {/* Centered Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 relative space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase text-slate-900 font-mono">Live Order Tracking</h2>
                  <p className="text-[11px] text-slate-500 font-mono">Real-time status & courier AWB pipeline</p>
                </div>
              </div>
              <button
                onClick={() => { setModalOpen(false); setOrder(null); setError(''); setQuery(''); }}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleTrack} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Order ID (SA-YYYYMMDD-XXXX) or Phone"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
              >
                {loading ? 'Tracking...' : 'Search'}
              </button>
            </form>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Order Details Card */}
            {order && (
              <div className="space-y-4 pt-2 border-t border-slate-200 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">ORDER ID</span>
                    <h3 className="text-xl font-black font-mono text-slate-900">#{order.order_id}</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">Est. Delivery: <strong className="text-slate-900">{order.delivery_eta}</strong></p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
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
                  <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-purple-900 font-mono uppercase">
                        🚚 {order.courier_partner || order.courier_name || 'Courier Partner'}
                      </p>
                      <p className="text-xs font-mono font-black text-slate-900 mt-0.5">
                        AWB: {order.awb_number || order.tracking_number}
                      </p>
                    </div>

                    <button
                      onClick={() => copyAwb(order.awb_number || order.tracking_number)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-[11px] rounded-lg flex items-center space-x-1 shadow transition"
                    >
                      {copiedAwb ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy AWB</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <p><strong className="text-slate-900">Customer:</strong> {order.customer_name} ({order.customer_phone})</p>
                  <p><strong className="text-slate-900">Address:</strong> {order.shipping_address}</p>
                  <p><strong className="text-slate-900">Total:</strong> ₹{order.total_amount?.toFixed(2)} ({order.payment_method})</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
