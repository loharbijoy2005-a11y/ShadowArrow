'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import SizeGuideModal from '@/components/SizeGuideModal';
import AIChatWindow from '@/components/AIChatWindow';
import ProductCard from '@/components/ProductCard';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight, ArrowLeft, Ruler, ShieldCheck, Truck, Sparkles, Loader2, Ban } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/products/${id}`);
      const prodData = res.data;
      setProduct(prodData);

      const imgs = prodData.images && prodData.images.length > 0 ? prodData.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'];
      setSelectedImage(imgs[0]);

      if (prodData.category === 'Apparel') {
        setSelectedSize('L');
      } else if (prodData.category === 'Footwear') {
        setSelectedSize('UK 9');
      } else {
        setSelectedSize('');
      }

      fetchRelated(prodData.category);
    } catch (err) {
      console.error('Failed to fetch product details', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (category: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/products?category=${encodeURIComponent(category)}&limit=4`);
      const list = res.data.products || [];
      setRelatedProducts(list.filter((p: any) => (p.id || p._id || p.slug) !== id));
    } catch (err) {
      console.error('Failed to fetch related products', err);
    }
  };

  const isOutOfStock = product ? product.stock <= 0 : false;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (!product || isOutOfStock) return;
    const prodId = product.id || product._id || product.slug;
    const btn = e?.currentTarget as HTMLElement | undefined;
    addToCart({
      product_id: prodId,
      title: product.title,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      image: selectedImage,
      category: product.category,
    }, btn);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    setIsCartOpen(false);
    router.push('/checkout?buyNow=true');
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white">
        <Header onToggleAI={() => setAiOpen(!aiOpen)} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-xs font-mono font-bold text-slate-400">Loading Product Details...</p>
        </div>
      </div>
    );
  }

  const category = product.category || 'Apparel';
  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header onToggleAI={() => setAiOpen(!aiOpen)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        
        {/* Prominent Back Button */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>← Back to Products</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative">
              <img
                src={selectedImage}
                alt={product.title}
                className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                  <span className="px-6 py-3 bg-red-600 text-white font-mono font-black text-lg uppercase tracking-widest rounded-2xl shadow-2xl animate-pulse">
                    OUT OF STOCK
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      selectedImage === imgUrl ? 'border-blue-500 shadow-lg scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase rounded-full tracking-wider border border-blue-500/30">
                  {category}
                </span>
                {isOutOfStock ? (
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-mono font-bold uppercase rounded-full tracking-wider">
                    OUT OF STOCK
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase rounded-full tracking-wider">
                    IN STOCK ({product.stock} units)
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black text-white mt-2 uppercase tracking-tight">{product.title}</h1>
            </div>

            {/* Price */}
            {(() => {
              const comparePrice = Number(product.compare_price || product.comparePrice || product.original_price || product.mrp || 0);
              const currentPrice = Number(product.price || 0);
              const discountPercent = (comparePrice > currentPrice && comparePrice > 0)
                ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
                : 0;
              const savingsAmount = comparePrice > currentPrice ? comparePrice - currentPrice : 0;

              return (
                <div className="flex flex-wrap items-center gap-3 border-y border-slate-800 py-4 font-mono">
                  <span className="text-3xl font-black text-white">₹{currentPrice}</span>
                  {comparePrice > currentPrice && (
                    <>
                      <span className="text-base text-slate-500 line-through font-semibold">₹{comparePrice}</span>
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 font-bold font-sans border border-red-500/30 text-xs rounded-full flex items-center space-x-1">
                        <span>-{discountPercent}% OFF</span>
                        {savingsAmount > 0 && <span className="text-[10px] text-red-300 opacity-90">(Save ₹{savingsAmount.toLocaleString('en-IN')})</span>}
                      </span>
                    </>
                  )}
                  <span className="text-xs text-emerald-400 font-bold font-sans bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    Inclusive of all Taxes
                  </span>
                </div>
              );
            })()}

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed font-sans">{product.description}</p>

            {/* Specifications */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider font-mono">Style & Fit Features</h3>
              {category === 'Apparel' && (
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p>• Fit: <span className="font-semibold text-white">{product.specs?.fit || 'Oversized Boxy Fit'}</span></p>
                  <p>• Material: <span className="font-semibold text-white">{product.specs?.material || '100% Premium Cotton'}</span></p>
                </div>
              )}
              {category === 'Footwear' && (
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p>• Material: <span className="font-semibold text-white">{product.specs?.material || 'Ballistic Nylon Upper'}</span></p>
                  <p>• Sole: <span className="font-semibold text-white">Ergonomic EVA Sole</span></p>
                </div>
              )}
              {category === 'Accessories' && (
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p>• Feature: <span className="font-semibold text-white">{product.specs?.dpi || 'High Precision Sensor'}</span></p>
                  <p>• Weight: <span className="font-semibold text-white">{product.specs?.weight || 'Lightweight'}</span></p>
                </div>
              )}
            </div>

            {/* Size Selectors */}
            {category === 'Apparel' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-white uppercase font-mono">Select Apparel Size</label>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex space-x-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      disabled={isOutOfStock}
                      className={`w-12 h-12 rounded-xl text-xs font-bold font-mono transition-all ${
                        selectedSize === sz
                          ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                          : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                      } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons - Disabled when isOutOfStock */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={(e) => handleAddToCart(e)}
                disabled={isOutOfStock}
                className={`py-4 border rounded-2xl flex items-center justify-center space-x-2 font-bold text-xs uppercase tracking-wider transition shadow-md ${
                  isOutOfStock
                    ? 'bg-slate-950 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    : 'bg-slate-950 border-slate-700 hover:bg-slate-800 text-white active:scale-98'
                }`}
              >
                {isOutOfStock ? <Ban className="w-4 h-4 text-red-500" /> : <ShoppingBag className="w-4 h-4 text-blue-400" />}
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-4 rounded-2xl flex items-center justify-center space-x-2 font-bold text-xs uppercase tracking-wider transition shadow-xl ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    : 'flashing-buy-now text-white active:scale-98'
                }`}
              >
                <span>{isOutOfStock ? 'Sold Out' : 'Buy Now'}</span>
                {!isOutOfStock && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-slate-800">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProd) => (
                <ProductCard key={relProd.id || relProd._id || relProd.slug} product={relProd} />
              ))}
            </div>
          </section>
        )}
      </main>

      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}
      <AIChatWindow isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
