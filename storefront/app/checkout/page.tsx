'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import axios from 'axios';
import { Lock, CreditCard, Banknote, ShieldCheck, ArrowRight, Loader2, MapPin } from 'lucide-react';
import GSTBadgeTooltip from '@/components/GSTBadgeTooltip';
import TruckOrderButton from '@/components/TruckOrderButton';
import MobileBottomNav from '@/components/MobileBottomNav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_TQY1cJr1ekxaco';

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
  const [autoTriggered, setAutoTriggered] = useState(false);

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

        // 3. Fetch latest profile & addresses from MongoDB Atlas
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

  // Remove autoTriggered useEffect to prevent auto-submitting before user clicks Place Order

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
      alert('⚠️ Full Name is mandatory. Please enter your name to proceed with the order.');
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      alert('⚠️ Email Address is mandatory. Please enter a valid email address.');
      return false;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setPhoneError('⚠️ Please enter a valid 10-digit mobile number.');
      alert('⚠️ 10-Digit Mobile Number is mandatory to receive order & courier updates.');
      return false;
    }
    if (!shippingAddress.trim()) {
      alert('⚠️ Complete Delivery Address is mandatory. Please enter your house/flat no and street address.');
      return false;
    }
    const cleanPin = pincode.trim();
    if (!cleanPin || cleanPin.length < 6) {
      alert('⚠️ Valid 6-Digit Delivery Pincode is mandatory.');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckoutForm()) return;
    triggerPlaceOrder();
  };

  const triggerPlaceOrder = async () => {
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
      total_amount: subtotal,
      payment_method: paymentMethod,
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

      if (paymentMethod === 'COD') {
        clearCart();
        router.push(`/order-confirmation/${orderId}`);
        return;
      }

      // Online Payment Handler
      const razorpayOrderId = createdOrder.razorpay_order_id || '';
      
      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && typeof window !== 'undefined' && (window as any).Razorpay) {
        const options: any = {
          key: RAZORPAY_KEY,
          amount: Math.round(subtotal * 100),
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
              alert('⚠️ Payment verification failed. Please try again.');
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
              alert('⚠️ Payment Cancelled: You closed the payment window without completing payment. Your order has NOT been placed.');
            },
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: '#2563eb',
          },
        };

        if (razorpayOrderId && razorpayOrderId.startsWith('order_') && !razorpayOrderId.includes('mock') && !razorpayOrderId.includes('dev')) {
          options.order_id = razorpayOrderId;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setLoading(false);
        alert('⚠️ Unable to connect to Razorpay payment gateway. Please check your internet connection or choose Cash on Delivery.');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initialize payment. Please try again.');
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

            <div className="space-y-2 border-t border-slate-200 pt-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
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
                <span className="font-mono text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Animated Truck Order Button */}
            <TruckOrderButton
              type="submit"
              disabled={loading}
              loading={loading}
              onValidate={validateCheckoutForm}
              defaultText="PLACE ORDER"
            />
          </div>
        </form>
      </main>

      <MobileBottomNav onToggleAI={() => {}} />
    </div>
  );
}
