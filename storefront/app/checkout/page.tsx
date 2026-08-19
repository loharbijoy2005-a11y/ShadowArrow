'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import axios from 'axios';
import { Lock, CreditCard, Banknote, ShieldCheck, ArrowRight, Loader2, MapPin, AlertTriangle, RefreshCw, XCircle, ShieldAlert, Coins } from 'lucide-react';
import GSTBadgeTooltip from '@/components/GSTBadgeTooltip';
import TruckOrderButton from '@/components/TruckOrderButton';
import MobileBottomNav from '@/components/MobileBottomNav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'your_razorpay_key_id_here';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // ArrowCoins Loyalty State
  const [userCoinsBalance, setUserCoinsBalance] = useState(0);
  const [redeemArrowCoins, setRedeemArrowCoins] = useState(false);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Animated Payment Failure / Cancellation Modal State
  const [paymentErrorModal, setPaymentErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    reason: string;
    detail: string;
    orderId?: string;
  } | null>(null);

  // Pre-warm Razorpay checkout script on page mount for instant modal pop-up
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Prefill details from logged in user profile & localStorage
  useEffect(() => {
    try {
      // 1. Direct last-used address fallback
      const lastSavedAddrStr = localStorage.getItem('shadow_saved_address');
      if (lastSavedAddrStr) {
        try {
          const lastAddr = JSON.parse(lastSavedAddrStr);
          if (lastAddr.street) setShippingAddress(lastAddr.street);
          if (lastAddr.pincode) setPincode(lastAddr.pincode);
        } catch (e) {}
      }

      // 2. Local Storage shadow_user
      const savedUserStr = localStorage.getItem('shadow_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u.name) setCustomerName(u.name);
        if (u.phone) setCustomerPhone(u.phone);
        if (u.email) setCustomerEmail(u.email);

        const savedAddrsKey = `shadow_addrs_${u.email || u.phone}`;
        const localAddrsStr = localStorage.getItem(savedAddrsKey);
        if (localAddrsStr) {
          try {
            const addrs = JSON.parse(localAddrsStr);
            setSavedAddresses(addrs);
            if (addrs.length > 0) {
              const def = addrs.find((a: any) => a.is_default) || addrs[0];
              if (def.street) setShippingAddress((prev) => prev || def.street);
              if (def.pincode) setPincode((prev) => prev || def.pincode);
            }
          } catch (e) {}
        } else if (u.addresses && u.addresses.length > 0) {
          setSavedAddresses(u.addresses);
          const def = u.addresses.find((a: any) => a.is_default) || u.addresses[0];
          if (def.street) setShippingAddress((prev) => prev || def.street);
          if (def.pincode) setPincode((prev) => prev || def.pincode);
        }

        // 3. Fetch latest profile, addresses & ArrowCoins rewards balance from MongoDB Atlas
        if (u.email || u.phone) {
          axios
            .get(`${API_URL}/api/v1/user/profile?email=${encodeURIComponent(u.email || '')}&phone=${encodeURIComponent(u.phone || '')}`)
            .then((res) => {
              const dbUser = res.data;
              if (dbUser) {
                if (dbUser.name) setCustomerName((prev) => prev || dbUser.name);
                if (dbUser.phone) setCustomerPhone((prev) => prev || dbUser.phone);
                if (dbUser.email) setCustomerEmail((prev) => prev || dbUser.email);
                if (dbUser.addresses && dbUser.addresses.length > 0) {
                  setSavedAddresses(dbUser.addresses);
                  const def = dbUser.addresses.find((a: any) => a.is_default) || dbUser.addresses[0];
                  if (def) {
                    if (def.street) setShippingAddress((prev) => prev || def.street);
                    if (def.pincode) setPincode((prev) => prev || def.pincode);
                  }
                }
              }
            })
            .catch((err) => console.warn('Background profile fetch warning:', err));

          axios
            .get(`${API_URL}/api/v1/user/rewards?email=${encodeURIComponent(u.email || '')}&phone=${encodeURIComponent(u.phone || '')}`)
            .then((res) => {
              if (res.data && typeof res.data.coin_balance === 'number') {
                setUserCoinsBalance(res.data.coin_balance);
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Could not parse user from localStorage', e);
    }
  }, []);

  // Save last-used shipping address & pincode automatically to localStorage
  useEffect(() => {
    if (shippingAddress.trim() || pincode.trim()) {
      localStorage.setItem(
        'shadow_saved_address',
        JSON.stringify({ street: shippingAddress, pincode })
      );
    }
  }, [shippingAddress, pincode]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
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
    setCustomerPhone(e.target.value);
    setPhoneError('');
  };

  const validateCheckoutForm = (): boolean => {
    if (!customerName.trim()) {
      setPaymentErrorModal({
        isOpen: true,
        title: 'Missing Required Information',
        reason: 'Full Name is mandatory.',
        detail: 'Please enter your complete name to proceed with shipping.',
      });
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setPaymentErrorModal({
        isOpen: true,
        title: 'Invalid Email Address',
        reason: 'Valid Email Address is mandatory.',
        detail: 'We need your email address to send digital invoice & shipment tracking link.',
      });
      return false;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setPhoneError('⚠️ Please enter a valid 10-digit mobile number.');
      setPaymentErrorModal({
        isOpen: true,
        title: 'Invalid Phone Number',
        reason: '10-Digit Mobile Number is mandatory.',
        detail: 'Courier partner requires a valid phone number for OTP verification & delivery updates.',
      });
      return false;
    }
    if (!shippingAddress.trim()) {
      setPaymentErrorModal({
        isOpen: true,
        title: 'Missing Delivery Address',
        reason: 'Shipping street address is mandatory.',
        detail: 'Please enter your house/flat number and street address.',
      });
      return false;
    }
    const cleanPin = pincode.trim();
    if (!cleanPin || cleanPin.length < 6) {
      setPaymentErrorModal({
        isOpen: true,
        title: 'Invalid Delivery Pincode',
        reason: 'Valid 6-digit Pincode is required.',
        detail: 'Please enter a valid Indian postal pincode to calculate delivery speed.',
      });
      return false;
    }
    return true;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckoutForm()) return;
    triggerPlaceOrder();
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await axios.post(`${API_URL}/api/v1/coupons/validate`, {
        code: couponInput.trim(),
        cart_total: subtotal,
      });
      if (res.data && res.data.valid) {
        setAppliedCoupon({
          code: res.data.code,
          discountAmount: res.data.discount_amount || 0,
        });
        setCouponInput('');
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.error || 'Invalid or expired coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const subtotalAfterCoupon = Math.max(0, subtotal - (appliedCoupon ? appliedCoupon.discountAmount : 0));
  const maxCoinsUsableCap = Math.floor(subtotalAfterCoupon * 0.05);
  const actualCoinsRedeemed = redeemArrowCoins ? Math.min(userCoinsBalance, maxCoinsUsableCap) : 0;
  const finalPayable = Math.max(0, subtotalAfterCoupon - actualCoinsRedeemed);

  const triggerPlaceOrder = async (overrideMethod?: 'ONLINE' | 'COD') => {
    const activeMethod = overrideMethod || paymentMethod;
    if (!validateCheckoutForm()) return;

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
      total_amount: finalPayable,
      coupon_code: appliedCoupon ? appliedCoupon.code : '',
      discount_amount: appliedCoupon ? appliedCoupon.discountAmount : 0,
      coins_redeemed: actualCoinsRedeemed,
      payment_method: activeMethod,
    };

    try {
      // Sync/Link phone number and name to customer profile in MongoDB
      try {
        await axios.put(`${API_URL}/api/v1/user/profile`, {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
        });
        const savedUserStr = localStorage.getItem('shadow_user');
        const savedUser = savedUserStr ? JSON.parse(savedUserStr) : {};
        localStorage.setItem('shadow_user', JSON.stringify({
          ...savedUser,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          isLoggedIn: true,
        }));
      } catch (syncErr) {
        console.warn('Background profile linkage warning:', syncErr);
      }

      const res = await axios.post(`${API_URL}/api/v1/orders/create`, orderPayload);
      const createdOrder = res.data;
      const orderId = createdOrder.order_id;

      if (activeMethod === 'COD') {
        clearCart();
        router.push(`/order-confirmation/${orderId}`);
        return;
      }

      // Online Payment Handler - Open Razorpay Modal
      const razorpayOrderId = createdOrder.razorpay_order_id || '';
      
      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && typeof window !== 'undefined' && (window as any).Razorpay) {
        const options: any = {
          key: RAZORPAY_KEY,
          amount: Math.round(finalPayable * 100),
          currency: 'INR',
          name: 'SHADOW ARROW',
          description: `Order #${orderId}`,
          handler: async function (response: any) {
            try {
              await axios.post(`${API_URL}/api/v1/orders/verify-payment`, {
                order_id: orderId,
                razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
                razorpay_payment_id: response.razorpay_payment_id || 'pay_online_' + Date.now(),
                razorpay_signature: response.razorpay_signature || 'mock_signature_valid',
              });
              clearCart();
              router.push(`/order-confirmation/${orderId}`);
            } catch (err) {
              setLoading(false);
              setPaymentErrorModal({
                isOpen: true,
                title: 'Payment Verification Failed',
                reason: 'Bank authorization mismatch or gateway timeout.',
                detail: 'If money was deducted from your account, it will be automatically refunded within 3-5 business days.',
                orderId: orderId,
              });
            }
          },
          modal: {
            ondismiss: async function () {
              console.log('Payment modal dismissed by user without paying');
              setLoading(false);
              try {
                // Instantly update backend order status to CANCELLED so unpaid ghost order is cancelled
                await axios.put(`${API_URL}/api/v1/admin/orders/${orderId}/status`, {
                  order_status: 'CANCELLED',
                  status: 'CANCELLED',
                  payment_status: 'CANCELLED',
                });
              } catch (err) {
                console.warn('Failed to mark cancelled order status:', err);
              }
              
              setPaymentErrorModal({
                isOpen: true,
                title: 'Payment Cancelled',
                reason: 'Payment popup was closed before completing payment.',
                detail: 'Your bank account was NOT charged. You can retry paying online or choose Cash on Delivery (COD).',
                orderId: orderId,
              });
            },
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

        if (razorpayOrderId && razorpayOrderId.startsWith('order_') && !razorpayOrderId.includes('mock') && !razorpayOrderId.includes('dev')) {
          options.order_id = razorpayOrderId;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setLoading(false);
        setPaymentErrorModal({
          isOpen: true,
          title: 'Payment Gateway Error',
          reason: 'Unable to connect to Razorpay payment servers.',
          detail: 'Please check your internet connection or choose Cash on Delivery (COD).',
        });
      }
    } catch (err: any) {
      setLoading(false);
      let errorReason = err.response?.data?.error || err.message || 'Payment initialization failed.';
      
      // Clean up technical server URLs from user-facing error text
      if (errorReason.includes('onrender') || errorReason.includes('vercel') || errorReason.includes('Network Error')) {
        errorReason = 'Backend server response timeout. Server waking up from standby.';
      }

      setPaymentErrorModal({
        isOpen: true,
        title: 'Order Initialization Failed',
        reason: errorReason,
        detail: 'You can retry placing the order online or switch to Cash on Delivery (COD) for instant order confirmation.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 sm:py-12 pb-28 w-full space-y-8">
        
        {/* Checkout Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">Secure Payment</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-mono">Encrypted Checkout Gateway • SHADOW ARROW</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Shipping Form */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">Shipping & Delivery Details</h2>

            {/* Quick Select Saved Address Section */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2 bg-blue-50/70 p-4 rounded-2xl border border-blue-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono text-[11px] uppercase flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Quick Select Saved Address ({savedAddresses.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {savedAddresses.map((addr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (addr.street) setShippingAddress(addr.street);
                        if (addr.pincode) setPincode(addr.pincode);
                        if (addr.name) setCustomerName(addr.name);
                        if (addr.phone) setCustomerPhone(addr.phone);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-left border text-[11px] transition-all font-mono ${
                        shippingAddress === addr.street
                          ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      <p className="font-bold truncate max-w-[200px]">{addr.name || 'Saved Address'}</p>
                      <p className="text-[10px] opacity-90 truncate max-w-[220px]">{addr.street}, {addr.city || ''} - {addr.pincode}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone / Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
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
                  placeholder="Enter 6-digit Pincode"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Dynamic Pincode Delivery Estimate Badge */}
            {(() => {
              const etaInfo = (() => {
                const cleanPin = pincode.trim();
                if (cleanPin.length < 6) {
                  return { days: '3-5 Days', label: 'Enter 6-digit Pincode to check exact delivery speed' };
                }
                if (/^7[0-4]/.test(cleanPin)) {
                  return { days: '2-3 Days', label: '⚡ Fast Express Local Delivery (WB/East Hub)' };
                }
                if (/^(11|40|56|60|50|1|2|3|4|5|6)/.test(cleanPin)) {
                  return { days: '3-4 Days', label: '🚀 Metro Express Delivery (Blue Dart / Delhivery)' };
                }
                return { days: '4-6 Days', label: '📦 National Standard Express Courier' };
              })();

              return (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs transition-all">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">🚚</span>
                    <div>
                      <p className="font-bold text-slate-900 font-mono text-[11px]">Estimated Delivery: {etaInfo.days}</p>
                      <p className="text-slate-600 text-[11px]">{etaInfo.label}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-blue-600 text-white px-2.5 py-1 rounded-full shrink-0">
                    {etaInfo.days}
                  </span>
                </div>
              );
            })()}

            {/* Payment Options Selection */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">Payment Options</h2>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                    paymentMethod === 'ONLINE' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-bold text-sm text-slate-900">Online Payment</p>
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

            {/* Coupon Code Section */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="block text-slate-700 font-bold uppercase text-xs font-mono">Apply Coupon Code</label>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-emerald-800 uppercase">🎟️ {appliedCoupon.code}</span>
                    <p className="text-[11px] text-emerald-600 font-semibold">Discount: -₹{appliedCoupon.discountAmount.toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-red-600 hover:text-red-800 font-mono"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold uppercase text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition font-mono disabled:opacity-50"
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600 font-mono font-semibold">{couponError}</p>
              )}
            </div>

            {/* ArrowCoins Loyalty Redemption Box */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <label className="flex items-center justify-between p-3 bg-amber-50/80 border border-amber-200 rounded-2xl cursor-pointer transition hover:bg-amber-50">
                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    checked={redeemArrowCoins}
                    onChange={(e) => setRedeemArrowCoins(e.target.checked)}
                    disabled={userCoinsBalance <= 0 || maxCoinsUsableCap <= 0}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 font-mono flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>Redeem ArrowCoins</span>
                    </span>
                    <p className="text-[10px] text-slate-600 font-mono">
                      Available: <strong className="text-slate-900">{userCoinsBalance}</strong> | Max Usable (5% cap): <strong className="text-amber-700">{maxCoinsUsableCap}</strong>
                    </p>
                  </div>
                </div>
                {actualCoinsRedeemed > 0 && (
                  <span className="font-mono font-bold text-amber-700 text-xs">-₹{actualCoinsRedeemed}</span>
                )}
              </label>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-mono">-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {actualCoinsRedeemed > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>ArrowCoins Discount</span>
                  <span className="font-mono">-₹{actualCoinsRedeemed.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="text-emerald-600 font-bold uppercase font-mono">FREE</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 text-[11px] pt-0.5">
                <span>Inclusive of Taxes</span>
                <GSTBadgeTooltip />
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="font-mono text-slate-900">₹{finalPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Dynamic Order Action Button */}
            <TruckOrderButton
              type="submit"
              disabled={loading}
              loading={loading}
              onValidate={validateCheckoutForm}
              isCOD={paymentMethod === 'COD'}
              defaultText={
                paymentMethod === 'COD'
                  ? 'PLACE ORDER (COD)'
                  : `PROCEED TO PAY ₹${finalPayable.toFixed(2)}`
              }
            />
          </div>
        </form>
      </main>

      {/* Animated Payment Failure / Cancellation Modal */}
      {paymentErrorModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-100 space-y-6 text-center transform transition-all animate-in zoom-in-95 duration-300 relative overflow-hidden">
            
            {/* Decorative Neon Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Animated Red Warning Badge */}
            <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" />
              <AlertTriangle className="w-10 h-10 text-red-600 relative z-10 animate-bounce" />
            </div>

            {/* Modal Header */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-black uppercase text-slate-900 tracking-tight font-sans">
                {paymentErrorModal.title}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Order Ref: {paymentErrorModal.orderId || 'UNPAID_GHOST_CANCELLED'}
              </p>
            </div>

            {/* Reason Box */}
            <div className="bg-red-50/80 border border-red-200 p-4 rounded-2xl text-left space-y-1.5">
              <div className="flex items-center space-x-2 text-red-800 font-bold text-xs uppercase font-mono">
                <XCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Failure Details</span>
              </div>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {paymentErrorModal.reason}
              </p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-red-100">
                {paymentErrorModal.detail}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentErrorModal(null);
                  triggerPlaceOrder('ONLINE');
                }}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 transition active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Online Payment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentErrorModal(null);
                  setPaymentMethod('COD');
                  triggerPlaceOrder('COD');
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition active:scale-[0.98]"
              >
                <Banknote className="w-4 h-4" />
                <span>Pay via Cash on Delivery (COD)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentErrorModal(null)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Close & Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav onToggleAI={() => {}} />
    </div>
  );
}
