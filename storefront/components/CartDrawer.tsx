'use client';

import React from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Truck, CheckCircle2, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalCount } = useCart();

  if (!isCartOpen) return null;

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base text-white flex items-center space-x-2">
                  <span>Your Cart</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-mono text-xs rounded-full border border-blue-500/30">
                    {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">SHADOW ARROW Official Bag</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Animated Free Delivery Eligibility Banner */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-900 border-b border-slate-800 text-white font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center space-x-1.5 font-bold">
                  <Truck className={`w-4 h-4 ${isFreeShipping ? 'text-emerald-400' : 'text-blue-400'}`} />
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-400 font-bold">🎉 ELIGIBLE FOR FREE EXPRESS DELIVERY!</span>
                    ) : (
                      <span>Add <strong className="text-blue-400">₹{amountNeededForFreeShipping.toFixed(0)}</strong> more for FREE Delivery</span>
                    )}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{Math.round(freeShippingProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFreeShipping ? 'bg-emerald-400' : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                  }`}
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Your bag is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1 font-mono">
                    Explore heavy 350 GSM cotton tees, techwear cargo pants, and cyber footwear.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase rounded-xl transition shadow-lg active:scale-95"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl relative group hover:border-slate-300 transition shadow-sm"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-200 border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">{item.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 font-mono">
                        {item.category && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                            {item.category}
                          </span>
                        )}
                        {item.size && (
                          <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            Size: {item.size}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-sm font-black text-slate-900 mt-1.5">
                        ₹{item.price}{' '}
                        <span className="text-[11px] text-slate-400 font-normal">
                          x {item.quantity} = ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center border border-slate-300 bg-white rounded-lg overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-slate-100 text-slate-700 transition"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-slate-100 text-slate-700 transition"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 transition"
                        title="Remove item from bag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-slate-50 space-y-4 shadow-inner">
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Bag Subtotal ({totalCount} items)</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping & Delivery</span>
                  <span className={isFreeShipping ? 'text-emerald-600 font-bold' : 'text-slate-900'}>
                    {isFreeShipping ? 'FREE EXPRESS' : 'Standard'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="font-mono text-lg font-black text-blue-600">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-mono font-bold py-3.5 rounded-2xl text-xs uppercase flex items-center justify-center space-x-2 shadow-xl transition-all duration-300 active:scale-98"
              >
                <span>Proceed to Checkout (₹{subtotal.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
