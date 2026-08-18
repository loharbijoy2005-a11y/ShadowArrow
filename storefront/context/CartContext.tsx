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

export interface CartToastInfo {
  id: string;
  title: string;
  image: string;
  price: number;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>, triggerEl?: HTMLElement) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  totalCount: number;
  toast: CartToastInfo | null;
  setToast: (toast: CartToastInfo | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const runFlyToCartAnimation = (startElement: HTMLElement | null, imageSrc: string) => {
  if (!startElement || typeof document === 'undefined') return;

  const rect = startElement.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  const flyer = document.createElement('img');
  flyer.src = imageSrc || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
  flyer.style.position = 'fixed';
  flyer.style.left = `${startX - 20}px`;
  flyer.style.top = `${startY - 20}px`;
  flyer.style.width = '40px';
  flyer.style.height = '40px';
  flyer.style.borderRadius = '50%';
  flyer.style.objectFit = 'cover';
  flyer.style.zIndex = '99999';
  flyer.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
  flyer.style.pointerEvents = 'none';
  flyer.style.border = '2px solid #3b82f6';
  flyer.style.boxShadow = '0 0 12px rgba(59, 130, 246, 0.7)';

  document.body.appendChild(flyer);

  requestAnimationFrame(() => {
    // Target position: bottom-right area where floating cart or bottom nav is
    const destX = window.innerWidth - 60;
    const destY = window.innerHeight - 60;

    flyer.style.left = `${destX}px`;
    flyer.style.top = `${destY}px`;
    flyer.style.width = '10px';
    flyer.style.height = '10px';
    flyer.style.opacity = '0.2';
    flyer.style.transform = 'scale(0.2) rotate(360deg)';
  });

  setTimeout(() => {
    if (flyer.parentNode) {
      document.body.removeChild(flyer);
    }
  }, 800);
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [toast, setToast] = useState<CartToastInfo | null>(null);

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

  const addToCart = (item: Omit<CartItem, 'id'>, triggerEl?: HTMLElement) => {
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

    if (triggerEl) {
      runFlyToCartAnimation(triggerEl, item.image);
    }

    setToast({
      id: `${item.product_id}-${Date.now()}`,
      title: item.title,
      image: item.image,
      price: item.price,
      size: item.size,
    });
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
        toast,
        setToast,
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
