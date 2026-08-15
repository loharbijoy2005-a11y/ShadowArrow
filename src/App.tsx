import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { LightningDeals } from './components/LightningDeals';
import { CartDrawer } from './components/CartDrawer';
import { ShadowAiModal } from './components/ShadowAiModal';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ProfileModal } from './components/ProfileModal';
import { LegalModals } from './components/LegalModals';
import { InvoiceModal } from './components/InvoiceModal';
import { ReviewModal } from './components/ReviewModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WelcomeModal } from './components/WelcomeModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { Footer } from './components/Footer';
import { FileText, Star } from 'lucide-react';

import { Product, CartItem, User, Order } from './types';
import { INITIAL_PRODUCTS } from './data/products';
import { calculateDeliveryInfo } from './utils/delivery';
import { safeLocalStorageGet, safeLocalStorageSet, safeLocalStorageRemove } from './utils/security';

export const App: React.FC = () => {
  const [allCatalogProducts, setAllCatalogProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Standalone LocalStorage State Initializers via safeLocalStorageGet
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    safeLocalStorageGet<CartItem[]>('shadow_cart', [])
  );

  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    safeLocalStorageGet<string[]>('shadow_wishlist', [])
  );

  const [user, setUser] = useState<User | null>(() =>
    safeLocalStorageGet<User | null>('shadow_user', null)
  );

  const [orders, setOrders] = useState<Order[]>(() =>
    safeLocalStorageGet<Order[]>('shadow_orders', [])
  );

  // Pincode & Delivery Date State (Origin: Warehouse 722157)
  const [pincode, setPincode] = useState<string>(() =>
    safeLocalStorageGet<string>('shadow_pincode', '722157')
  );

  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const savedPin = safeLocalStorageGet<string>('shadow_pincode', '722157');
    return calculateDeliveryInfo(savedPin, 0).estimatedDays;
  });

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [recentOrderSuccess, setRecentOrderSuccess] = useState<Order | null>(null);
  const [selectedUserInvoice, setSelectedUserInvoice] = useState<Order | null>(null);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [legalModalType, setLegalModalType] = useState<'about' | 'privacy' | 'terms' | 'returns' | null>(null);

  // Toast alert in top-right corner
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
        .then((res) => (res.ok ? res.text() : null))
        .then((text) => (text ? JSON.parse(text) : null))
        .then((data) => {
          if (data?.success && data?.user) {
            setUser(data.user);
            safeLocalStorageSet('shadow_user', data.user);
          }
        })
        .catch(() => console.log('Standalone JWT mode active'));
    }
  }, []);

  // Fetch customer orders from MongoDB whenever user logs in or changes
  useEffect(() => {
    if (user) {
      const queryId = user.phone || user.email;
      const token = localStorage.getItem('shadow_token') || '';
      fetch(`/api/orders?phone=${encodeURIComponent(queryId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then((res) => (res.ok ? res.text() : null))
        .then((text) => (text ? JSON.parse(text) : null))
        .then((data) => {
          if (data?.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
            safeLocalStorageSet('shadow_orders', data.orders);
          }
        })
        .catch(() => console.log('Fetching MongoDB orders fallback'));
    }
  }, [user]);

  // Persist state changes to LocalStorage safely
  useEffect(() => {
    safeLocalStorageSet('shadow_cart', cartItems);
  }, [cartItems]);

  useEffect(() => {
    safeLocalStorageSet('shadow_wishlist', wishlistIds);
  }, [wishlistIds]);

  useEffect(() => {
    if (user) safeLocalStorageSet('shadow_user', user);
    else safeLocalStorageRemove('shadow_user');
  }, [user]);

  useEffect(() => {
    safeLocalStorageSet('shadow_pincode', pincode);
  }, [pincode]);

  // Fetch products from backend REST API with fallback to INITIAL_PRODUCTS
  useEffect(() => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => (text ? JSON.parse(text) : null))
      .then((data) => {
        if (data?.success && data?.products && data.products.length > 0) {
          const mapped: Product[] = data.products.map((p: any) => ({
            id: p.productId || p.id,
            name: p.name || p.title,
            subtitle: p.subtitle || '',
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice,
            discountPercent: p.discountPercent,
            rating: (p.reviews && p.reviews.length > 0) ? p.rating : 5.0,
            reviewsCount: (p.reviews && p.reviews.length > 0) ? p.reviews.length : 0,
            image: p.image,
            description: p.description || '',
            isPrime: p.isPrime ?? true,
            stockCount: p.stockCount || 5
          }));
          setAllCatalogProducts(mapped);
          setProducts(mapped);
        }
      })
      .catch(() => console.log('Standalone mode active - using local seed product dataset'));
  }, []);

  // Update Dynamic Delivery Date when Pincode changes
  const handlePincodeChange = (newPin: string) => {
    setPincode(newPin);
    const info = calculateDeliveryInfo(newPin, 0);
    setDeliveryDate(info.estimatedDays);
    showToast(`Delivery location updated for pincode ${newPin} (${info.estimatedDays})`, 'info');
  };

  // Handle Logout
  const handleLogout = () => {
    safeLocalStorageRemove('shadow_token');
    safeLocalStorageRemove('shadow_user');
    safeLocalStorageRemove('shadow_orders');
    setUser(null);
    setOrders([]);
    showToast('Signed out successfully', 'info');
    setIsAuthOpen(true);
  };

  // Handle Profile Update
  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    safeLocalStorageSet('shadow_user', updatedUser);
    showToast('Profile & custom name updated successfully!', 'success');
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

  // Buy Now with guest protection
  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    setIsCartOpen(false);

    if (!user) {
      setIsAuthOpen(true);
      showToast('Please sign in or create an account to complete your purchase', 'info');
    } else {
      setIsCheckoutOpen(true);
    }
  };

  // Proceed to Checkout from Cart Drawer with guest protection
  const handleProceedCheckoutFromCart = () => {
    setIsCartOpen(false);

    if (!user) {
      setIsAuthOpen(true);
      showToast('Please sign in or create an account to place your order', 'info');
    } else {
      setIsCheckoutOpen(true);
    }
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
      allCatalogProducts.filter((p) => {
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
    setRecentOrderSuccess(newOrder);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col overflow-x-hidden">
      {/* TOAST ALERTS IN TOP-RIGHT CORNER */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-50 max-w-sm bg-slate-900/95 backdrop-blur-md border border-amber-500/50 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>{toastMsg.text}</span>
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
        onOpenProfile={() => setIsProfileOpen(true)}
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
            setProducts(allCatalogProducts.filter((p) => p.category === cat));
            document.getElementById('lightning-deals-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <LightningDeals
          products={products}
          wishlistIds={wishlistIds}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={handleToggleWishlist}
          onOpenReview={(prod) => setReviewProduct(prod)}
          onOpenDetail={(prod) => setSelectedDetailProduct(prod)}
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
        onProceedCheckout={handleProceedCheckoutFromCart}
      />

      <ShadowAiModal
        isOpen={isAiOpen}
        products={products}
        user={user}
        orders={orders}
        onClose={() => setIsAiOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setIsWelcomeOpen(true);
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        user={user}
        onClose={() => setIsProfileOpen(false)}
        onUpdateUser={handleProfileUpdate}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        cartItems={cartItems}
        pincode={pincode}
        user={user}
        products={products}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
        onOpenAuth={() => setIsAuthOpen(true)}
        onAddToCart={handleAddToCart}
      />

      <LegalModals modalType={legalModalType} onClose={() => setLegalModalType(null)} />

      {/* ORDERS MODAL */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsOrdersOpen(false)}></div>
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <span>Your Orders ({orders.length})</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Live Tracking Active
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Customer: {user?.name} ({user?.phone ? `+91 ${user.phone}` : (user?.email && !user?.email.includes('@shadowarrow.com') ? user.email : 'Guest Session')})
                </p>
              </div>
              <button onClick={() => setIsOrdersOpen(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-3 text-xs pr-1">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <p className="font-bold">No active orders found.</p>
                  <p className="text-[10px] text-slate-500">Place an order to see live Shiprocket tracking details.</p>
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.orderId} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition">
                    <div className="flex flex-wrap justify-between items-center gap-2 font-bold pb-2 border-b border-slate-900">
                      <span className="text-amber-400 font-mono text-xs">{o.orderId}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 text-[11px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-extrabold flex items-center gap-1">
                          <span>{o.status?.includes('Booked') ? '📦' : o.status?.includes('Shipped') ? '🚚' : o.status?.includes('Delivered') ? '✅' : '⚡'}</span>
                          <span>{o.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-300 text-xs space-y-1.5">
                      <div>Items: <strong className="text-white">{o.items ? o.items.map((i: any) => i.name || i.product?.name).filter(Boolean).join(', ') : 'Prime Product'}</strong></div>
                      <div>Total Amount: <strong className="text-amber-400 font-mono">₹{o.total?.toLocaleString('en-IN')}</strong> ({o.paymentMethod})</div>
                      {o.address && (
                        <div className="text-[10px] text-slate-400">
                          Delivery Address: {o.address.street}, {o.address.city} - {o.address.pincode}
                        </div>
                      )}

                      {/* VERIFIED PURCHASE RATE & REVIEW BUTTON */}
                      {o.items && o.items.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {o.items.map((it: any, iIdx: number) => {
                            const matchedProd = products.find((p) => p.id === (it.productId || it.id)) || products[0];
                            return (
                              <button
                                key={iIdx}
                                onClick={() => {
                                  setIsOrdersOpen(false);
                                  setReviewProduct(matchedProd);
                                }}
                                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition"
                              >
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>Rate & Review {it.name || 'Product'}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* COURIER NAME & AWB CODE BADGE - DISPLAY ONLY WHEN BOOKED ON SHIPROCKET */}
                      {(o.awbCode || o.courierName || o.status?.toLowerCase().includes('shiprocket') || o.status?.toLowerCase().includes('shipped')) ? (
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center text-[10px] text-slate-300 font-mono gap-1">
                          <span className="flex items-center gap-1">
                            <span>🚚 Courier:</span>
                            <strong className="text-white">{o.courierName || 'Shiprocket Express'}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>📦 AWB Code:</span>
                            <strong className="text-amber-400 font-bold">{o.awbCode || 'Assigned'}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                          <span>🚚 Courier Booking:</span>
                          <span className="text-amber-400/90 font-bold">Pending Shiprocket Auto-Book</span>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {o.awbCode ? (
                          <a
                            href={`https://shiprocket.co/tracking/${o.awbCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 py-1.5 px-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 shadow-sm transition"
                          >
                            <span>🚀 Track Courier Live on Shiprocket ↗</span>
                          </a>
                        ) : (
                          <div className="flex-1 bg-slate-900 text-slate-400 py-1.5 px-3 rounded-xl text-[10px] font-bold text-center border border-slate-800">
                            ⚡ Courier Tracking Active Upon Dispatch
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedUserInvoice(o)}
                          className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>📄 Invoice & Warranty</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <InvoiceModal
        order={selectedUserInvoice}
        isOpen={!!selectedUserInvoice}
        onClose={() => setSelectedUserInvoice(null)}
      />

      <ReviewModal
        isOpen={!!reviewProduct}
        product={reviewProduct}
        user={user}
        onClose={() => setReviewProduct(null)}
        onReviewSubmitted={(productId, newRating, count) => {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === productId ? { ...p, rating: newRating, reviewsCount: count } : p
            )
          );
          showToast('Verified Rating & Review published!', 'success');
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <ProductDetailModal
        isOpen={!!selectedDetailProduct}
        product={selectedDetailProduct}
        wishlistIds={wishlistIds}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
        onOpenReview={(prod) => setReviewProduct(prod)}
      />

      <WelcomeModal
        isOpen={isWelcomeOpen}
        user={user}
        onClose={() => setIsWelcomeOpen(false)}
      />

      <OrderSuccessModal
        isOpen={!!recentOrderSuccess}
        order={recentOrderSuccess}
        onClose={() => setRecentOrderSuccess(null)}
        onViewInvoice={(ord) => {
          setRecentOrderSuccess(null);
          setSelectedUserInvoice(ord);
        }}
      />
    </div>
  );
};

