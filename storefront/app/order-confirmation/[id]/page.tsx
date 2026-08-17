'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import TaxInvoiceModal from '@/components/TaxInvoiceModal';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { CheckCircle2, FileText, Truck, ArrowRight, ShieldCheck } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/orders/track/${encodeURIComponent(id)}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to fetch order details', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full space-y-8">
        
        {/* Success Header Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-8 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              ORDER CONFIRMED & VERIFIED
            </span>
            <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tight mt-2">Thank You for Your Order!</h1>
            <p className="text-xs text-gray-500 font-mono mt-1">Order Ref ID: <strong className="text-slate-900 font-bold">{order?.order_id || id}</strong></p>
          </div>

          <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
            Your package is being prepared for dispatch at our warehouse. An email confirmation has been sent with real-time tracking updates.
          </p>

          <div className="pt-4 flex justify-center space-x-4">
            <button
              onClick={() => setInvoiceOpen(true)}
              className="px-6 py-3 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-slate-800 transition flex items-center space-x-2 shadow-lg"
            >
              <FileText className="w-4 h-4" />
              <span>View GST Tax Invoice</span>
            </button>

            <button
              onClick={() => router.push(`/track-order`)}
              className="px-6 py-3 bg-white border border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-slate-50 transition flex items-center space-x-2"
            >
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Track Courier Status</span>
            </button>
          </div>
        </div>

        {/* Order Details Summary */}
        {order && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="font-bold text-slate-900 uppercase font-mono text-sm">Package Contents</h2>
              <span className="font-mono text-gray-500">ETA: {order.delivery_eta || '3-5 Days'}</span>
            </div>

            <div className="space-y-3">
              {order.items && order.items.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-900">{it.title}</p>
                    <p className="text-[11px] text-gray-500">Size: {it.size || 'Standard'} • Quantity: {it.quantity}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">₹{(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono">
              <div>
                <p className="text-gray-600 font-sans text-xs">
                  Payment Method:{' '}
                  <strong className={order.payment_method === 'COD' ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'}>
                    {order.payment_method === 'COD' ? 'Cash on Delivery (COD)' : 'ONLINE'}
                  </strong>
                </p>
                {order.payment_method !== 'COD' && order.razorpay_payment_id && (
                  <p className="text-[11px] text-slate-600 font-mono mt-1 flex items-center space-x-1.5">
                    <span>Txn ID:</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 font-mono select-all">
                      {order.razorpay_payment_id}
                    </span>
                  </p>
                )}
              </div>
              <span className="text-lg font-bold text-slate-900">₹{order.total_amount ? order.total_amount.toFixed(2) : '0.00'}</span>
            </div>
          </div>
        )}
      </main>

      {invoiceOpen && order && (
        <TaxInvoiceModal order={order} onClose={() => setInvoiceOpen(false)} />
      )}
    </div>
  );
}
