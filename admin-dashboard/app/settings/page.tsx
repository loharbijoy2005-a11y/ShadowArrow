'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { Settings, Shield, Key, Save, CheckCircle2, Lock, Smartphone, Database, Mail, Globe, Palette, Eye, ShoppingCart, Zap, RefreshCw, Check, Layout, CreditCard, Monitor, Sun, Moon, Sparkles, Sliders } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const PRESET_THEMES = [
  { name: 'Pure White Minimal', accentHue: 217, bgDarkness: 0, glowIntensity: 20, buyNowHue: 142, addCartHue: 217, checkoutHue: 217 },
  { name: 'Pearl White Emerald', accentHue: 155, bgDarkness: 5, glowIntensity: 30, buyNowHue: 155, addCartHue: 155, checkoutHue: 155 },
  { name: 'Cyber Blue Dark', accentHue: 217, bgDarkness: 96, glowIntensity: 75, buyNowHue: 142, addCartHue: 217, checkoutHue: 217 },
  { name: 'Neon Emerald Dark', accentHue: 155, bgDarkness: 96, glowIntensity: 85, buyNowHue: 155, addCartHue: 155, checkoutHue: 155 },
  { name: 'Violet Syndicate', accentHue: 270, bgDarkness: 96, glowIntensity: 90, buyNowHue: 330, addCartHue: 270, checkoutHue: 270 },
  { name: 'Amber Gold Dark', accentHue: 38, bgDarkness: 96, glowIntensity: 80, buyNowHue: 38, addCartHue: 38, checkoutHue: 38 },
];

const PRESET_SWATCHES = [
  { hue: 217, name: 'Royal Blue' },
  { hue: 155, name: 'Emerald' },
  { hue: 270, name: 'Violet' },
  { hue: 38, name: 'Gold' },
  { hue: 0, name: 'Crimson' },
  { hue: 180, name: 'Cyan' },
];

export default function SettingsAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState<'CATALOG' | 'PRODUCT' | 'CHECKOUT' | 'NAVBAR'>('CATALOG');

  // Store General Profile
  const [storeName, setStoreName] = useState('SHADOW ARROW');
  const [supportEmail, setSupportEmail] = useState('support.shadowarrow@gmail.com');
  const [supportPhone, setSupportPhone] = useState('+91 9002376609');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Master HSL & Slider Controls matching UI Photo
  const [accentHue, setAccentHue] = useState<number>(217);
  const [bgDarkness, setBgDarkness] = useState<number>(96);
  const [glowIntensity, setGlowIntensity] = useState<number>(71);

  // Divided Section Sliders
  const [buyNowHue, setBuyNowHue] = useState<number>(142);
  const [addCartHue, setAddCartHue] = useState<number>(217);
  const [checkoutHue, setCheckoutHue] = useState<number>(217);

  // Apply Live DOM Updates instantly on input
  const updateLiveDOM = useCallback((hue: number, darkness: number, glow: number, bHue: number, aHue: number, cHue: number) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.style.setProperty('--accent-hue', hue.toString());
    root.style.setProperty('--bg-darkness', darkness + '%');
    root.style.setProperty('--glow-intensity', (glow / 100).toString());
    root.style.setProperty('--buy-now-hue', bHue.toString());
    root.style.setProperty('--add-cart-hue', aHue.toString());
    root.style.setProperty('--checkout-hue', cHue.toString());

    // Compute HSL hex equivalents
    const primaryHex = `hsl(${hue}, 85%, 55%)`;
    const buyNowHex = `hsl(${bHue}, 85%, 45%)`;
    const addCartHex = `hsl(${aHue}, 75%, 22%)`;
    const checkoutHex = `hsl(${cHue}, 85%, 55%)`;
    const bgHex = `hsl(${hue}, 25%, ${Math.max(2, 100 - darkness)}%)`;

    root.style.setProperty('--color-primary', primaryHex);
    root.style.setProperty('--color-buy-now', buyNowHex);
    root.style.setProperty('--color-add-cart', addCartHex);
    root.style.setProperty('--color-checkout-btn', checkoutHex);
    root.style.setProperty('--color-bg', bgHex);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchSettings();
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    updateLiveDOM(accentHue, bgDarkness, glowIntensity, buyNowHue, addCartHue, checkoutHue);
  }, [accentHue, bgDarkness, glowIntensity, buyNowHue, addCartHue, checkoutHue, updateLiveDOM]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/settings/theme`);
      const data = res.data;
      if (data) {
        if (data.store_name) setStoreName(data.store_name);
        if (data.support_email) setSupportEmail(data.support_email);
        if (data.support_phone) setSupportPhone(data.support_phone);
        if (data.currency_symbol) setCurrencySymbol(data.currency_symbol);

        if (data.accent_hue !== undefined) setAccentHue(data.accent_hue);
        if (data.bg_darkness !== undefined) setBgDarkness(data.bg_darkness);
        if (data.glow_intensity !== undefined) setGlowIntensity(data.glow_intensity);
        if (data.buy_now_hue !== undefined) setBuyNowHue(data.buy_now_hue);
        if (data.add_cart_hue !== undefined) setAddCartHue(data.add_cart_hue);
        if (data.checkout_hue !== undefined) setCheckoutHue(data.checkout_hue);
      }
    } catch (err) {
      console.warn('Failed to load theme settings, using defaults', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPresetTheme = (preset: typeof PRESET_THEMES[0]) => {
    setAccentHue(preset.accentHue);
    setBgDarkness(preset.bgDarkness);
    setGlowIntensity(preset.glowIntensity);
    setBuyNowHue(preset.buyNowHue);
    setAddCartHue(preset.addCartHue);
    setCheckoutHue(preset.checkoutHue);
    updateLiveDOM(preset.accentHue, preset.bgDarkness, preset.glowIntensity, preset.buyNowHue, preset.addCartHue, preset.checkoutHue);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const primaryHex = `hsl(${accentHue}, 85%, 55%)`;
    const buyNowHex = `hsl(${buyNowHue}, 85%, 45%)`;
    const addCartHex = `hsl(${addCartHue}, 75%, 22%)`;
    const checkoutHex = `hsl(${checkoutHue}, 85%, 55%)`;
    const bgHex = `hsl(${accentHue}, 25%, ${Math.max(2, 100 - bgDarkness)}%)`;
    const cardBgHex = `hsl(${accentHue}, 30%, ${Math.max(6, 100 - bgDarkness + 8)}%)`;
    const navbarBgHex = `hsl(${accentHue}, 30%, ${Math.max(8, 100 - bgDarkness + 10)}%)`;

    const payload = {
      store_name: storeName.trim(),
      support_email: supportEmail.trim(),
      support_phone: supportPhone.trim(),
      currency_symbol: currencySymbol.trim(),
      accent_hue: accentHue,
      bg_darkness: bgDarkness,
      glow_intensity: glowIntensity,
      buy_now_hue: buyNowHue,
      add_cart_hue: addCartHue,
      checkout_hue: checkoutHue,
      primary_color: primaryHex,
      buy_now_btn_color: buyNowHex,
      add_cart_btn_color: addCartHex,
      navbar_bg_color: navbarBgHex,
      navbar_text_color: '#ffffff',
      bg_color: bgHex,
      card_bg_color: cardBgHex,
      checkout_bg_color: bgHex,
      checkout_card_color: cardBgHex,
      checkout_btn_color: checkoutHex,
      footer_bg_color: navbarBgHex,
      footer_text_color: '#94a3b8',
      text_primary_color: '#ffffff',
      text_secondary_color: '#94a3b8',
    };

    try {
      // 1. Save securely to backend MongoDB
      await axios.put(
        `${API_URL}/api/v1/admin/settings/theme`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Save locally to localStorage
      localStorage.setItem('shadow_arrow_theme_config', JSON.stringify(payload));

      // 3. Broadcast custom event & storage event for instant cross-tab live DOM sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: payload }));
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save theme settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto font-mono">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ops-700 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20 font-bold uppercase">
                ENTERPRISE MASTER THEME ENGINE
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1 uppercase">
              Global Theme Engine & Live Preview
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Live HSL sliders, CSS root variable injection & multi-view section mirror canvas
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {savedSuccess && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Theme Broadcasted & Live on All Pages</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg uppercase disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>SAVE & APPLY THEME</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Slider Controls Left + Multi-View Preview Canvas Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Photo Matching Sliders Panel (6 Cols) */}
          <form onSubmit={handleSave} className="lg:col-span-6 space-y-6">
            
            {/* CARD 1: LIVE PREVIEW CARD MATCHING PHOTO */}
            <div className="p-5 rounded-3xl border-2 border-emerald-500/40 bg-ops-800 space-y-3 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-gray-300 tracking-wider">LIVE PREVIEW CARD</span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[10px] font-bold uppercase">
                  DARK + Custom
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-400">
                Current Theme: Dark Cyber ({bgDarkness}% Tone)
              </p>
            </div>

            {/* CARD 2: THEME PRESETS MATCHING PHOTO */}
            <div className="p-5 rounded-3xl border border-ops-700 bg-ops-800 space-y-3 shadow-xl">
              <span className="text-xs font-black uppercase text-gray-300 tracking-wider block">THEME PRESETS</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_THEMES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPresetTheme(preset)}
                    className="p-2.5 bg-ops-900 border border-ops-700 hover:border-blue-500 rounded-xl text-[11px] font-bold text-gray-200 hover:text-white transition flex items-center space-x-2 truncate"
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: `hsl(${preset.accentHue}, 85%, 55%)` }} />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CARD 3: BACKGROUND DARKNESS & PITCH SLIDER MATCHING PHOTO */}
            <div className="p-5 rounded-3xl border border-ops-700 bg-ops-800 space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-black uppercase text-gray-200">BACKGROUND DARKNESS & PITCH</span>
                </div>
                <span className="px-3 py-1 bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-xl text-xs font-bold font-mono">
                  {bgDarkness}%
                </span>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Sun className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgDarkness}
                  onInput={(e: any) => setBgDarkness(Number(e.target.value))}
                  onChange={(e) => setBgDarkness(Number(e.target.value))}
                  className="w-full h-2 bg-ops-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <Moon className="w-4 h-4 text-blue-400 shrink-0" />
              </div>
            </div>

            {/* CARD 4: ACCENT COLOR SHIFT (HUE SLIDER) MATCHING PHOTO */}
            <div className="p-5 rounded-3xl border border-ops-700 bg-ops-800 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-black uppercase text-gray-200">ACCENT COLOR SHIFT (HUE SLIDER)</span>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold font-mono">
                  {accentHue}° Hue
                </span>
              </div>

              {/* Rainbow Gradient Track */}
              <div className="pt-1">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={accentHue}
                  onInput={(e: any) => setAccentHue(Number(e.target.value))}
                  onChange={(e) => setAccentHue(Number(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                  }}
                />
              </div>

              {/* Preset Swatches Below Hue Slider */}
              <div className="pt-1">
                <span className="text-[10px] text-gray-400 block mb-2 font-bold uppercase">Preset Swatches:</span>
                <div className="flex space-x-2">
                  {PRESET_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.name}
                      type="button"
                      onClick={() => setAccentHue(swatch.hue)}
                      className={`w-7 h-7 rounded-full border-2 transition hover:scale-110 ${
                        accentHue === swatch.hue ? 'border-white scale-110 shadow-lg' : 'border-ops-700'
                      }`}
                      style={{ backgroundColor: `hsl(${swatch.hue}, 85%, 55%)` }}
                      title={swatch.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CARD 5: SHADOW & GLOW INTENSITY MATCHING PHOTO */}
            <div className="p-5 rounded-3xl border border-ops-700 bg-ops-800 space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase text-gray-200">SHADOW & GLOW INTENSITY</span>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold font-mono">
                  {glowIntensity}%
                </span>
              </div>

              <div className="pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={glowIntensity}
                  onInput={(e: any) => setGlowIntensity(Number(e.target.value))}
                  onChange={(e) => setGlowIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-ops-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* CARD 6: DIVIDED SECTION SLIDERS */}
            <div className="p-5 rounded-3xl border border-ops-700 bg-ops-800 space-y-4 shadow-xl">
              <span className="text-xs font-black uppercase text-gray-200 block border-b border-ops-700 pb-2">
                DIVIDED SECTION BUTTON HUE SLIDERS
              </span>

              <div className="space-y-4 text-xs">
                {/* Buy Now Hue */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-emerald-400">⚡ Buy Now Button Hue ({buyNowHue}°)</span>
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: `hsl(${buyNowHue}, 85%, 45%)` }} />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={buyNowHue}
                    onInput={(e: any) => setBuyNowHue(Number(e.target.value))}
                    onChange={(e) => setBuyNowHue(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                  />
                </div>

                {/* Add Cart Hue */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-blue-400">🛒 Add to Cart Button Hue ({addCartHue}°)</span>
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: `hsl(${addCartHue}, 75%, 35%)` }} />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={addCartHue}
                    onInput={(e: any) => setAddCartHue(Number(e.target.value))}
                    onChange={(e) => setAddCartHue(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                  />
                </div>

                {/* Checkout Hue */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-purple-400">💳 Checkout Pay Button Hue ({checkoutHue}°)</span>
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: `hsl(${checkoutHue}, 85%, 55%)` }} />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={checkoutHue}
                    onInput={(e: any) => setCheckoutHue(Number(e.target.value))}
                    onChange={(e) => setCheckoutHue(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                  />
                </div>
              </div>
            </div>

          </form>

          {/* RIGHT: Multi-Section Live Mirror Preview Canvas (6 Cols) */}
          <div className="lg:col-span-6 space-y-4 sticky top-8">
            
            {/* Mirror Header & Section Tabs */}
            <div className="flex justify-between items-center bg-ops-800 p-3 rounded-2xl border border-ops-700 shadow-xl">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase">Multi-Section Live Mirror</span>
              </div>

              <div className="flex bg-ops-900 p-1 rounded-xl text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewTab('CATALOG')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${previewTab === 'CATALOG' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Catalog
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('PRODUCT')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${previewTab === 'PRODUCT' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Product
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('CHECKOUT')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${previewTab === 'CHECKOUT' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Checkout
                </button>
              </div>
            </div>

            {/* TAB 1: CATALOG MIRROR */}
            {previewTab === 'CATALOG' && (
              <div
                className="border-2 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col font-sans text-xs"
                style={{
                  backgroundColor: `hsl(${accentHue}, 25%, ${Math.max(2, 100 - bgDarkness)}%)`,
                  borderColor: `hsl(${accentHue}, 85%, 55%)`,
                  boxShadow: `0 0 ${glowIntensity * 0.4}px hsl(${accentHue}, 85%, 55%, ${glowIntensity / 100})`,
                }}
              >
                {/* Navbar */}
                <div
                  className="p-3.5 flex justify-between items-center border-b border-white/10"
                  style={{ backgroundColor: `hsl(${accentHue}, 30%, ${Math.max(8, 100 - bgDarkness + 10)}%)` }}
                >
                  <span className="font-black text-sm uppercase tracking-wider text-white">
                    {storeName}
                  </span>
                  <div className="flex items-center space-x-3 text-[10px] font-bold uppercase">
                    <span style={{ color: `hsl(${accentHue}, 85%, 55%)` }}>Home</span>
                    <span className="text-gray-300">Catalog</span>
                    <div className="p-1 rounded bg-white/10 text-white">
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Hero Catalog Card */}
                <div className="p-5 space-y-4">
                  <div
                    className="rounded-2xl p-4 border border-white/10 space-y-3 shadow-lg"
                    style={{ backgroundColor: `hsl(${accentHue}, 30%, ${Math.max(6, 100 - bgDarkness + 8)}%)` }}
                  >
                    <div className="w-full h-36 bg-slate-800/80 rounded-xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase">Product Image Mirror</span>
                      <span
                        className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold text-white shadow"
                        style={{ backgroundColor: `hsl(${accentHue}, 85%, 55%)` }}
                      >
                        HEAVYWEIGHT 380 GSM
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-sm uppercase text-white">
                        Cyberpunk Boxy Heavyweight Tee
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        100% French Terry Cotton • Oversized Boxy Silhouette
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-1 font-mono">
                      <div>
                        <span className="text-base font-black text-white">
                          {currencySymbol}1,499.00
                        </span>
                        <span className="text-[10px] ml-1 line-through text-slate-500">
                          {currencySymbol}2,999.00
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: `hsl(${accentHue}, 85%, 55%)`, backgroundColor: `hsl(${accentHue}, 85%, 55%, 0.2)` }}>
                        50% OFF
                      </span>
                    </div>

                    {/* Action Buttons with Divided Hues */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        className="py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider text-white shadow-md flex items-center justify-center space-x-1 transition"
                        style={{
                          backgroundColor: `hsl(${addCartHue}, 75%, 25%)`,
                          boxShadow: `0 0 ${glowIntensity * 0.2}px hsl(${addCartHue}, 75%, 45%, 0.5)`
                        }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        type="button"
                        className="py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider text-white shadow-md flex items-center justify-center space-x-1 transition"
                        style={{
                          backgroundColor: `hsl(${buyNowHue}, 85%, 45%)`,
                          boxShadow: `0 0 ${glowIntensity * 0.3}px hsl(${buyNowHue}, 85%, 55%, 0.6)`
                        }}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer Mirror */}
                  <div
                    className="p-3 rounded-xl border border-white/10 text-center space-y-1"
                    style={{ backgroundColor: `hsl(${accentHue}, 30%, ${Math.max(5, 100 - bgDarkness + 5)}%)` }}
                  >
                    <p className="text-[10px] font-mono font-bold text-white">
                      {storeName} • Customer Support Helpline
                    </p>
                    <p className="text-[9px] font-mono text-slate-400">
                      {supportEmail}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCT DETAILS MIRROR */}
            {previewTab === 'PRODUCT' && (
              <div
                className="border-2 rounded-3xl p-5 space-y-4 shadow-2xl text-xs font-sans"
                style={{
                  backgroundColor: `hsl(${accentHue}, 25%, ${Math.max(2, 100 - bgDarkness)}%)`,
                  borderColor: `hsl(${accentHue}, 85%, 55%)`,
                }}
              >
                <div className="flex items-center space-x-2 text-xs font-mono font-bold" style={{ color: `hsl(${accentHue}, 85%, 55%)` }}>
                  <span>Catalog</span>
                  <span>/</span>
                  <span>Apparel</span>
                  <span>/</span>
                  <span className="text-white">Heavyweight Tee</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="h-44 bg-slate-800 rounded-2xl border border-white/10 flex items-center justify-center">
                    <span className="text-xs font-mono text-slate-400">Gallery Image</span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-base font-black uppercase text-white">SHADOW ARROW HEAVY TEE</h2>
                    <p className="text-[11px] text-slate-400">High-density French Terry cotton construction.</p>
                    
                    <div className="text-lg font-black font-mono text-white">{currencySymbol}1,499</div>

                    <button
                      type="button"
                      className="w-full py-3 rounded-xl font-bold uppercase text-white tracking-wider flex items-center justify-center space-x-2"
                      style={{ backgroundColor: `hsl(${buyNowHue}, 85%, 45%)` }}
                    >
                      <Zap className="w-4 h-4" />
                      <span>EXPRESS BUY NOW</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CHECKOUT PAGE MIRROR */}
            {previewTab === 'CHECKOUT' && (
              <div
                className="border-2 rounded-3xl p-5 space-y-4 shadow-2xl text-xs font-sans"
                style={{
                  backgroundColor: `hsl(${accentHue}, 25%, ${Math.max(2, 100 - bgDarkness)}%)`,
                  borderColor: `hsl(${accentHue}, 85%, 55%)`,
                }}
              >
                <div className="p-3 rounded-xl border border-white/10 flex justify-between items-center" style={{ backgroundColor: `hsl(${accentHue}, 30%, ${Math.max(8, 100 - bgDarkness + 10)}%)` }}>
                  <span className="font-bold text-white">{storeName} CHECKOUT</span>
                  <span className="text-[10px] font-bold" style={{ color: `hsl(${accentHue}, 85%, 55%)` }}>SSL SECURE</span>
                </div>

                <div
                  className="p-4 rounded-2xl border border-white/10 space-y-3"
                  style={{ backgroundColor: `hsl(${accentHue}, 30%, ${Math.max(6, 100 - bgDarkness + 8)}%)` }}
                >
                  <h4 className="font-bold uppercase text-white border-b border-white/10 pb-2">Order Summary</h4>
                  <div className="flex justify-between font-mono text-white">
                    <span>Payable Total</span>
                    <span>{currencySymbol}1,499.00</span>
                  </div>

                  <button
                    type="button"
                    className="w-full py-3.5 rounded-xl font-bold uppercase text-white tracking-wider flex items-center justify-center space-x-2 font-mono"
                    style={{ backgroundColor: `hsl(${checkoutHue}, 85%, 55%)` }}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>PROCEED TO PAY {currencySymbol}1,499</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
