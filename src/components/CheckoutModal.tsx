import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CreditCard, Banknote, AlertCircle } from 'lucide-react';
import { CartItem, Order, User } from '../types';
import { RAZORPAY_KEY_ID } from '../config';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  pincode: string;
  user: User | null;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cartItems,
  pincode,
  user,
  onClose,
  onOrderPlaced
}) => {
  // All fields start 100% BLANK by default.
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setPhone(user?.phone || '');
      setStreet(user?.fullAddress || '');
      setCity('');
      setPin(pincode || '');
      setErrorMessage('');
    }
  }, [isOpen, user, pincode]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = subtotal >= 999 ? 0 : 69;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const isOnlinePayment = paymentMethod.includes('Razorpay') || paymentMethod.includes('Online');

    // 1. ONLINE PAYMENT FAILURE & AUTO-SWITCH TO COD
    if (isOnlinePayment && !RAZORPAY_KEY_ID.trim()) {
      setErrorMessage('Online payment gateway currently unavailable. Switched to Cash on Delivery.');
      setPaymentMethod('Cash on Delivery (COD)');
      return; // DO NOT confirm order automatically
    }

    setLoading(true);

    // If Razorpay Key is configured, launch Razorpay checkout
    if (isOnlinePayment && RAZORPAY_KEY_ID.trim()) {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: 'INR',
        name: 'SHADOW ARROW Prime Marketplace',
        description: 'Order Payment',
        handler: async function (response: any) {
          await completeOrderPlacement(response.razorpay_payment_id || 'Paid Online (Confirmed)');
        },
        prefill: { name, contact: phone },
        theme: { color: '#f59e0b' }
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
        return;
      }
    }

    // Process Cash on Delivery placement
    await completeOrderPlacement('COD_VERIFIED');
  };

  const completeOrderPlacement = async (paymentId: string) => {
    const payload = {
      name,
      phone,
      address: { street, city, state: 'India', pincode: pin },
      items: cartItems.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity
      })),
      paymentMethod,
      razorpayPaymentId: paymentId
    };

    const newOrder: Order = {
      orderId: 'ORD-SA-' + Math.floor(100000 + Math.random() * 900000),
      phone,
      name,
      address: { street, city, state: 'India', pincode: pin },
      items: cartItems,
      subtotal,
      deliveryFee,
      total,
      status: 'Shipped via Prime Express Air',
      paymentMethod: paymentMethod.includes('Online') ? 'Paid Online (Confirmed)' : paymentMethod,
      razorpayPaymentId: paymentId,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.order) {
        newOrder.orderId = data.order.orderId || newOrder.orderId;
      }
    } catch (err) {
      console.log('Local standalone order creation active');
    }

    // Save order to LocalStorage for standalone frontend persistence
    try {
      const savedOrders = JSON.parse(localStorage.getItem('shadow_orders') || '[]');
      localStorage.setItem('shadow_orders', JSON.stringify([newOrder, ...savedOrders]));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    setLoading(false);
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    onOrderPlaced(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Shadow Checkout
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="m-4 p-3 bg-red-500/10 border border-red-500/40 text-red-400 text-xs rounded-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[550px] overflow-y-auto">

          {/* ADDRESS SECTION */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm border-b border-slate-800 pb-2">1. Delivery Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat, House no., Building, Street area"
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City / Town"
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="6-digit Pincode"
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* PAYMENT CHOICES */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm border-b border-slate-800 pb-2">2. Payment Method</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                className={`cursor-pointer bg-slate-950 border p-3 rounded-xl flex items-center justify-between transition ${
                  paymentMethod.includes('COD') ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Cash on Delivery (COD)</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">RECOMMENDED</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Pay cash upon 3 - 4 Days Express Delivery</div>
                  </div>
                </div>
                <input type="radio" name="pay" checked={paymentMethod.includes('COD')} className="accent-amber-500" readOnly />
              </label>

              <label
                onClick={() => setPaymentMethod('Online Payment (Razorpay)')}
                className={`cursor-pointer bg-slate-950 border p-3 rounded-xl flex items-center justify-between transition ${
                  paymentMethod.includes('Razorpay') ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="font-bold text-white">Online Payment (Razorpay)</div>
                    <div className="text-[10px] text-slate-400">UPI, Cards, NetBanking</div>
                  </div>
                </div>
                <input type="radio" name="pay" checked={paymentMethod.includes('Razorpay')} className="accent-amber-500" readOnly />
              </label>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Items Subtotal</span>
              <span className="font-bold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>3 - 4 Days Express Delivery</span>
              <span className="font-bold text-white">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
              <span>Total Payable Amount</span>
              <span className="text-xl text-amber-500 font-black">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition"
          >
            {loading ? 'Processing Order...' : 'Place Prime Order Now ->'}
          </button>

        </form>
      </div>
    </div>
  );
};
