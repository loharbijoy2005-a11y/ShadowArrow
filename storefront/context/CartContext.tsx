'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  category: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  totalCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve persistent session ID
    let sid = localStorage.getItem('shadow_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem('shadow_session_id', sid);
    }
    setSessionId(sid);

    const saved = localStorage.getItem('shadow_cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved cart');
      }
    }
  }, []);

  // Sync cart with backend whenever items change
  useEffect(() => {
    localStorage.setItem('shadow_cart', JSON.stringify(cart));

    if (sessionId) {
      const syncCartWithBackend = async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
          let custName = '';
          let custPhone = '';
          let custEmail = '';

          const savedUser = localStorage.getItem('shadow_user');
          if (savedUser) {
            const u = JSON.parse(savedUser);
            custName = u.name || '';
            custPhone = u.phone || '';
            custEmail = u.email || '';
          }

          const totalAmt = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

          await fetch(`${API_URL}/api/v1/cart/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              customer_name: custName,
              customer_phone: custPhone,
              customer_email: custEmail,
              items: cart,
              total_amount: totalAmt,
              status: cart.length > 0 ? 'ABANDONED' : 'CLEARED',
            }),
          });
        } catch (err) {
          console.warn('Backend cart sync failed silent:', err);
        }
      };

      const timer = setTimeout(syncCartWithBackend, 1000);
      return () => clearTimeout(timer);
    }
  }, [cart, sessionId]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product_id === item.product_id && i.size === item.size
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += item.quantity;
        return copy;
      }
      const newItem: CartItem = {
        ...item,
        id: `${item.product_id}-${item.size || 'default'}-${Date.now()}`,
      };
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
