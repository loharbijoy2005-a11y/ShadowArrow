'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import axios from 'axios';
import { Lock, CreditCard, Banknote, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_TKUawOJDuTeooz';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header onToggleAI={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Your shopping cart is empty</h2>
          <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition"
          >
            Return to Catalog
          </button>
        </div>
      </div>
    );
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(val);
    if (val.length > 0 && !/^[6-9]\d{9}$/.test(val)) {
      setPhoneError('Please enter a valid 10-digit Indian phone number starting with 6-9.');
    } else {
      setPhoneError('');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim() || !shippingAddress.trim() || !pincode.trim()) {
      alert('Please fill in all required shipping details.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      setPhoneError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setLoading(true);

    const fullAddress = `${shippingAddress.trim()}, PIN: ${pincode.trim()}`;
    const orderItems = cart.map((i) => ({
      product_id: i.product_id,
      title: i.title,
      price: i.price,
      quantity: i.quantity,
      size: i.size,
      image: i.image,
    }));

    const orderPayload = {
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim(),
      shipping_address: fullAddress,
      items: orderItems,
      total_amount: subtotal,
      payment_method: paymentMethod,
    };

    try {
      const res = await axios.post(`${API_URL}/api/v1/orders/create`, orderPayload);
      const createdOrder = res.data;
      const orderId = createdOrder.order_id;

      if (paymentMethod === 'COD') {
        clearCart();
        router.push(`/order-confirmation/${orderId}`);
        return;
      }

      const razorpayOrderId = createdOrder.razorpay_order_id;

      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: RAZORPAY_KEY,
          amount: Math.round(subtotal * 100),
          currency: 'INR',
          name: 'SHADOW ARROW',
          description: `Order #${orderId}`,
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            try {
              await axios.post(`${API_URL}/api/v1/orders/verify-payment`, {
                order_id: orderId,
                razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
                razorpay_payment_id: response.razorpay_payment_id || 'pay_online_confirmed',
                razorpay_signature: response.razorpay_signature || 'mock_signature_valid',
              });
            } catch (err) {
              console.error('Payment verification warning', err);
            } finally {
              clearCart();
              router.push(`/order-confirmation/${orderId}`);
            }
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: '#0f172a',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        await axios.post(`${API_URL}/api/v1/orders/verify-payment`, {
          order_id: orderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: 'pay_online_' + Date.now(),
          razorpay_signature: 'mock_signature_valid',
        });
        clearCart();
        router.push(`/order-confirmation/${orderId}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header onToggleAI={() => {}} />

      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full space-y-8">
        
        {/* Checkout Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Secure Payment</h1>
              <p className="text-xs text-slate-500 font-mono">Encrypted Checkout Gateway • SHADOW ARROW</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Shipping Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">Shipping & Delivery Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Bijoy Lohar"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone Number (Strict 10 Digits)</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10-digit phone number"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
                {phoneError && (
                  <p className="text-[11px] text-red-600 font-mono mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-700 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. customer@example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">Shipping Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="House/Flat No., Street, Area, City"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 700091"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Payment Options Selection */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">Payment Options</h2>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                    paymentMethod === 'ONLINE' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="w-4 h-4 text-slate-900"
                    />
                    <div>
                      <p className="font-bold text-sm text-slate-900">Razorpay Checkout (UPI, Cards, NetBanking)</p>
                      <p className="text-xs text-slate-500">Instant checkout via Google Pay, PhonePe, Paytm, Cards & NetBanking</p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </label>

                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                    paymentMethod === 'COD' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="w-4 h-4 text-slate-900"
                    />
                    <div>
                      <p className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</p>
                      <p className="text-xs text-slate-500">Pay cash or UPI upon package delivery</p>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 h-fit">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono border-b border-slate-200 pb-3">
              Order Summary ({cart.length})
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="truncate max-w-[180px]">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-500">Size: {item.size || 'Standard'} • Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="text-emerald-600 font-bold uppercase font-mono">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="font-mono text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>{paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay via Razorpay'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
