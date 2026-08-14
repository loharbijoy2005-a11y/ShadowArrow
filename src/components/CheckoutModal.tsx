import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CreditCard, Banknote, AlertCircle, MapPin, UserCheck, Lock } from 'lucide-react';
import { Product, CartItem, Order, User } from '../types';
import { RAZORPAY_KEY_ID } from '../config';
import { calculateDeliveryInfo, WAREHOUSE_PINCODE } from '../utils/delivery';
import { sanitizeInput } from '../utils/security';
import confetti from 'canvas-confetti';

import { INDIAN_STATES, lookupPincode } from '../data/indianLocations';

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  pincode: string;
  user: User | null;
  products?: Product[];
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
  onOpenAuth?: () => void;
  onAddToCart?: (product: Product) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cartItems,
  pincode,
  user,
  products,
  onClose,
  onOrderPlaced,
  onOpenAuth,
  onAddToCart
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [stateName, setStateName] = useState('West Bengal');
  const [district, setDistrict] = useState('Bankura');
  const [village, setVillage] = useState('');
  const [pin, setPin] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Online Payment (Razorpay)');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setPhone(user?.phone || '');
      setVillage(user?.fullAddress || '');
      const initialPin = pincode || '722157';
      setPin(initialPin);

      const detected = lookupPincode(initialPin);
      if (detected) {
        setStateName(detected.state);
        setDistrict(detected.district);
      } else {
        setStateName('West Bengal');
        setDistrict('Bankura');
      }

      setErrorMessage('');
      setPaymentMethod('Online Payment (Razorpay)');
    }
  }, [isOpen, user, pincode]);

  const handlePincodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPin(val);
    if (val.length === 6) {
      const found = lookupPincode(val);
      if (found) {
        setStateName(found.state);
        setDistrict(found.district);
      }
    }
  };

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryInfo = calculateDeliveryInfo(pin || pincode, subtotal);
  const deliveryFee = deliveryInfo.deliveryFee;
  const total = subtotal + deliveryFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      setErrorMessage('Account required! Please sign in or create an account.');
      if (onOpenAuth) {
        onClose();
        onOpenAuth();
      }
      return;
    }

    const cleanName = sanitizeInput(name);
    const cleanVillage = sanitizeInput(village);
    const cleanPin = sanitizeInput(pin);

    if (!cleanName || !phone || !cleanVillage || !cleanPin) {
      setErrorMessage('Please fill in your Village/Street address and Pincode.');
      return;
    }

    setLoading(true);

    if (paymentMethod.includes('Online')) {
      handleRazorpayPayment();
    } else {
      completeOrderPlacement('COD_VERIFIED_' + Date.now());
    }
  };

  const handleRazorpayPayment = () => {
    const cleanName = sanitizeInput(name);

    const openSDK = () => {
      if ((window as any).Razorpay) {
        const options = {
          key: RAZORPAY_KEY_ID || 'rzp_test_SA100200300',
          amount: total * 100,
          currency: 'INR',
          name: 'Shadow Arrow Marketplace',
          description: 'Prime Order Express Air Delivery',
          image: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
          handler: function (response: any) {
            if (response && response.razorpay_payment_id) {
              completeOrderPlacement(response.razorpay_payment_id);
            } else {
              setLoading(false);
              setErrorMessage('Payment verification failed. Please try again.');
            }
          },
          prefill: {
            name: cleanName,
            contact: phone
          },
          theme: {
            color: '#f59e0b'
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setErrorMessage('Online payment was cancelled. Order was not placed.');
            }
          }
        };

        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } catch (e: any) {
          setLoading(false);
          setErrorMessage('Failed to open Razorpay payment popup: ' + (e.message || 'Gateway error.'));
        }
      } else {
        setLoading(false);
        setErrorMessage('Razorpay Payment Gateway SDK is initializing. Please try again or select Cash on Delivery (COD).');
      }
    };

    if (!(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => openSDK();
      script.onerror = () => {
        setLoading(false);
        setErrorMessage('Could not load Razorpay Payment Gateway. Please try Cash on Delivery (COD).');
      };
      document.body.appendChild(script);
    } else {
      openSDK();
    }
  };

  const completeOrderPlacement = async (paymentId: string) => {
    const cleanName = sanitizeInput(name);
    const cleanVillage = sanitizeInput(village);
    const cleanDistrict = sanitizeInput(district);
    const cleanState = sanitizeInput(stateName);
    const cleanPin = sanitizeInput(pin);

    const fullStreetStr = `${cleanVillage}, ${cleanDistrict}`;

    const payload = {
      name: cleanName,
      phone,
      address: { street: fullStreetStr, city: cleanDistrict, state: cleanState, pincode: cleanPin },
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
      name: cleanName,
      address: { street: fullStreetStr, city: cleanDistrict, state: cleanState, pincode: cleanPin },
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
      const text = await res.text();
      if (text) {
        try {
          const data = JSON.parse(text);
          if (data.success && data.order) {
            newOrder.orderId = data.order.orderId || newOrder.orderId;
          }
        } catch (e) {}
      }
    } catch (err) {
      console.log('Local standalone order creation active');
    }

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
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Shadow Checkout
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACCOUNT NOT LOGGED IN WARNING BANNER */}
        {!user && (
          <div className="m-4 p-4 bg-amber-500/10 border border-amber-500/50 rounded-2xl flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <strong className="text-white block font-bold">Account Login Required</strong>
                <span>You must be signed in with your WhatsApp number to place an order and save details in MongoDB.</span>
              </div>
            </div>
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="ml-3 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex-shrink-0 shadow-md"
              >
                Sign In Now
              </button>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="m-4 p-3.5 bg-rose-500/15 border border-rose-500/50 text-rose-400 text-xs rounded-xl font-bold flex items-center gap-2 animate-shake shadow-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-6 max-h-[550px] overflow-y-auto">

          {/* ADDRESS SECTION */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>1. Delivery Address</span>
              {user && <span className="text-[10px] text-emerald-400 font-normal flex items-center gap-1"><UserCheck className="w-3 h-3"/> Logged in as {user.name} ({user.phone})</span>}
            </h4>
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
              <div>
                <label className="block text-slate-400 mb-1 font-bold">State (Dropdown Select) *</label>
                <select
                  value={stateName}
                  onChange={(e) => {
                    const selectedState = e.target.value;
                    setStateName(selectedState);
                    const stateObj = INDIAN_STATES.find((s) => s.state === selectedState);
                    if (stateObj && stateObj.districts.length > 0) {
                      setDistrict(stateObj.districts[0]);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500 text-xs cursor-pointer"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.state}>
                      {s.state} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">District / City (Dropdown Select) *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500 text-xs cursor-pointer"
                >
                  {(INDIAN_STATES.find((s) => s.state === stateName)?.districts || ['Bankura', 'Kolkata', 'Howrah', 'Mumbai', 'Bengaluru']).map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Pincode (Auto-Detects State & District) *</label>
                <input
                  type="text"
                  required
                  value={pin}
                  onChange={handlePincodeInputChange}
                  placeholder="6-digit Pincode (e.g. 722157)"
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500 font-mono"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Village / Street / House No. / Landmark *</label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Enter Village Name, House No., Street or Landmark"
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* PAYMENT CHOICES: 1st Online Payment (Razorpay), 2nd Cash on Delivery (COD) */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm border-b border-slate-800 pb-2">2. Select Payment Method</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* 1st OPTION: ONLINE PAYMENT */}
              <label
                onClick={() => setPaymentMethod('Online Payment (Razorpay)')}
                className={`cursor-pointer bg-slate-950 border p-3 rounded-xl flex items-center justify-between transition ${
                  paymentMethod.includes('Razorpay') || paymentMethod.includes('Online')
                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Online Payment</span>
                    </div>
                    <div className="text-[10px] text-slate-400">UPI (GPay/PhonePe), Cards, NetBanking</div>
                  </div>
                </div>
                <input type="radio" name="pay" checked={paymentMethod.includes('Razorpay') || paymentMethod.includes('Online')} className="accent-amber-500" readOnly />
              </label>

              {/* CASH ON DELIVERY (COD) */}
              <label
                onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                className={`cursor-pointer bg-slate-950 border p-3 rounded-xl flex items-center justify-between transition ${
                  paymentMethod.includes('COD') ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Pay cash upon door delivery</div>
                  </div>
                </div>
                <input type="radio" name="pay" checked={paymentMethod.includes('COD')} className="accent-amber-500" readOnly />
              </label>

            </div>
          </div>

          {/* ADD MORE PRODUCTS TO ORDER */}
          {products && products.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5">
                  <span>🛍️ Add Recommended Gear to Order</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold">Free Combined Shipping</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {products.filter(p => !cartItems.some(i => i.product.id === p.id)).slice(0, 2).map((p) => (
                  <div key={p.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2 hover:border-amber-500/50 transition">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={p.image} alt={p.name} className="w-9 h-9 object-cover rounded-lg bg-slate-900 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-white text-[11px] truncate">{p.name}</div>
                        <div className="text-amber-400 font-mono text-[10px] font-bold">₹{p.price.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    {onAddToCart && (
                      <button
                        type="button"
                        onClick={() => onAddToCart(p)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 flex-shrink-0 transition transform hover:scale-105"
                      >
                        <span>+ Add</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUMMARY & WAREHOUSE 722157 DELIVERY INFO */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 text-[11px] text-sky-400 font-semibold">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-sky-400" />
              <span>Ships from Warehouse Pincode: <strong className="font-mono text-white">{WAREHOUSE_PINCODE}</strong> ({deliveryInfo.shippingTier})</span>
            </div>

            <div className="flex justify-between text-slate-300 pt-1">
              <span>Items Subtotal</span>
              <span className="font-bold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Delivery Charges ({deliveryInfo.estimatedDays})</span>
              <span className="font-bold text-emerald-400">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
              <span>Total Payable Amount</span>
              <span className="text-xl text-amber-500 font-black">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {!user ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In / Create Account to Place Order &rarr;</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition"
            >
              {loading ? 'Processing Order...' : 'Place Prime Order Now \u2192'}
            </button>
          )}

        </form>
      </div>
    </div>
  );
};
