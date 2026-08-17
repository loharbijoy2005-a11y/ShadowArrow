'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { Settings, Shield, Key, Save, CheckCircle2, Lock, Smartphone, Database, Mail, Globe, Palette, Eye, ShoppingCart, Zap, RefreshCw, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const PRESET_THEMES = [
  {
    name: 'Streetwear Cyber Dark',
    primary: '#2563eb',
    buyNow: '#16a34a',
    addCart: '#0f172a',
    navbarBg: '#0f172a',
    bg: '#020617',
    cardBg: '#0f172a',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
  },
  {
    name: 'Minimalist Luxury Light',
    primary: '#2563eb',
    buyNow: '#000000',
    addCart: '#475569',
    navbarBg: '#ffffff',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
  },
  {
    name: 'Cyberpunk Neon',
    primary: '#a855f7',
    buyNow: '#ec4899',
    addCart: '#3b82f6',
    navbarBg: '#090d16',
    bg: '#050811',
    cardBg: '#131b2e',
    textPrimary: '#ffffff',
    textSecondary: '#a7f3d0',
  },
  {
    name: 'Emerald Gold Royal',
    primary: '#059669',
    buyNow: '#d97706',
    addCart: '#047857',
    navbarBg: '#022c22',
    bg: '#011a14',
    cardBg: '#064e3b',
    textPrimary: '#ffffff',
    textSecondary: '#6ee7b7',
  },
];

export default function SettingsAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Store General Profile
  const [storeName, setStoreName] = useState('SHADOW ARROW');
  const [supportEmail, setSupportEmail] = useState('support.shadowarrow@gmail.com');
  const [supportPhone, setSupportPhone] = useState('+91 9002376609');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Storefront Color Palette Customizer
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [buyNowBtnColor, setBuyNowBtnColor] = useState('#16a34a');
  const [addCartBtnColor, setAddCartBtnColor] = useState('#0f172a');
  const [navbarBgColor, setNavbarBgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#020617');
  const [cardBgColor, setCardBgColor] = useState('#0f172a');
  const [textPrimaryColor, setTextPrimaryColor] = useState('#ffffff');
  const [textSecondaryColor, setTextSecondaryColor] = useState('#94a3b8');

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchSettings();
    } else {
      window.location.href = '/';
    }
  }, []);

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

        if (data.primary_color) setPrimaryColor(data.primary_color);
        if (data.buy_now_btn_color) setBuyNowBtnColor(data.buy_now_btn_color);
        if (data.add_cart_btn_color) setAddCartBtnColor(data.add_cart_btn_color);
        if (data.navbar_bg_color) setNavbarBgColor(data.navbar_bg_color);
        if (data.bg_color) setBgColor(data.bg_color);
        if (data.card_bg_color) setCardBgColor(data.card_bg_color);
        if (data.text_primary_color) setTextPrimaryColor(data.text_primary_color);
        if (data.text_secondary_color) setTextSecondaryColor(data.text_secondary_color);
      }
    } catch (err) {
      console.warn('Failed to load theme settings, using defaults', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPresetTheme = (preset: typeof PRESET_THEMES[0]) => {
    setPrimaryColor(preset.primary);
    setBuyNowBtnColor(preset.buyNow);
    setAddCartBtnColor(preset.addCart);
    setNavbarBgColor(preset.navbarBg);
    setBgColor(preset.bg);
    setCardBgColor(preset.cardBg);
    setTextPrimaryColor(preset.textPrimary);
    setTextSecondaryColor(preset.textSecondary);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const payload = {
      store_name: storeName.trim(),
      support_email: supportEmail.trim(),
      support_phone: supportPhone.trim(),
      currency_symbol: currencySymbol.trim(),
      primary_color: primaryColor,
      buy_now_btn_color: buyNowBtnColor,
      add_cart_btn_color: addCartBtnColor,
      navbar_bg_color: navbarBgColor,
      bg_color: bgColor,
      card_bg_color: cardBgColor,
      text_primary_color: textPrimaryColor,
      text_secondary_color: textSecondaryColor,
    };

    try {
      await axios.put(
        `${API_URL}/api/v1/admin/settings/theme`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
                MODULE 12 • SYSTEM CONFIGURATIONS & THEME ENGINE
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1">
              Storefront Live Color & Theme Customizer
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Customize website colors, Buy Now button, Add to Cart button, Navbar & background with a Live Website Preview Canvas
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {savedSuccess && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Theme Live & Saved to Database</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg uppercase disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save & Publish Theme</span>
            </button>
          </div>
        </div>

        {/* 1-Click Preset Theme Palettes */}
        <div className="bg-ops-800 border border-ops-700 rounded-2xl p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase">⚡ 1-Click Preset Theme Palettes</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPresetTheme(preset)}
                className="p-3 bg-ops-900 border border-ops-700 hover:border-blue-500 rounded-xl text-left transition space-y-2 group"
              >
                <span className="text-xs font-bold text-white block truncate">{preset.name}</span>
                <div className="flex space-x-1">
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.primary }} />
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.buyNow }} />
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.addCart }} />
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.navbarBg }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Controls Left + Real-Time Live Preview Canvas Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Color Controls Form (7 Cols) */}
          <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
            
            {/* General Profile Settings */}
            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center space-x-3 border-b border-ops-700 pb-3">
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                  <Globe className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold text-white uppercase">Store Identity</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Storefront Color Controls */}
            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center space-x-3 border-b border-ops-700 pb-3">
                <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase">Storefront Color Pickers & Sliders</h2>
                  <p className="text-[10px] text-gray-400">Click any picker or type hex code to customize</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* 1. Buy Now Button */}
                <div className="p-3 bg-ops-900 border border-ops-700 rounded-xl space-y-2">
                  <label className="block text-gray-300 font-bold uppercase text-[10px]">Buy Now Button Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={buyNowBtnColor}
                      onChange={(e) => setBuyNowBtnColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={buyNowBtnColor}
                      onChange={(e) => setBuyNowBtnColor(e.target.value)}
                      className="flex-1 bg-ops-800 border border-ops-700 rounded-lg p-2 text-white font-bold uppercase text-xs"
                    />
                  </div>
                </div>

                {/* 2. Add to Cart Button */}
                <div className="p-3 bg-ops-900 border border-ops-700 rounded-xl space-y-2">
                  <label className="block text-gray-300 font-bold uppercase text-[10px]">Add to Cart Button Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={addCartBtnColor}
                      onChange={(e) => setAddCartBtnColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={addCartBtnColor}
                      onChange={(e) => setAddCartBtnColor(e.target.value)}
                      className="flex-1 bg-ops-800 border border-ops-700 rounded-lg p-2 text-white font-bold uppercase text-xs"
                    />
                  </div>
                </div>

                {/* 3. Primary Accent */}
                <div className="p-3 bg-ops-900 border border-ops-700 rounded-xl space-y-2">
                  <label className="block text-gray-300 font-bold uppercase text-[10px]">Primary Brand Accent</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 bg-ops-800 border border-ops-700 rounded-lg p-2 text-white font-bold uppercase text-xs"
                    />
                  </div>
                </div>

                {/* 4. Navbar Background */}
                <div className="p-3 bg-ops-900 border border-ops-700 rounded-xl space-y-2">
                  <label className="block text-gray-300 font-bold uppercase text-[10px]">Navbar / Header Background</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={navbarBgColor}
                      onChange={(e) => setNavbarBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={navbarBgColor}
                      onChange={(e) => setNavbarBgColor(e.target.value)}
                      className="flex-1 bg-ops-800 border border-ops-700 rounded-lg p-2 text-white font-bold uppercase text-xs"
                    />
                  </div>
                </div>

                {/* 5. Main Page Background */}
                <div className="p-3 bg-ops-900 border border-ops-700 rounded-xl space-y-2">
                  <label className="block text-gray-300 font-bold uppercase text-[10px]">Main Website Background</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 bg-ops-800 border border-ops-700 rounded-lg p-2 text-white font-bold uppercase text-xs"
                    />
                  </div>
                </div>

                {/* 6. Product Card Background */}
                <div className="p-3 bg-ops-900 border border-ops-700 rounded-xl space-y-2">
                  <label className="block text-gray-300 font-bold uppercase text-[10px]">Product Card Container</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={cardBgColor}
                      onChange={(e) => setCardBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={cardBgColor}
                      onChange={(e) => setCardBgColor(e.target.value)}
                      className="flex-1 bg-ops-800 border border-ops-700 rounded-lg p-2 text-white font-bold uppercase text-xs"
                    />
                  </div>
                </div>

                {/* 7. Primary Text */}
                <div className="p-3 bg-ops-900 border border-ops-700 rounded-xl space-y-2">
                  <label className="block text-gray-300 font-bold uppercase text-[10px]">Headings & Main Text</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={textPrimaryColor}
                      onChange={(e) => setTextPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textPrimaryColor}
                      onChange={(e) => setTextPrimaryColor(e.target.value)}
                      className="flex-1 bg-ops-800 border border-ops-700 rounded-lg p-2 text-white font-bold uppercase text-xs"
                    />
                  </div>
                </div>

                {/* 8. Secondary Text */}
                <div className="p-3 bg-ops-900 border border-ops-700 rounded-xl space-y-2">
                  <label className="block text-gray-300 font-bold uppercase text-[10px]">Subtext & Meta Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={textSecondaryColor}
                      onChange={(e) => setTextSecondaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textSecondaryColor}
                      onChange={(e) => setTextSecondaryColor(e.target.value)}
                      className="flex-1 bg-ops-800 border border-ops-700 rounded-lg p-2 text-white font-bold uppercase text-xs"
                    />
                  </div>
                </div>

              </div>
            </div>

          </form>

          {/* RIGHT: Real-Time Live Website Preview Canvas (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase">Live Storefront Preview Canvas</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">● Live Updating</span>
            </div>

            {/* Mockup Display Box */}
            <div
              className="border-2 border-ops-700 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col font-sans text-xs"
              style={{ backgroundColor: bgColor }}
            >
              {/* Mockup Navbar */}
              <div
                className="p-3 flex justify-between items-center border-b border-white/10"
                style={{ backgroundColor: navbarBgColor }}
              >
                <span className="font-black text-sm uppercase tracking-wider" style={{ color: textPrimaryColor }}>
                  {storeName || 'SHADOW ARROW'}
                </span>
                <div className="flex items-center space-x-3 text-[10px] font-bold uppercase">
                  <span style={{ color: primaryColor }}>Catalog</span>
                  <span style={{ color: textSecondaryColor }}>Track Order</span>
                  <div className="p-1 rounded bg-white/10" style={{ color: textPrimaryColor }}>
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Mockup Main Content / Hero Product Card */}
              <div className="p-5 space-y-4">
                <div
                  className="rounded-2xl p-4 border border-white/10 space-y-3 shadow-lg"
                  style={{ backgroundColor: cardBgColor }}
                >
                  <div className="w-full h-32 bg-slate-800/80 rounded-xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">Product Image Preview</span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                      HEAVYWEIGHT 380 GSM
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-sm uppercase" style={{ color: textPrimaryColor }}>
                      Cyberpunk Boxy Heavyweight Tee
                    </h3>
                    <p className="text-[11px] line-clamp-1" style={{ color: textSecondaryColor }}>
                      100% French Terry Cotton • Oversized Boxy Silhouette
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <span className="text-base font-black font-mono" style={{ color: textPrimaryColor }}>
                        {currencySymbol}1,499.00
                      </span>
                      <span className="text-[10px] ml-1 line-through" style={{ color: textSecondaryColor }}>
                        {currencySymbol}2,999.00
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: primaryColor, backgroundColor: `${primaryColor}20` }}>
                      50% OFF
                    </span>
                  </div>

                  {/* Buttons Mockup */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      className="py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider text-white shadow-md flex items-center justify-center space-x-1"
                      style={{ backgroundColor: addCartBtnColor }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      type="button"
                      className="py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider text-white shadow-md flex items-center justify-center space-x-1"
                      style={{ backgroundColor: buyNowBtnColor }}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>

                {/* Footer Mockup */}
                <div className="p-3 rounded-xl border border-white/10 text-center space-y-1" style={{ backgroundColor: navbarBgColor }}>
                  <p className="text-[10px] font-mono font-bold" style={{ color: textPrimaryColor }}>
                    {storeName} • Customer Helpline: {supportPhone}
                  </p>
                  <p className="text-[9px] font-mono" style={{ color: textSecondaryColor }}>
                    Email Support: {supportEmail}
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
