'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, Check, Coins } from 'lucide-react';
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
    ? 'Oversized Tactical Layer'
    : product.category === 'Footwear'
    ? 'All-Terrain Cyber Footwear'
    : 'Bespoke Technical Carry';

  return (
    <Link href={`/product/${id}`} className="group block h-full">
      <div className="bg-[#0d0e0f] border border-[#343535] group-hover:border-[#00e0ff]/60 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
        
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#121414]">
          <img
            src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
            alt={product.title}
            className={`w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 ${
              isOutOfStock ? 'opacity-30 grayscale' : 'group-hover:scale-105'
            }`}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
            <span className="px-2.5 py-1 bg-[#1e2020]/90 backdrop-blur-md text-[#00e0ff] border border-[#343535] text-[10px] font-mono font-bold uppercase tracking-widest">
              {product.category}
            </span>
            {isOutOfStock ? (
              <span className="px-2.5 py-1 bg-red-950/90 text-red-400 border border-red-800/50 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                SOLDOUT
              </span>
            ) : (
              discountPercent > 0 && (
                <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                  -{discountPercent}% OFF
                </span>
              )
            )}
          </div>

          {/* Star Rating Overlay */}
          <div className="absolute top-3 right-3 bg-[#050505]/80 backdrop-blur-md text-amber-400 px-2 py-1 text-[10px] font-mono font-bold flex items-center space-x-1 border border-[#343535]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-white">4.9</span>
          </div>
        </div>

        {/* Info Container */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#0d0e0f]">
          <div>
            <h3 className="font-sora font-semibold text-white text-base leading-snug group-hover:text-[#00e0ff] transition-colors">
              {product.title}
            </h3>
            <p className="font-hanken text-xs text-[#bac9cd] mt-1 opacity-80">{subtitle}</p>

            {/* Dynamic ArrowCoins Earning Badge */}
            <div className="mt-2.5 inline-flex items-center space-x-1.5 px-2 py-0.5 bg-[#1e2020] border border-[#343535] text-[10px] font-mono font-bold text-amber-400">
              <Coins className="w-3 h-3 text-amber-400 shrink-0" />
              <span>+{Math.floor(product.price * 0.01)} ArrowCoins</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#343535]/60 flex items-center justify-between">
            <div className="font-mono">
              <span className="text-base font-bold text-[#00e0ff] bg-[#1e2020] px-2.5 py-1 border border-[#343535]">₹{product.price}</span>
              {comparePrice > currentPrice && (
                <span className="text-xs text-slate-500 line-through ml-2">₹{comparePrice}</span>
              )}
            </div>

            {/* Interactive Add Button */}
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`px-3 py-1.5 font-mono text-xs font-bold transition-all duration-300 flex items-center space-x-1.5 uppercase ${
                isOutOfStock
                  ? 'bg-[#1e2020] text-slate-500 cursor-not-allowed border border-[#343535]'
                  : added
                  ? 'bg-emerald-500 text-[#050505] font-bold'
                  : 'bg-[#00e0ff] hover:bg-[#00daf8] text-[#050505] active:scale-95'
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

