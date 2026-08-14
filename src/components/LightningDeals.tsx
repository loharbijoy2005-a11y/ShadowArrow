import React, { useState, useEffect } from 'react';
import { Zap, Heart, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface LightningDealsProps {
  products: Product[];
  wishlistIds: string[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onOpenReview?: (product: Product) => void;
  onOpenDetail?: (product: Product) => void;
}

const getRemainingSaleSeconds = () => {
  // Absolute World-Clock UTC Epoch Timestamp calculation
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const cycleSeconds = 5 * 3600; // 5-Hour Absolute World-Clock Cycle
  const remaining = cycleSeconds - (nowInSeconds % cycleSeconds);
  return remaining;
};

export const LightningDeals: React.FC<LightningDealsProps> = ({
  products,
  wishlistIds,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onOpenReview,
  onOpenDetail
}) => {
  const [timeLeft, setTimeLeft] = useState(getRemainingSaleSeconds());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getRemainingSaleSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <section id="lightning-deals-section" className="py-12 bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER WITH COUNTDOWN TIMER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-500 text-2xl animate-pulse">
              <Zap className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <h2 className="font-black text-2xl sm:text-3xl text-white flex items-center justify-center md:justify-start gap-2">
                ⚡ Today's Mega Savings
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">Exclusive flash discounts on high-demand gear. Limited stock remaining.</p>
            </div>
          </div>

          {/* COUNTDOWN TIMER WIDGET */}
          <div className="flex items-center gap-3 bg-slate-950 px-5 py-3 rounded-xl border border-slate-800 shadow-inner">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ends In:</span>
            <div className="flex items-center gap-1.5 font-mono font-black text-white text-base sm:text-lg">
              <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-md">{hours}</span>
              <span className="text-amber-500">:</span>
              <span className="bg-slate-900 text-amber-400 px-2.5 py-1 rounded-md border border-slate-800">{minutes}</span>
              <span className="text-amber-500">:</span>
              <span className="bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-md border border-slate-800">{seconds}</span>
            </div>
          </div>
        </div>

        {/* 4-COLUMN PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            return (
              <div
                key={product.id}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-amber-500 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                {/* MEDIA HEADER */}
                <div
                  onClick={() => onOpenDetail && onOpenDetail(product)}
                  className="relative h-52 bg-slate-950 overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>

                  {/* DISCOUNT TAG */}
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    {product.discountPercent}% OFF
                  </div>

                  {/* WISHLIST TOGGLE BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-400 transition"
                    title="Add to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                {/* CARD BODY */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-left">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                      <span className="uppercase tracking-wider text-amber-500 font-bold">{product.category}</span>
                      <button
                        onClick={() => onOpenReview && onOpenReview(product)}
                        className="flex items-center gap-1 text-amber-400 hover:scale-105 transition"
                        title="Click to write a Verified Review"
                      >
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="font-bold text-white">{product.reviewsCount > 0 ? product.rating : '5.0'}</span>
                        <span className="text-emerald-400 font-bold text-[10px]">
                          {product.reviewsCount > 0 ? `(${product.reviewsCount})` : '⭐ Fresh Stock'}
                        </span>
                      </button>
                    </div>

                    <h3
                      onClick={() => onOpenDetail && onOpenDetail(product)}
                      className="font-black text-sm text-white line-clamp-1 group-hover:text-amber-400 transition cursor-pointer"
                    >
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{product.subtitle}</p>
                  </div>

                  {/* SCARCITY BAR */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                      <span>Delivery: <strong className="text-emerald-400">3 - 4 Days Express</strong></span>
                      <span className="text-amber-400">🔥 Only {product.stockCount} left</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full"
                        style={{ width: `${Math.min(100, (10 - product.stockCount) * 10)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* PRICE FORMATTING IN INR */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black text-white">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span className="line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        <span className="text-emerald-400 font-bold">Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                      <span>Add</span>
                    </button>

                    <button
                      onClick={() => onBuyNow(product)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black py-2 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition transform hover:scale-105 flex items-center justify-center gap-1"
                    >
                      <span>Buy Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
