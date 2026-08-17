'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { Image as ImageIcon, FileText, Plus, Trash2, Save, CheckCircle2, Globe, Sparkles, RefreshCw, ShieldCheck, Scale, Truck, RotateCcw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const DEFAULT_PRIVACY_POLICY = `1. Information Collection & Scope
SHADOW ARROW Prime Marketplace ("we", "us", or "our") respects the privacy rights of all users and online visitors. This Privacy Policy details how we collect, store, process, transfer, and protect your personal identification information when you browse our website, interact with Shadow AI Stylist, or place an order for streetwear apparel, footwear, and accessories.

We collect information directly provided by you during account registration, checkout, or customer service communications. This includes your full legal name, shipping and billing addresses, primary telephone number, email address, pincode, size preferences, and specific delivery instructions.

2. Purpose & Use of Collected Data
Your personal information is strictly processed for legitimate business operations and legal compliance under the Information Technology Act, 2000, and Consumer Protection (E-Commerce) Rules, 2020 of India. Specifically:
- Process customer orders, verify transaction authenticity, and issue official GST Tax Invoices.
- Dispatch packages via authorized Pan-India logistics partners (BlueDart Express, Delhivery, Expressbees) and transmit real-time SMS/Email AWB tracking links.
- Provide personalized fashion stylist recommendations via Shadow AI Stylist.
- Maintain financial auditing records in compliance with Indian GST taxation laws.

3. Payment Gateway & Third-Party Processing
All online payment transactions (UPI, Credit Cards, Debit Cards, NetBanking, and Digital Wallets) are securely routed and processed through Razorpay Software Private Limited. SHADOW ARROW does NOT store, record, or retain raw credit card numbers, CVVs, card expiration dates, bank login credentials, or UPI PINs on our servers.

4. Grievance Redressal & Statutory Officer
SHADOW ARROW Privacy & Grievance Desk
Registered Entity: SHADOW ARROW Prime Marketplace
GSTIN: 19BVKPL6301H1ZH
Support Email: support.shadowarrow@gmail.com
Address: Dapanjuri Road, Bhara, Bankura, West Bengal - 722157`;

const DEFAULT_RETURN_POLICY = `1. 7-Day Easy Return & Exchange Window
SHADOW ARROW Prime Marketplace stands behind the craftsmanship, heavy cotton weight, and fit of all our apparel and cyber footwear. We offer a customer-centric 7-Day Easy Return and Size Exchange Policy starting from the calendar date of physical package delivery.

If your oversized tee, heavy hoodie, cargo pants, or techwear sneakers do not fit as expected, or if you are dissatisfied with your purchase, you may initiate a return or size exchange request within seven (7) days of receiving your order.

2. Mandatory Return Conditions & Quality Inspection
To qualify for a 100% full refund or free size exchange, all returned items must strictly comply with the following physical inspection criteria:
- Items must be unwashed, unworn, unused, unaltered, and free of stains, perfume scents, or pet hair.
- Original garment tags, woven brand labels, barcode tags, and price tickets must remain intact and attached in their original positions.
- Footwear must be returned in the original branded shoe box, free of outdoor sole wear or scuffs.

3. Reverse Pickup & Refund Timelines
- Reverse pickup scheduled via BlueDart/Delhivery within 24-48 hours.
- Refunds credited in 5-7 business days for both Prepaid (Razorpay) and COD orders upon quality inspection.`;

const DEFAULT_TERMS_POLICY = `1. Agreement & Acceptance of Terms
Welcome to SHADOW ARROW Prime Marketplace ("Platform"). These Terms of Service constitute a legally binding agreement between you ("User", "Customer", or "You") and SHADOW ARROW Prime Marketplace regarding your access to and use of our web platform, storefront API, customer account portal, and automated AI styling services.

2. Product Specifications & Pricing
All prices listed on the Platform are in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST). SHADOW ARROW reserves the right to adjust pricing, revise promotional drops, or discontinue items without prior notice.

3. Intellectual Property Rights
All original content, visual design tokens, logo trademarks, graphic prints, campaign imagery, and software code are the exclusive property of SHADOW ARROW Prime Marketplace.`;

const DEFAULT_SHIPPING_POLICY = `1. Dispatch & Delivery Timelines
SHADOW ARROW ships across 27,000+ pincodes in India via BlueDart, Delhivery, and Xpressbees.
- Orders dispatched within 24-48 hours.
- Delivery timeline: 2-4 business days for metros; 3-6 business days for rest of India.

2. Shipping Rates & Free Shipping Eligibility
- FREE Express Delivery on all orders above ₹999.
- Flat ₹49 shipping charge on orders under ₹999.`;

export default function CMSAdminPage() {
  const [activeTab, setActiveTab] = useState<'banners' | 'policies'>('banners');
  const [selectedPolicyTab, setSelectedPolicyTab] = useState<'privacy' | 'returns' | 'terms' | 'shipping'>('privacy');
  const [saved, setSaved] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Banners State
  const [banners, setBanners] = useState<any[]>([]);
  const [newHeading, setNewHeading] = useState('');
  const [newSubtext, setNewSubtext] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTargetLink, setNewTargetLink] = useState('');

  // Policy Text States with full original text pre-populated
  const [privacyPolicy, setPrivacyPolicy] = useState(DEFAULT_PRIVACY_POLICY);
  const [returnPolicy, setReturnPolicy] = useState(DEFAULT_RETURN_POLICY);
  const [termsPolicy, setTermsPolicy] = useState(DEFAULT_TERMS_POLICY);
  const [shippingPolicy, setShippingPolicy] = useState(DEFAULT_SHIPPING_POLICY);

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
    if (savedToken) setToken(savedToken);

    fetchBanners();
    loadSavedPolicies();
  }, []);

  const loadSavedPolicies = () => {
    const savedPrivacy = localStorage.getItem('shadow_policy_privacy');
    const savedReturn = localStorage.getItem('shadow_policy_return');
    const savedTerms = localStorage.getItem('shadow_policy_terms');
    const savedShipping = localStorage.getItem('shadow_policy_shipping');

    if (savedPrivacy) setPrivacyPolicy(savedPrivacy);
    if (savedReturn) setReturnPolicy(savedReturn);
    if (savedTerms) setTermsPolicy(savedTerms);
    if (savedShipping) setShippingPolicy(savedShipping);
  };

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/cms/banners`);
      if (res.data && res.data.length > 0) {
        setBanners(res.data);
      }
    } catch (err) {
      const cached = localStorage.getItem('shadow_hero_banners');
      if (cached) setBanners(JSON.parse(cached));
    }
  };

  const syncBannersWithBackend = async (updatedBanners: any[]) => {
    setBanners(updatedBanners);
    localStorage.setItem('shadow_hero_banners', JSON.stringify(updatedBanners));

    if (token) {
      try {
        await axios.post(`${API_URL}/api/v1/admin/cms/banners`, { banners: updatedBanners }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Backend sync failed, saved in local cache');
      }
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeading.trim() || !newImageUrl.trim()) return;

    const newBanner = {
      id: Date.now().toString(),
      heading: newHeading,
      subtext: newSubtext,
      image_url: newImageUrl,
      target_link: newTargetLink || '/',
    };

    const updated = [...banners, newBanner];
    await syncBannersWithBackend(updated);

    setNewHeading('');
    setNewSubtext('');
    setNewImageUrl('');
    setNewTargetLink('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeleteBanner = async (id: string) => {
    const updated = banners.filter(b => b.id !== id);
    await syncBannersWithBackend(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSavePolicies = () => {
    localStorage.setItem('shadow_policy_privacy', privacyPolicy);
    localStorage.setItem('shadow_policy_return', returnPolicy);
    localStorage.setItem('shadow_policy_terms', termsPolicy);
    localStorage.setItem('shadow_policy_shipping', shippingPolicy);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-ops-700">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 font-mono text-xs rounded border border-blue-500/20 font-bold uppercase">
                CONTENT & CMS VAULT
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Store Content Management System
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage homepage hero banners, promotional sliders, and live legal policy pages
            </p>
          </div>

          {saved && (
            <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>CMS Changes Published Live!</span>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-3 border-b border-ops-700 pb-3">
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'banners' ? 'bg-blue-600 text-white shadow-lg' : 'bg-ops-800 text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Homepage Hero Banners ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'policies' ? 'bg-blue-600 text-white shadow-lg' : 'bg-ops-800 text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Static Legal Policies Editor</span>
          </button>
        </div>

        {/* Banners Manager Tab */}
        {activeTab === 'banners' && (
          <div className="space-y-8">
            {/* Add New Banner Form */}
            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Add Hero Banner Slider</span>
              </h2>

              <form onSubmit={handleAddBanner} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Banner Heading</label>
                  <input
                    type="text"
                    value={newHeading}
                    onChange={(e) => setNewHeading(e.target.value)}
                    placeholder="e.g. URBAN OVERSIZED TEES"
                    required
                    className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Subtext / Tagline</label>
                  <input
                    type="text"
                    value={newSubtext}
                    onChange={(e) => setNewSubtext(e.target.value)}
                    placeholder="e.g. Heavyweight 240 GSM Cotton"
                    className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    required
                    className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Target Click Link</label>
                  <input
                    type="text"
                    value={newTargetLink}
                    onChange={(e) => setNewTargetLink(e.target.value)}
                    placeholder="/product/over-1"
                    className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Hero Banner</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Active Banners List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((b) => (
                <div key={b.id} className="bg-ops-800 border border-ops-700 rounded-2xl overflow-hidden shadow-xl space-y-3">
                  <div className="h-44 bg-ops-900 relative">
                    <img src={b.image_url} alt={b.heading} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="absolute top-3 right-3 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition backdrop-blur-sm"
                      title="Remove Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-black text-white text-sm tracking-tight">{b.heading}</h3>
                    <p className="text-xs text-gray-400">{b.subtext}</p>
                    <p className="text-[10px] text-blue-400 font-bold pt-1">Link: {b.target_link}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policy Editor Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-6 max-w-4xl">
            
            {/* Policy Category Tabs */}
            <div className="flex space-x-2 bg-ops-800 p-1.5 rounded-2xl border border-ops-700">
              <button
                onClick={() => setSelectedPolicyTab('privacy')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedPolicyTab === 'privacy' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
              </button>

              <button
                onClick={() => setSelectedPolicyTab('returns')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedPolicyTab === 'returns' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return Policy</span>
              </button>

              <button
                onClick={() => setSelectedPolicyTab('terms')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedPolicyTab === 'terms' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Terms of Service</span>
              </button>

              <button
                onClick={() => setSelectedPolicyTab('shipping')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedPolicyTab === 'shipping' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Shipping Policy</span>
              </button>
            </div>

            {/* Privacy Policy Editor */}
            {selectedPolicyTab === 'privacy' && (
              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-ops-700 pb-3">
                  <h3 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Privacy Policy Full Content Editor</span>
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">Live Sync with /policies/privacy</span>
                </div>
                <textarea
                  rows={14}
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-4 text-white text-xs font-sans leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Return Policy Editor */}
            {selectedPolicyTab === 'returns' && (
              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-ops-700 pb-3">
                  <h3 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    <span>Returns & Refund Policy Full Content Editor</span>
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">Live Sync with /policies/returns</span>
                </div>
                <textarea
                  rows={14}
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-4 text-white text-xs font-sans leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Terms of Service Editor */}
            {selectedPolicyTab === 'terms' && (
              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-ops-700 pb-3">
                  <h3 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>Terms of Service Full Content Editor</span>
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">Live Sync with /policies/terms</span>
                </div>
                <textarea
                  rows={14}
                  value={termsPolicy}
                  onChange={(e) => setTermsPolicy(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-4 text-white text-xs font-sans leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Shipping Policy Editor */}
            {selectedPolicyTab === 'shipping' && (
              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-ops-700 pb-3">
                  <h3 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Shipping Policy Full Content Editor</span>
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">Live Sync with /policies/shipping</span>
                </div>
                <textarea
                  rows={14}
                  value={shippingPolicy}
                  onChange={(e) => setShippingPolicy(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-4 text-white text-xs font-sans leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setPrivacyPolicy(DEFAULT_PRIVACY_POLICY);
                  setReturnPolicy(DEFAULT_RETURN_POLICY);
                  setTermsPolicy(DEFAULT_TERMS_POLICY);
                  setShippingPolicy(DEFAULT_SHIPPING_POLICY);
                }}
                className="px-4 py-2 bg-ops-700 hover:bg-ops-600 text-gray-300 rounded-xl text-xs font-bold transition"
              >
                Reset to Original Legal Templates
              </button>

              <button
                onClick={handleSavePolicies}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Save All Policy Updates</span>
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
