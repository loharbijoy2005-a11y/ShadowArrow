import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Zap, ShieldCheck, Truck, Check, Heart, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  isOpen: boolean;
  product: Product | null;
  wishlistIds: string[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onOpenReview?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  product,
  wishlistIds,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onOpenReview
}) => {
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'delivery'>('overview');

  useEffect(() => {
    if (product) {
      setSelectedImg(product.image);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const isWishlisted = wishlistIds.includes(product.id);
  const images = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.image];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-5">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh] animate-popIn">
        
        {/* HEADER BAR */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              {product.category}
            </span>
            {product.isPrime && (
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-cyan-400" /> PRIME 3-DAY AIR
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY GRID */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT: INTERACTIVE IMAGE GALLERY WITH ZOOM */}
          <div className="space-y-4">
            {/* MAIN DISPLAY IMAGE */}
            <div className="relative h-72 sm:h-80 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden group flex items-center justify-center">
              <img
                src={selectedImg || product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500 cursor-zoom-in"
              />
              <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                {product.discountPercent}% OFF
              </div>
              <button
                onClick={() => onToggleWishlist(product)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-400 transition"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            {/* THUMBNAILS CAROUSEL */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(imgUrl)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-950 p-1 flex-shrink-0 transition ${
                      selectedImg === imgUrl ? 'border-amber-500 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}

            {/* WARRANTY & VERIFIED QUALITY BADGES */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{product.warranty || '1 Year Official Brand Warranty'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Truck className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>Dispatched from Central Warehouse Bankura (722157)</span>
              </div>
            </div>
          </div>

          {/* RIGHT: A-Z PRODUCT SPECS & PURCHASE CONTROLS */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <h2 className="font-black text-xl sm:text-2xl text-white leading-tight">{product.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{product.subtitle}</p>
              </div>

              {/* RATING BADGE */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenReview) onOpenReview(product);
                  }}
                  className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-amber-500/50 transition"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white text-xs">{product.rating}</span>
                  <span className="text-emerald-400 font-bold text-xs">
                    {product.reviewsCount > 0 ? `(${product.reviewsCount} verified reviews)` : '⭐ Fresh Stock'}
                  </span>
                </button>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg">
                  🔥 Only {product.stockCount} Left in Stock
                </span>
              </div>

              {/* PRICE */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-white">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-400 font-bold">Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')} ({product.discountPercent}% Off)</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <span>Inclusive of GST & Taxes</span>
                  <div className="text-emerald-400 font-bold">FREE Delivery Available</div>
                </div>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex border-b border-slate-800 text-xs font-bold gap-4 pt-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 border-b-2 transition ${activeTab === 'overview' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400'}`}
                >
                  Overview & Features
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 border-b-2 transition ${activeTab === 'specs' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400'}`}
                >
                  Tech Specs Sheet
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                  <p>{product.description}</p>
                  {product.highlights && product.highlights.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Key Product Highlights:</h4>
                      <ul className="space-y-1 text-slate-300">
                        {product.highlights.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ZERO FAKE REVIEWS NOTICE */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-center space-y-1 mt-2">
                    <div className="font-bold text-amber-400 text-xs flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{product.reviewsCount > 0 ? `${product.rating} / 5.0 (${product.reviewsCount} Verified Reviews)` : '⭐ Fresh Stock — Be the 1st Verified Buyer!'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {product.reviewsCount > 0 ? 'All ratings are submitted by verified purchasers.' : '0 orders fulfilled yet. Purchase this item to submit the 1st verified rating.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: SPECS TABLE */}
              {activeTab === 'specs' && (
                <div className="space-y-2 text-xs">
                  {product.specs ? (
                    <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800">
                      {Object.entries(product.specs).map(([key, val]) => (
                        <div key={key} className="p-2.5 flex justify-between">
                          <span className="text-slate-400 font-medium">{key}</span>
                          <span className="text-white font-bold font-mono">{val}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">100% Genuine Prime Product specs verified by Shadow Arrow.</p>
                  )}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => onAddToCart(product)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3.5 rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onBuyNow(product);
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3.5 rounded-xl text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] transition transform hover:scale-105 flex items-center justify-center gap-1.5"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
