'use client';

import React from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="font-bold text-lg text-slate-900">Your Cart ({cart.length})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-bold text-slate-800">Your cart is currently empty</p>
                <p className="text-xs text-gray-500 max-w-xs">Explore our heavyweight French Terry cotton tees and techwear shoes.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-lg hover:bg-slate-800 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-3 bg-slate-50 border border-slate-100 rounded-xl relative group"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg bg-gray-200"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start pr-6">
                        <h3 className="font-bold text-sm text-slate-900 leading-tight">{item.title}</h3>
                      </div>
                      {item.size && (
                        <span className="inline-block mt-1 text-[11px] font-mono font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600">
                          Size: {item.size}
                        </span>
                      )}
                      <p className="font-mono text-xs font-bold text-black mt-1">₹{item.price}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-100 text-slate-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-gray-100 text-slate-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
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

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-slate-50 space-y-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-mono text-lg font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-gray-500">Taxes calculated at checkout. Free shipping on all orders.</p>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-black hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg transition active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
