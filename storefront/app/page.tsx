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
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#e3e2e2] font-body relative selection:bg-[#00e0ff] selection:text-[#050505]">
      <GalaxyVFXBackground />
      <Header onSearch={setSearchQuery} onToggleAI={() => setAiOpen(!aiOpen)} />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-cover bg-center w-full h-full opacity-30 mix-blend-luminosity rounded-3xl overflow-hidden" style={{ backgroundImage: `url('${activeSlide.image}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent"></div>
        
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={() => {
                if (activeSlide.categoryFilter) setCategory(activeSlide.categoryFilter);
                const el = document.getElementById('catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#00e0ff] text-[#050505] font-sora font-bold text-xs px-8 py-4 uppercase tracking-[0.1em] hover:bg-[#00daf8] transition-colors duration-300 active:scale-95 w-full sm:w-auto flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>{activeSlide.ctaText || 'Explore Collection'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAiOpen(true)}
              className="bg-[#121414]/80 border border-[#343535] text-[#e3e2e2] font-sora font-bold text-xs px-8 py-4 uppercase tracking-[0.1em] hover:border-[#00e0ff] hover:text-[#00e0ff] transition-all duration-300 active:scale-95 w-full sm:w-auto flex items-center justify-center space-x-2 backdrop-blur-sm"
            >
              <Bot className="w-4 h-4 text-[#00e0ff]" />
              <span>Shadow AI Lab</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stealth Series Horizontal Scroll */}
      <section className="py-12 w-full bg-[#0d0e0f] border-y border-[#343535]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex justify-between items-end border-b border-[#343535]/50 pb-4">
          <div>
            <span className="font-mono text-[10px] text-[#00e0ff] tracking-[0.2em] uppercase font-bold block mb-1">
              LIMITED DROP
            </span>
            <h2 className="font-sora text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
              Stealth Series
            </h2>
          </div>
          <a href="#catalog" className="font-mono text-xs text-[#00e0ff] hover:text-white uppercase flex items-center gap-1.5 transition-colors">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex overflow-x-auto gap-6 px-4 sm:px-8 max-w-7xl mx-auto pb-6 hide-scrollbar snap-x snap-mandatory">
          <div className="min-w-[280px] sm:min-w-[360px] flex-shrink-0 snap-center group cursor-pointer bg-[#121414] border border-[#343535] hover:border-[#00e0ff]/60 transition-all p-4">
            <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-[#050505]">
              <img
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"
                alt="Obsidian Shell"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <span className="absolute top-3 left-3 bg-[#1e2020] text-[#00e0ff] font-mono text-[9px] px-2 py-1 uppercase tracking-widest border border-[#343535]">NEW</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sora font-semibold text-white text-base">Obsidian Shell</h3>
                <p className="font-hanken text-xs text-[#bac9cd] mt-0.5">Lightweight Tactical Layer</p>
              </div>
              <span className="font-mono text-xs font-bold text-[#00e0ff] bg-[#1e2020] px-2.5 py-1 border border-[#343535]">₹4,499</span>
            </div>
          </div>

          <div className="min-w-[280px] sm:min-w-[360px] flex-shrink-0 snap-center group cursor-pointer bg-[#121414] border border-[#343535] hover:border-[#00e0ff]/60 transition-all p-4">
            <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-[#050505]">
              <img
                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800"
                alt="Aegis Footwear"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <span className="absolute top-3 left-3 bg-[#1e2020] text-[#00e0ff] font-mono text-[9px] px-2 py-1 uppercase tracking-widest border border-[#343535]">LIMITED</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sora font-semibold text-white text-base">Aegis Cyber Kicks</h3>
                <p className="font-hanken text-xs text-[#bac9cd] mt-0.5">All-Terrain Cyber Footwear</p>
              </div>
              <span className="font-mono text-xs font-bold text-[#00e0ff] bg-[#1e2020] px-2.5 py-1 border border-[#343535]">₹6,999</span>
            </div>
          </div>

          <div className="min-w-[280px] sm:min-w-[360px] flex-shrink-0 snap-center group cursor-pointer bg-[#121414] border border-[#343535] hover:border-[#00e0ff]/60 transition-all p-4">
            <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-[#050505]">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800"
                alt="Phantom Trousers"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sora font-semibold text-white text-base">Phantom Trousers</h3>
                <p className="font-hanken text-xs text-[#bac9cd] mt-0.5">Articulated Cyber Cargos</p>
              </div>
              <span className="font-mono text-xs font-bold text-[#00e0ff] bg-[#1e2020] px-2.5 py-1 border border-[#343535]">₹3,799</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Technology Bento Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="font-mono text-xs text-[#00e0ff] tracking-[0.25em] uppercase font-bold block">
            CORE ENGINEERING
          </span>
          <h2 className="font-sora text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            Performance Technology
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px] sm:auto-rows-[340px]">
          {/* Large Feature Card */}
          <div className="md:col-span-2 glass-panel relative overflow-hidden group cursor-pointer flex flex-col justify-end p-8 border-l-4 border-l-[#00e0ff]">
            <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-700 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800')" }}></div>
            <div className="relative z-10 max-w-lg">
              <h3 className="font-sora text-xl font-bold text-white mb-2">Aero-Weave Fabric</h3>
              <p className="font-hanken text-xs text-[#bac9cd] mb-6 leading-relaxed">Proprietary hyper-breathable membrane regulating microclimate while providing environmental shielding.</p>
              <span className="font-mono text-xs text-[#00e0ff] border-b border-[#00e0ff] pb-1 uppercase tracking-widest">Discover Tech</span>
            </div>
          </div>

          {/* Small Feature 1 */}
          <div className="glass-panel relative overflow-hidden group cursor-pointer flex flex-col justify-end p-6 border-t border-[#343535] hover:border-[#00e0ff]/60 transition-colors">
            <h3 className="font-sora text-lg font-bold text-white mb-1">Magnetic Lock</h3>
            <p className="font-hanken text-xs text-[#bac9cd]">Silent, instantaneous magnetic fastening.</p>
          </div>

          {/* Small Feature 2 */}
          <div className="glass-panel relative overflow-hidden group cursor-pointer flex flex-col justify-end p-6 border-b border-[#343535] hover:border-[#00e0ff]/60 transition-colors">
            <h3 className="font-sora text-lg font-bold text-[#e3e2e2] mb-1">DWR Hydro-Shield</h3>
            <p className="font-hanken text-xs text-[#bac9cd]">Extreme hydrophobic rain repellency.</p>
          </div>

          {/* Medium Feature */}
          <div className="md:col-span-2 glass-panel relative overflow-hidden group cursor-pointer flex items-center p-8 bg-[#121414]/60">
            <div className="relative z-10 w-full flex justify-between items-center">
              <div>
                <h3 className="font-sora text-xl font-bold text-white mb-2">Bespoke Custom Lab</h3>
                <p className="font-hanken text-xs text-[#bac9cd] max-w-md">Tailored sizing & custom cyber fit engineered specifically for your body silhouette.</p>
              </div>
              <div className="h-16 w-16 rounded-full border border-[#00e0ff]/50 flex items-center justify-center text-[#00e0ff] shrink-0 font-mono font-bold text-xs">
                LAB
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <main id="catalog" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-[#050505]">
        
        {/* Category Tabs & Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#343535]/50">
          <div className="flex space-x-3 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {CATEGORY_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = category === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  title={item.title}
                  className={`px-4 py-2.5 font-mono text-xs font-bold uppercase transition-all duration-300 flex items-center space-x-2 shrink-0 border ${
                    isActive
                      ? 'bg-[#00e0ff] text-[#050505] border-[#00e0ff] shadow-lg'
                      : 'bg-[#121414] text-[#bac9cd] border-[#343535] hover:text-white hover:border-[#00e0ff]/50'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono self-end sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-[#00e0ff]" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-[#121414] border border-[#343535] text-xs text-[#e3e2e2] px-3 py-2 focus:outline-none focus:border-[#00e0ff]"
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
            <Loader2 className="w-8 h-8 animate-spin text-[#00e0ff]" />
            <p className="text-xs font-mono font-bold text-[#bac9cd] uppercase">Fetching Drops...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-[#121414] border border-[#343535] flex items-center justify-center mx-auto text-[#00e0ff]">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-sora font-bold text-white">No items match your query</h3>
            <p className="text-xs text-[#bac9cd]">Try adjusting your search query or category filter.</p>
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
              className="px-8 py-3 bg-[#121414] hover:bg-[#1e2020] border border-[#00e0ff]/60 text-[#00e0ff] font-mono text-xs uppercase tracking-widest transition flex items-center space-x-2 disabled:opacity-50"
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

