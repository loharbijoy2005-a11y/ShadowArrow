'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight, Ban, Star, Check, Coins } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const id = product.id || product._id || product.slug;
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const btn = e.currentTarget as HTMLElement;
    const defaultSize = product.category === 'Apparel' ? 'L' : product.category === 'Footwear' ? 'UK 9' : '';
    addToCart({
      product_id: id,
      title: product.title,
      price: product.price,
      quantity: 1,
      size: defaultSize,
      image: product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
      category: product.category,
    }, btn);

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const comparePrice = Number(product.compare_price || product.comparePrice || product.original_price || product.mrp || 0);
  const currentPrice = Number(product.price || 0);
  const discountPercent = (comparePrice > currentPrice && comparePrice > 0)
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;

  const subtitle = product.category === 'Apparel'
    ? 'Oversized Boxy Fit Cotton'
    : product.category === 'Footwear'
    ? 'All-Terrain Techwear Sole'
    : 'Minimalist Premium Accessory';

  return (
    <Link href={`/product/${id}`} className="group block h-full">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 flex flex-col h-full relative">
        
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <img
            src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isOutOfStock ? 'opacity-40 grayscale' : 'group-hover:scale-105'
            }`}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
            <span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            {isOutOfStock ? (
              <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-mono font-bold rounded-full uppercase tracking-wider shadow animate-pulse">
                OUT OF STOCK
              </span>
            ) : (
              discountPercent > 0 && (
                <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-sans font-black rounded-lg shadow-md uppercase tracking-wider">
                  -{discountPercent}% OFF
                </span>
              )
            )}
          </div>

          {/* Star Rating Overlay */}
          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-400 px-2 py-1 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 shadow">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-white">4.9</span>
            <span className="text-slate-400">(128)</span>
          </div>
        </div>

        {/* Info Container */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>

            {/* Dynamic ArrowCoins Earning Badge */}
            <div className="mt-2.5 inline-flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-lg text-[11px] font-mono font-bold text-amber-800">
              <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Earn {Math.floor(product.price * 0.01)} ArrowCoins</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="font-mono">
              <span className="text-lg font-black text-slate-900">₹{product.price}</span>
              {comparePrice > currentPrice && (
                <span className="text-xs text-slate-400 line-through ml-2">₹{comparePrice}</span>
              )}
            </div>

            {/* Interactive Add Button */}
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all duration-300 flex items-center space-x-1.5 shadow ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : added
                  ? 'bg-emerald-600 text-white scale-105'
                  : 'bg-slate-900 hover:bg-blue-600 text-white active:scale-95'
              }`}
            >
              {isOutOfStock ? (
                <span>Sold Out</span>
              ) : added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
