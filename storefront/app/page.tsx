'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import AIChatWindow from '@/components/AIChatWindow';
import GalaxyVFXBackground from '@/components/GalaxyVFXBackground';
import MobileBottomNav from '@/components/MobileBottomNav';
import axios from 'axios';
import { SlidersHorizontal, Loader2, Sparkles, Package, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const HERO_SLIDES = [
  {
    tag: 'LIMITED DROP 2026 • URBAN STREETWEAR',
    title: 'REDEFINE YOUR OVERSIZED SILHOUETTE',
    desc: 'Crafted from heavy 350-450 GSM French Terry cotton. Signature drop-shoulder boxy fits engineered for urban comfort.',
    ctaText: 'Shop New Drops',
    ctaLink: '#catalog',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
  },
  {
    tag: 'CYBER TECHWEAR & FOOTWEAR',
    title: 'HIGH-TRACTION CYBER FOOTWEAR',
    desc: 'Ergonomic dual-density EVA midsoles paired with ballistic nylon uppers. All-terrain durability and street performance.',
    ctaText: 'Explore Footwear',
    ctaLink: '#catalog',
    categoryFilter: 'Footwear',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
  },
  {
    tag: 'MINIMALIST HARDWARE & ACCESSORIES',
    title: 'TECHNICAL LIFESTYLE ESSENTIALS',
    desc: 'Insulated 304 food-grade stainless hydro flasks, high-precision sensors, and waterproof Cordura slings.',
    ctaText: 'Discover Accessories',
    ctaLink: '#catalog',
    categoryFilter: 'Accessories',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Hero Auto-Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, category, sortOrder, true);
  }, [category, sortOrder]);

  const fetchProducts = async (pageNum: number, cat: string, sort: string, replace: boolean = false) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);

    try {
      let url = `${API_URL}/api/v1/products?limit=12&page=${pageNum}`;
      if (cat && cat !== 'All') url += `&category=${encodeURIComponent(cat)}`;
      if (sort) url += `&sort=${sort}`;

      const res = await axios.get(url);
      const newItems = res.data.products || [];
      setHasMore(res.data.has_more || false);

      if (replace) {
        setProducts(newItems);
      } else {
        setProducts((prev) => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error('Failed to load products from Golang API', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, category, sortOrder, false);
  };

  const filteredProducts = products.filter((p) =>
    searchQuery === ''
      ? true
      : p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      <GalaxyVFXBackground />
      <Header onSearch={setSearchQuery} onToggleAI={() => setAiOpen(!aiOpen)} />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 min-h-[360px] transition-all duration-700">
          
          {/* Text Content */}
          <div className="space-y-4 max-w-xl z-10">
            <span className="px-3.5 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold rounded-full inline-block">
              {activeSlide.tag}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none uppercase">
              {activeSlide.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              {activeSlide.desc}
            </p>
            <div className="pt-2 flex items-center space-x-4">
              <button
                onClick={() => {
                  if (activeSlide.categoryFilter) setCategory(activeSlide.categoryFilter);
                  const el = document.getElementById('catalog');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center space-x-2"
              >
                <span>{activeSlide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAiOpen(true)}
                className="flex items-center space-x-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Fashion Advisor</span>
              </button>
            </div>
          </div>

          {/* Banner Image */}
          <div className="w-full md:w-1/2 aspect-video md:aspect-square max-h-64 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 shrink-0 relative group">
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-105"
            />
          </div>

          {/* Controls */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-950/80 hover:bg-black text-white rounded-full border border-slate-700 transition hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-950/80 hover:bg-black text-white rounded-full border border-slate-700 transition hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === idx ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Crisp Amazon-Style Product Catalog */}
      <main id="catalog" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-slate-50">
        
        {/* Category Tabs & Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {['All', 'Apparel', 'Footwear', 'Accessories'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  category === cat
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium self-end sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Featured Sort</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            <p className="text-xs font-mono font-bold text-slate-500 uppercase">Fetching Catalog Items...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900">No items match your criteria</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id || product._id || product.slug} product={product} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="pt-8 pb-12 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-full shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Items...</span>
                </>
              ) : (
                <span>Load More Products</span>
              )}
            </button>
          </div>
        )}
      </main>

      <AIChatWindow isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      <MobileBottomNav onToggleAI={() => setAiOpen(!aiOpen)} />
    </div>
  );
}
