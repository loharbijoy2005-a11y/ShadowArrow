'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { Settings, Shield, Key, Save, CheckCircle2, Lock, Smartphone, Database, Mail, Globe, Palette, Eye, ShoppingCart, Zap, RefreshCw, Check, Layout, CreditCard, Monitor, Sun, Moon } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Popular E-Commerce Color Swatches for 1-click selection
const QUICK_COLOR_SWATCHES = [
  { name: 'Modern Black', hex: '#0f172a' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Vibrant Orange', hex: '#f97316' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Cyber Purple', hex: '#8b5cf6' },
  { name: 'Pure White', hex: '#ffffff' },
];

// Helper: Calculate high-contrast text color (black or white) based on background hex
function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
  const cleanHex = hexColor.replace('#', '');
  if (cleanHex.length !== 6) return '#ffffff';

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // YIQ luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 145 ? '#020617' : '#ffffff';
}

const PRESET_THEMES = [
  {
    name: 'Pure Cyber Dark',
    primary: '#2563eb',
    buyNow: '#16a34a',
    addCart: '#1e293b',
    navbarBg: '#0f172a',
    navbarText: '#ffffff',
    bg: '#020617',
    cardBg: '#0f172a',
    checkoutBg: '#020617',
    checkoutCard: '#0f172a',
    checkoutBtn: '#2563eb',
    footerBg: '#0f172a',
    footerText: '#94a3b8',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    adminBg: '#0b0f19',
    adminAccent: '#2563eb',
  },
  {
    name: 'Pure White Luxury',
    primary: '#2563eb',
    buyNow: '#10b981',
    addCart: '#0f172a',
    navbarBg: '#ffffff',
    navbarText: '#0f172a',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    checkoutBg: '#f1f5f9',
    checkoutCard: '#ffffff',
    checkoutBtn: '#0f172a',
    footerBg: '#0f172a',
    footerText: '#cbd5e1',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    adminBg: '#0f172a',
    adminAccent: '#3b82f6',
  },
  {
    name: 'Cyberpunk Neon',
    primary: '#a855f7',
    buyNow: '#ec4899',
    addCart: '#3b82f6',
    navbarBg: '#090d16',
    navbarText: '#ffffff',
    bg: '#050811',
    cardBg: '#131b2e',
    checkoutBg: '#050811',
    checkoutCard: '#131b2e',
    checkoutBtn: '#a855f7',
    footerBg: '#090d16',
    footerText: '#a7f3d0',
    textPrimary: '#ffffff',
    textSecondary: '#a7f3d0',
    adminBg: '#090d16',
    adminAccent: '#ec4899',
  },
  {
    name: 'Emerald Gold Royal',
    primary: '#059669',
    buyNow: '#d97706',
    addCart: '#047857',
    navbarBg: '#022c22',
    navbarText: '#ffffff',
    bg: '#011a14',
    cardBg: '#064e3b',
    checkoutBg: '#011a14',
    checkoutCard: '#064e3b',
    checkoutBtn: '#d97706',
    footerBg: '#022c22',
    footerText: '#6ee7b7',
    textPrimary: '#ffffff',
    textSecondary: '#6ee7b7',
    adminBg: '#022c22',
    adminAccent: '#059669',
  },
];

export default function SettingsAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState<'CATALOG' | 'CHECKOUT'>('CATALOG');

  // Store General Profile
  const [storeName, setStoreName] = useState('SHADOW ARROW');
  const [supportEmail, setSupportEmail] = useState('support.shadowarrow@gmail.com');
  const [supportPhone, setSupportPhone] = useState('+91 9002376609');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Granular Theme Colors State
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [buyNowBtnColor, setBuyNowBtnColor] = useState('#16a34a');
  const [addCartBtnColor, setAddCartBtnColor] = useState('#0f172a');
  const [navbarBgColor, setNavbarBgColor] = useState('#0f172a');
  const [navbarTextColor, setNavbarTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#020617');
  const [cardBgColor, setCardBgColor] = useState('#0f172a');
  const [checkoutBgColor, setCheckoutBgColor] = useState('#020617');
  const [checkoutCardColor, setCheckoutCardColor] = useState('#0f172a');
  const [checkoutBtnColor, setCheckoutBtnColor] = useState('#2563eb');
  const [footerBgColor, setFooterBgColor] = useState('#0f172a');
  const [footerTextColor, setFooterTextColor] = useState('#94a3b8');
  const [textPrimaryColor, setTextPrimaryColor] = useState('#ffffff');
  const [textSecondaryColor, setTextSecondaryColor] = useState('#94a3b8');
  const [adminBgColor, setAdminBgColor] = useState('#0b0f19');
  const [adminAccentColor, setAdminAccentColor] = useState('#2563eb');

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
        if (data.navbar_text_color) setNavbarTextColor(data.navbar_text_color);
        if (data.bg_color) setBgColor(data.bg_color);
        if (data.card_bg_color) setCardBgColor(data.card_bg_color);
        if (data.checkout_bg_color) setCheckoutBgColor(data.checkout_bg_color);
        if (data.checkout_card_color) setCheckoutCardColor(data.checkout_card_color);
        if (data.checkout_btn_color) setCheckoutBtnColor(data.checkout_btn_color);
        if (data.footer_bg_color) setFooterBgColor(data.footer_bg_color);
        if (data.footer_text_color) setFooterTextColor(data.footer_text_color);
        if (data.text_primary_color) setTextPrimaryColor(data.text_primary_color);
        if (data.text_secondary_color) setTextSecondaryColor(data.text_secondary_color);
        if (data.admin_bg_color) setAdminBgColor(data.admin_bg_color);
        if (data.admin_accent_color) setAdminAccentColor(data.admin_accent_color);
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
    setNavbarTextColor(preset.navbarText);
    setBgColor(preset.bg);
    setCardBgColor(preset.cardBg);
    setCheckoutBgColor(preset.checkoutBg);
    setCheckoutCardColor(preset.checkoutCard);
    setCheckoutBtnColor(preset.checkoutBtn);
    setFooterBgColor(preset.footerBg);
    setFooterTextColor(preset.footerText);
    setTextPrimaryColor(preset.textPrimary);
    setTextSecondaryColor(preset.textSecondary);
    setAdminBgColor(preset.adminBg);
    setAdminAccentColor(preset.adminAccent);
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
      navbar_text_color: navbarTextColor,
      bg_color: bgColor,
      card_bg_color: cardBgColor,
      checkout_bg_color: checkoutBgColor,
      checkout_card_color: checkoutCardColor,
      checkout_btn_color: checkoutBtnColor,
      footer_bg_color: footerBgColor,
      footer_text_color: footerTextColor,
      text_primary_color: textPrimaryColor,
      text_secondary_color: textSecondaryColor,
      admin_bg_color: adminBgColor,
      admin_accent_color: adminAccentColor,
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

  // Reusable Component for Visual Color Picker + Quick Swatches
  const RenderColorControl = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    description?: string
  ) => (
    <div className="p-3.5 bg-ops-900 border border-ops-700 rounded-xl space-y-2 font-mono">
      <div className="flex justify-between items-center">
        <div>
          <label className="block text-gray-200 font-bold uppercase text-[11px]">{label}</label>
          {description && <p className="text-[9px] text-gray-400">{description}</p>}
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-ops-700" style={{ backgroundColor: value, color: getContrastColor(value) }}>
          {value}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border-0 bg-transparent cursor-pointer shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-ops-800 border border-ops-700 rounded-lg p-2 text-white font-bold uppercase text-xs focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Quick-Click Swatch Pills */}
      <div className="pt-1.5 flex flex-wrap gap-1">
        {QUICK_COLOR_SWATCHES.map((swatch) => (
          <button
            key={swatch.name}
            type="button"
            onClick={() => onChange(swatch.hex)}
            className={`w-5 h-5 rounded-full border transition hover:scale-110 ${
              value.toLowerCase() === swatch.hex.toLowerCase() ? 'ring-2 ring-blue-500 border-white' : 'border-ops-700'
            }`}
            style={{ backgroundColor: swatch.hex }}
            title={`Select ${swatch.name} (${swatch.hex})`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto font-mono">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ops-700 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20 font-bold uppercase">
                MODULE 12 • VISUAL COLOR PICKER & THEME ENGINE
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1">
              Visual Theme & Color Customizer
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Click color swatches or drag HTML5 pickers to customize buttons, background & checkout with live preview
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {savedSuccess && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Theme Saved & Pushed to Live Website</span>
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
        <div className="bg-ops-800 border border-ops-700 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase">⚡ 1-Click Quick Theme Swatches</span>
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
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.bg }} title="Website BG" />
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.buyNow }} title="Buy Now Button" />
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.addCart }} title="Add Cart Button" />
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.checkoutBtn }} title="Checkout Button" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Controls Left + Live Preview Canvas Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Sectioned Visual Swatches & Pickers (7 Cols) */}
          <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
            
            {/* Store Profile */}
            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-ops-700 pb-3">
                <Globe className="w-4 h-4 text-blue-400" />
                <h2 className="text-xs font-bold text-white uppercase">Store Profile & Currency</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Store Brand Name</label>
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

            {/* Section Color Controls */}
            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-6 shadow-xl">
              
              {/* SECTION 1: Action Buttons */}
              <div className="space-y-3 border-b border-ops-700 pb-5">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase">1. Storefront Action Buttons</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {RenderColorControl('Buy Now Button Color', buyNowBtnColor, setBuyNowBtnColor, 'Primary checkout button')}
                  {RenderColorControl('Add to Cart Button Color', addCartBtnColor, setAddCartBtnColor, 'Cart drawer & catalog button')}
                </div>
              </div>

              {/* SECTION 2: Navbar & Header */}
              <div className="space-y-3 border-b border-ops-700 pb-5">
                <div className="flex items-center space-x-2">
                  <Layout className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase">2. Navbar & Header Styling</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {RenderColorControl('Navbar Background Color', navbarBgColor, setNavbarBgColor, 'Top header background')}
                  {RenderColorControl('Navbar Link & Text Color', navbarTextColor, setNavbarTextColor, 'Brand logo & menu links')}
                </div>
              </div>

              {/* SECTION 3: Main Page & Catalog Backgrounds */}
              <div className="space-y-3 border-b border-ops-700 pb-5">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase">3. Website Page & Card Backgrounds</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {RenderColorControl('Main Website Background', bgColor, setBgColor, 'Body background for homepage')}
                  {RenderColorControl('Product Card Container BG', cardBgColor, setCardBgColor, 'Catalog product card background')}
                </div>
              </div>

              {/* SECTION 4: Checkout Page Customizers */}
              <div className="space-y-3 border-b border-ops-700 pb-5">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase">4. Checkout Page Specific Colors</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {RenderColorControl('Checkout Page BG', checkoutBgColor, setCheckoutBgColor, 'Checkout background')}
                  {RenderColorControl('Checkout Card BG', checkoutCardColor, setCheckoutCardColor, 'Address & summary container')}
                  {RenderColorControl('Place Order Button', checkoutBtnColor, setCheckoutBtnColor, 'Pay & order trigger button')}
                </div>
              </div>

              {/* SECTION 5: Footer & Text Colors */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase">5. Headings & Footer Colors</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {RenderColorControl('Headings & Main Text Color', textPrimaryColor, setTextPrimaryColor, 'Main title text color')}
                  {RenderColorControl('Footer Background Color', footerBgColor, setFooterBgColor, 'Bottom footer container')}
                </div>
              </div>

            </div>

          </form>

          {/* RIGHT: Real-Time Multi-View Mirror Canvas (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-8">
            <div className="flex justify-between items-center bg-ops-800 p-2 rounded-2xl border border-ops-700">
              <span className="text-xs font-bold text-white uppercase pl-2 flex items-center space-x-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Live Mirror View</span>
              </span>

              {/* View Switcher Tabs */}
              <div className="flex bg-ops-900 p-1 rounded-xl text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewTab('CATALOG')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    previewTab === 'CATALOG' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Catalog
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('CHECKOUT')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    previewTab === 'CHECKOUT' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Checkout
                </button>
              </div>
            </div>

            {/* TAB 1: STOREFRONT CATALOG MIRROR CANVAS */}
            {previewTab === 'CATALOG' && (
              <div
                className="border-2 border-ops-700 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col font-sans text-xs"
                style={{ backgroundColor: bgColor }}
              >
                {/* Navbar */}
                <div
                  className="p-3 flex justify-between items-center border-b border-white/10"
                  style={{ backgroundColor: navbarBgColor }}
                >
                  <span className="font-black text-sm uppercase tracking-wider" style={{ color: navbarTextColor }}>
                    {storeName || 'SHADOW ARROW'}
                  </span>
                  <div className="flex items-center space-x-3 text-[10px] font-bold uppercase">
                    <span style={{ color: primaryColor }}>Home</span>
                    <span style={{ color: navbarTextColor }}>Catalog</span>
                    <div className="p-1 rounded bg-white/10" style={{ color: navbarTextColor }}>
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Main Body */}
                <div className="p-5 space-y-4">
                  <div
                    className="rounded-2xl p-4 border border-white/10 space-y-3 shadow-lg"
                    style={{ backgroundColor: cardBgColor }}
                  >
                    <div className="w-full h-32 bg-slate-800/80 rounded-xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase">Product Banner Preview</span>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}>
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

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        className="py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-md flex items-center justify-center space-x-1 transition"
                        style={{ backgroundColor: addCartBtnColor, color: getContrastColor(addCartBtnColor) }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        type="button"
                        className="py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-md flex items-center justify-center space-x-1 transition"
                        style={{ backgroundColor: buyNowBtnColor, color: getContrastColor(buyNowBtnColor) }}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-3 rounded-xl border border-white/10 text-center space-y-1" style={{ backgroundColor: footerBgColor }}>
                    <p className="text-[10px] font-mono font-bold" style={{ color: textPrimaryColor }}>
                      {storeName} • Customer Support Helpline
                    </p>
                    <p className="text-[9px] font-mono" style={{ color: footerTextColor }}>
                      {supportEmail}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STOREFRONT CHECKOUT PAGE MIRROR CANVAS */}
            {previewTab === 'CHECKOUT' && (
              <div
                className="border-2 border-ops-700 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col font-sans text-xs"
                style={{ backgroundColor: checkoutBgColor }}
              >
                {/* Navbar */}
                <div
                  className="p-3 flex justify-between items-center border-b border-white/10"
                  style={{ backgroundColor: navbarBgColor }}
                >
                  <span className="font-black text-sm uppercase tracking-wider" style={{ color: navbarTextColor }}>
                    {storeName} • CHECKOUT
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: primaryColor }}>🔒 SECURE 256-BIT SSL</span>
                </div>

                <div className="p-5 space-y-3">
                  <div
                    className="p-4 rounded-2xl border border-white/10 space-y-3 shadow-lg"
                    style={{ backgroundColor: checkoutCardColor }}
                  >
                    <h4 className="font-black uppercase text-xs border-b border-white/10 pb-2" style={{ color: textPrimaryColor }}>
                      Shipping Address & Details
                    </h4>

                    <div className="space-y-2 text-[11px]">
                      <div className="p-2 bg-black/20 rounded-lg text-slate-300 border border-white/5">
                        Customer: Bijoy Lohar (+91 9002376609)
                      </div>
                      <div className="p-2 bg-black/20 rounded-lg text-slate-300 border border-white/5">
                        Address: Kolkata, WB - 700001
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center font-mono font-bold">
                      <span style={{ color: textSecondaryColor }}>Total Payable Amount</span>
                      <span className="text-base" style={{ color: textPrimaryColor }}>{currencySymbol}1,499.00</span>
                    </div>

                    <button
                      type="button"
                      className="w-full py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 font-mono transition"
                      style={{ backgroundColor: checkoutBtnColor, color: getContrastColor(checkoutBtnColor) }}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>PROCEED TO PAY {currencySymbol}1,499</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
