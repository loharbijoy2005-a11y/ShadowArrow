'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight, Ban } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const id = product.id || product._id || product.slug;
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const defaultSize = product.category === 'Apparel' ? 'L' : product.category === 'Footwear' ? 'UK 9' : '';
    addToCart({
      product_id: id,
      title: product.title,
      price: product.price,
      quantity: 1,
      size: defaultSize,
      image: product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
      category: product.category,
    });
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform group-hover:-translate-y-1 flex flex-col h-full relative">
        
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
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            {isOutOfStock ? (
              <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-mono font-bold rounded-full uppercase tracking-wider shadow animate-pulse">
                OUT OF STOCK
              </span>
            ) : (
              discountPercent > 0 && (
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono font-bold rounded-full">
                  -{discountPercent}% OFF
                </span>
              )
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`absolute bottom-3 right-3 p-2.5 sm:p-3 rounded-full shadow-md transition-all transform ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-blue-600 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-90 sm:group-hover:scale-100'
            }`}
            title={isOutOfStock ? "Out of Stock" : "Quick Add to Cart"}
          >
            {isOutOfStock ? <Ban className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>

        {/* Info */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="font-mono">
              <span className="text-lg font-black text-slate-900">₹{product.price}</span>
              {product.compare_price > 0 && (
                <span className="text-xs text-slate-400 line-through ml-2">₹{product.compare_price}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center">
              View <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
