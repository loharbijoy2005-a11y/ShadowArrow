'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import AIChatWindow from '@/components/AIChatWindow';
import GalaxyVFXBackground from '@/components/GalaxyVFXBackground';
import MobileBottomNav from '@/components/MobileBottomNav';
import axios from 'axios';
import { SlidersHorizontal, Loader2, Bot, Package, ChevronLeft, ChevronRight, ArrowRight, LayoutGrid, Shirt, Footprints, Watch } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const CATEGORY_ITEMS = [
  { id: 'All', icon: LayoutGrid, title: 'All Drops' },
  { id: 'Apparel', icon: Shirt, title: 'Apparel' },
  { id: 'Footwear', icon: Footprints, title: 'Footwear' },
  { id: 'Accessories', icon: Watch, title: 'Accessories' },
];

const DEFAULT_HERO_SLIDES = [
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
];

export default function HomePage() {
  const [heroSlides, setHeroSlides] = useState<any[]>(DEFAULT_HERO_SLIDES);
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
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/cms/banners`);
      if (res.data && res.data.length > 0) {
        const mapped = res.data.map((b: any) => ({
          tag: 'SHADOW ARROW OFFICIAL',
          title: b.heading,
          desc: b.subtext || 'Exclusive streetwear drop engineered for ultimate style.',
          ctaText: 'Shop Now',
          ctaLink: b.target_link || '#catalog',
          image: b.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
        }));
        setHeroSlides(mapped);
      }
    } catch (err) {
      const cached = localStorage.getItem('shadow_hero_banners');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            const mapped = parsed.map((b: any) => ({
              tag: 'SHADOW ARROW OFFICIAL',
              title: b.heading,
              desc: b.subtext || 'Exclusive streetwear drop engineered for ultimate style.',
              ctaText: 'Shop Now',
              ctaLink: b.target_link || '#catalog',
              image: b.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
            }));
            setHeroSlides(mapped);
          }
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [heroSlides]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, category, sortOrder, true);
  }, [category, sortOrder]);

  const fetchProducts = async (pageNum: number, cat: string, sort: string, replace: boolean = false) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);

    try {
      let url = `${API_URL}/api/v1/products?limit=20&page=${pageNum}`;
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

  const filteredProducts = products.filter((p) => {
    if (p.is_hidden && searchQuery.trim() === '') return false;
    if (searchQuery.trim() === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  });

  const activeSlide = heroSlides[currentSlide] || heroSlides[0] || DEFAULT_HERO_SLIDES[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] md:bg-slate-50 text-[#e3e2e2] md:text-slate-900 font-body relative selection:bg-[#00e0ff] selection:text-[#050505]">
      <GalaxyVFXBackground />
      <Header onSearch={setSearchQuery} onToggleAI={() => setAiOpen(!aiOpen)} />

      {/* Mobile Hero Section (< md) */}
      <section className="block md:hidden relative min-h-[85vh] flex items-center justify-center overflow-hidden w-full py-10 px-4 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-cover bg-center w-full h-full opacity-25 mix-blend-luminosity rounded-3xl overflow-hidden" style={{ backgroundImage: `url('${activeSlide.image}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-xs text-[#00e0ff] bg-[#1e2020] border border-[#343535] px-4 py-1.5 rounded-full inline-block tracking-[0.25em] uppercase font-bold">
            {activeSlide.tag || 'PHASE 01 / INITIATION'}
          </span>
          
          <h1 className="font-sora font-extrabold text-3xl sm:text-6xl text-white tracking-tight leading-tight uppercase drop-shadow-2xl">
            {activeSlide.title}
          </h1>
          
          <p className="font-hanken text-sm sm:text-base text-[#bac9cd] max-w-2xl mx-auto leading-relaxed">
            {activeSlide.desc}
          </p>

          <div className="flex flex-col gap-4 justify-center items-center pt-4">
            <button
              onClick={() => {
                if (activeSlide.categoryFilter) setCategory(activeSlide.categoryFilter);
                const el = document.getElementById('catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#00e0ff] text-[#050505] font-sora font-bold text-xs px-8 py-4 uppercase tracking-[0.1em] hover:bg-[#00daf8] transition-colors duration-300 active:scale-95 w-full flex items-center justify-center space-x-2"
            >
              <span>{activeSlide.ctaText || 'Explore Collection'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAiOpen(true)}
              className="bg-[#121414]/80 border border-[#343535] text-[#e3e2e2] font-sora font-bold text-xs px-8 py-4 uppercase tracking-[0.1em] hover:border-[#00e0ff] hover:text-[#00e0ff] transition-all duration-300 active:scale-95 w-full flex items-center justify-center space-x-2 backdrop-blur-sm"
            >
              <Bot className="w-4 h-4 text-[#00e0ff]" />
              <span>Shadow AI Lab</span>
            </button>
          </div>
        </div>
      </section>

      {/* Desktop Hero Section (md+) */}
      <section className="hidden md:block relative overflow-hidden py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
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
                <Bot className="w-4 h-4 text-blue-400" />
                <span>Shadow AI</span>
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
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-950/80 hover:bg-black text-white rounded-full border border-slate-700 transition flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-950/80 hover:bg-black text-white rounded-full border border-slate-700 transition flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>



      {/* Core Technology Bento Grid (Mobile Only) */}
      <section className="block md:hidden py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="font-mono text-xs text-[#00e0ff] tracking-[0.25em] uppercase font-bold block">
            CORE ENGINEERING
          </span>
          <h2 className="font-sora text-2xl font-extrabold text-white uppercase tracking-tight">
            Performance Technology
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 auto-rows-[260px]">
          <div className="glass-panel relative overflow-hidden group cursor-pointer flex flex-col justify-end p-6 border-l-4 border-l-[#00e0ff]">
            <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-700 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800')" }}></div>
            <div className="relative z-10">
              <h3 className="font-sora text-lg font-bold text-white mb-1">Aero-Weave Fabric</h3>
              <p className="font-hanken text-xs text-[#bac9cd] mb-4">Hyper-breathable membrane regulating microclimate.</p>
              <span className="font-mono text-[10px] text-[#00e0ff] border-b border-[#00e0ff] pb-0.5 uppercase tracking-widest">Discover Tech</span>
            </div>
          </div>

          <div className="glass-panel relative overflow-hidden group cursor-pointer flex flex-col justify-end p-6 border-t border-[#343535] hover:border-[#00e0ff]/60 transition-colors">
            <h3 className="font-sora text-lg font-bold text-white mb-1">Magnetic Lock</h3>
            <p className="font-hanken text-xs text-[#bac9cd]">Silent, instantaneous magnetic fastening.</p>
          </div>

          <div className="glass-panel relative overflow-hidden group cursor-pointer flex flex-col justify-end p-6 border-b border-[#343535] hover:border-[#00e0ff]/60 transition-colors">
            <h3 className="font-sora text-lg font-bold text-[#e3e2e2] mb-1">DWR Hydro-Shield</h3>
            <p className="font-hanken text-xs text-[#bac9cd]">Extreme hydrophobic rain repellency.</p>
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <main id="catalog" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-[#050505] md:bg-slate-50">
        
        {/* Category Tabs & Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#343535]/50 md:border-slate-200">
          <div className="flex space-x-3 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {CATEGORY_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = category === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  title={item.title}
                  className={`px-4 py-2.5 font-mono text-xs font-bold uppercase transition-all duration-300 flex items-center space-x-2 shrink-0 border md:rounded-2xl ${
                    isActive
                      ? 'bg-[#00e0ff] text-[#050505] border-[#00e0ff] md:bg-slate-900 md:text-white md:border-slate-900 shadow-lg'
                      : 'bg-[#121414] text-[#bac9cd] border-[#343535] hover:text-white hover:border-[#00e0ff]/50 md:bg-white md:text-slate-700 md:border-slate-200 md:hover:bg-slate-100'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono self-end sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-[#00e0ff] md:text-slate-500" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-[#121414] md:bg-white border border-[#343535] md:border-slate-300 text-xs text-[#e3e2e2] md:text-slate-800 px-3 py-2 md:rounded-lg focus:outline-none focus:border-[#00e0ff] md:focus:ring-2 md:focus:ring-blue-500"
            >
              <option value="">Sort: Featured</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#00e0ff] md:text-slate-900" />
            <p className="text-xs font-mono font-bold text-[#bac9cd] md:text-slate-500 uppercase">Fetching Drops...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-[#121414] md:bg-white border border-[#343535] md:border-slate-200 md:rounded-full flex items-center justify-center mx-auto text-[#00e0ff] md:text-slate-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-sora font-bold text-white md:text-slate-900">No items match your query</h3>
            <p className="text-xs text-[#bac9cd] md:text-slate-500">Try adjusting your search query or category filter.</p>
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
          <div className="pt-8 pb-16 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-[#121414] md:bg-white hover:bg-[#1e2020] md:hover:bg-slate-100 border border-[#00e0ff]/60 md:border-slate-300 text-[#00e0ff] md:text-slate-900 font-mono text-xs uppercase tracking-widest md:rounded-full shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Items...</span>
                </>
              ) : (
                <span>Load More Drops</span>
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

