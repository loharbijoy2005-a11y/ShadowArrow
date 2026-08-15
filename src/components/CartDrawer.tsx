import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, Truck, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';
import { CartItem } from '../types';
import { calculateDeliveryInfo, WAREHOUSE_PINCODE } from '../utils/delivery';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  pincode: string;
  deliveryDate: string;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  pincode,
  deliveryDate,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState('');

  React.useEffect(() => {
    try {
      let sess = localStorage.getItem('shadow_cart_session');
      if (!sess) {
        sess = 'sess-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('shadow_cart_session', sess);
      }
      const userPhone = localStorage.getItem('shadow_user_phone') || '';
      const userName = localStorage.getItem('shadow_user_name') || '';

      fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          sessionId: sess,
          phone: userPhone,
          name: userName
        })
      }).catch(() => {});
    } catch (e) {}
  }, [cartItems]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Dynamic delivery calculation relative to Warehouse 722157
  const deliveryInfo = calculateDeliveryInfo(pincode, subtotal);

  const targetFree = pincode?.startsWith('722157') ? 0 : 999;
  const freePct = targetFree === 0 ? 100 : Math.min(100, Math.round((subtotal / targetFree) * 100));

  const handleApplyCoupon = () => {
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'SHADOW10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code: 'SHADOW10', discount });
      setCouponMsg('Coupon SHADOW10 applied! 10% Extra Discount');
    } else if (clean === 'SHADOW50') {
      const discount = Math.round(subtotal * 0.5);
      setAppliedCoupon({ code: 'SHADOW50', discount });
      setCouponMsg('Coupon SHADOW50 applied! 50% Mega Festival Discount');
    } else {
      setCouponMsg('Invalid coupon code. Try SHADOW10 or SHADOW50');
      setAppliedCoupon(null);
    }
  };

  const deliveryFee = deliveryInfo.deliveryFee;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-white flex flex-col shadow-2xl">

          {/* DRAWER HEADER */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2 font-black text-lg">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <span>Your Shopping Cart</span>
              <span className="text-xs text-slate-400 font-bold">({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* FREE SHIPPING METER & LOCATION DELIVERY ESTIMATOR */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                {deliveryInfo.isFreeDelivery ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Prime Free Delivery Unlocked!
                  </span>
                ) : (
                  <span className="text-slate-300">Add ₹{(999 - subtotal).toLocaleString('en-IN')} for Free Shipping</span>
                )}
                <span className="text-amber-500 font-bold">{freePct}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${freePct}%` }}
                ></div>
              </div>
            </div>

            {/* LOCATION BASED DELIVERY ESTIMATOR WITH WAREHOUSE 722157 BADGE */}
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-500" />
                  <span>Pincode: <strong className="text-white">{pincode || 'Not Set'}</strong></span>
                </div>
                <span className="text-emerald-400 font-bold">{deliveryInfo.estimatedDays}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-sky-400 border-t border-slate-800/60 pt-1">
                <MapPin className="w-3 h-3 text-sky-400" />
                <span>Origin Warehouse: <strong className="font-mono text-white">{WAREHOUSE_PINCODE}</strong></span>
              </div>
            </div>
          </div>

          {/* CART ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <div className="font-black text-base text-white">Your Cart is Empty</div>
                  <p className="text-xs text-slate-400 mt-1">Explore our Lightning Deals to add gaming gear and techwear!</p>
                </div>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="font-bold text-xs text-white line-clamp-1">{item.product.name}</h4>
                    <div className="text-xs font-black text-amber-500 mt-0.5">₹{item.product.price.toLocaleString('en-IN')}</div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-500 hover:text-red-400 text-xs p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* COUPON CODE & FOOTER SUMMARY */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Promo Code (e.g. SHADOW10)"
                className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white uppercase outline-none focus:border-amber-500"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Apply
              </button>
            </div>
            {couponMsg && (
              <div className={`text-[11px] font-semibold ${appliedCoupon ? 'text-emerald-400' : 'text-red-400'}`}>
                {couponMsg}
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-900">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-white">{deliveryFee === 0 ? 'FREE (Prime)' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-xl text-amber-500 font-black">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={onProceedCheckout}
              disabled={cartItems.length === 0}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
