import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { LightningDeals } from './components/LightningDeals';
import { CartDrawer } from './components/CartDrawer';
import { ShadowAiModal } from './components/ShadowAiModal';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { LegalModals } from './components/LegalModals';
import { Footer } from './components/Footer';

import { Product, CartItem, User, Order } from './types';
import { INITIAL_PRODUCTS } from './data/products';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Standalone LocalStorage State Initializers
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shadow_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shadow_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('shadow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('shadow_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Pincode & Delivery Date State (100% Wiped ghost defaults)
  const [pincode, setPincode] = useState<string>(() => {
    try {
      return localStorage.getItem('shadow_pincode') || '';
    } catch {
      return '';
    }
  });

  const [deliveryDate, setDeliveryDate] = useState('3 - 4 Days Express Delivery');

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'about' | 'privacy' | 'terms' | 'returns' | null>(null);

  // Toast alert
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Check active JWT Token on Startup
  useEffect(() => {
    const token = localStorage.getItem('shadow_token');
    if (token) {
      fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('shadow_user', JSON.stringify(data.user));
          }
        })
        .catch(() => console.log('Standalone JWT mode active'));
    }
  }, []);

  // Persist state changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('shadow_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn(e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('shadow_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn(e);
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('shadow_user', JSON.stringify(user));
      else localStorage.removeItem('shadow_user');
    } catch (e) {
      console.warn(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('shadow_pincode', pincode);
    } catch (e) {
      console.warn(e);
    }
  }, [pincode]);

  // Fetch products from backend REST API with fallback to INITIAL_PRODUCTS
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products && data.products.length > 0) {
          const mapped: Product[] = data.products.map((p: any) => ({
            id: p.productId || p.id,
            name: p.name || p.title,
            subtitle: p.subtitle || '',
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice,
            discountPercent: p.discountPercent,
            rating: p.rating || 4.8,
            reviewsCount: p.reviewsCount || 500,
            image: p.image,
            description: p.description || '',
            isPrime: p.isPrime ?? true,
            stockCount: p.stockCount || 5
          }));
          setProducts(mapped);
        }
      })
      .catch(() => console.log('Standalone mode active - using local seed product dataset'));
  }, []);

  // Update Dynamic Delivery Date when Pincode changes
  const handlePincodeChange = (newPin: string) => {
    setPincode(newPin);
    setDeliveryDate('3 - 4 Days Express Delivery');
    showToast(`Delivery location updated for pincode ${newPin}`, 'info');
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('shadow_token');
    localStorage.removeItem('shadow_user');
    setUser(null);
    showToast('Signed out successfully', 'info');
  };

  // Cart actions
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to Cart!`, 'success');
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  // Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Added "${product.name}" to Wishlist!`, 'info');
        return [...prev, product.id];
      }
    });
  };

  // Filter search
  const handleSearch = (query: string, category: string) => {
    const q = query.toLowerCase().trim();
    setProducts(
      INITIAL_PRODUCTS.filter((p) => {
        const matchesCat = category === 'all' || p.category === category;
        const matchesQ =
          !q || p.name.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q);
        return matchesCat && matchesQ;
      })
    );
    document.getElementById('lightning-deals-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Order completed
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    showToast(`Order ${newOrder.orderId} placed successfully!`, 'success');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col overflow-x-hidden">
      {/* TOAST ALERTS */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-amber-500/50 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-bounce">
          {toastMsg.text}
        </div>
      )}

      {/* HEADER */}
      <Header
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
        user={user}
        pincode={pincode}
        deliveryDate={deliveryDate}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => showToast(`Wishlist contains ${wishlistIds.length} items`, 'info')}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onLogout={handleLogout}
        onPincodeChange={handlePincodeChange}
        onSearch={handleSearch}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full">
        <Hero
          onExploreDeals={() =>
            document.getElementById('lightning-deals-section')?.scrollIntoView({ behavior: 'smooth' })
          }
          onOpenAi={() => setIsAiOpen(true)}
        />

        <CategoryGrid
          onSelectCategory={(cat) => {
            setProducts(INITIAL_PRODUCTS.filter((p) => p.category === cat));
            document.getElementById('lightning-deals-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <LightningDeals
          products={products}
          wishlistIds={wishlistIds}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={handleToggleWishlist}
        />
      </main>

      {/* FOOTER */}
      <Footer onOpenLegal={(type) => setLegalModalType(type)} />

      {/* MODALS */}
      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cartItems}
        pincode={pincode}
        deliveryDate={deliveryDate}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <ShadowAiModal
        isOpen={isAiOpen}
        products={products}
        onClose={() => setIsAiOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          showToast(`Welcome back, ${loggedInUser.name}!`, 'success');
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        cartItems={cartItems}
        pincode={pincode}
        user={user}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      <LegalModals modalType={legalModalType} onClose={() => setLegalModalType(null)} />

      {/* ORDERS MODAL */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsOrdersOpen(false)}></div>
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white">Your Shadow Orders ({orders.length})</h3>
              <button onClick={() => setIsOrdersOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-3 text-xs">
              {orders.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No active orders found.</p>
              ) : (
                orders.map((o) => (
                  <div key={o.orderId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-amber-400">{o.orderId}</span>
                      <span className="text-emerald-400">{o.status}</span>
                    </div>
                    <div className="text-slate-400">Total Amount: <strong className="text-white">₹{o.total.toLocaleString('en-IN')}</strong> ({o.paymentMethod})</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
