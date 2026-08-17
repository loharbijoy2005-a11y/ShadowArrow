'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Layout, Image as ImageIcon, FileText, Plus, Trash2, Save, CheckCircle2, Globe, Sparkles } from 'lucide-react';

export default function CMSAdminPage() {
  const [activeTab, setActiveTab] = useState<'banners' | 'policies'>('banners');
  const [saved, setSaved] = useState(false);

  // Banners State
  const [banners, setBanners] = useState([
    { id: '1', heading: 'SHADOW ARROW PREMIUM OVERSIZED COLLECTION', subtext: 'High-density heavy cotton urban wear', image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80', target_link: '/product/over-1' },
    { id: '2', heading: 'FESTIVE URBAN DROP • UP TO 40% OFF', subtext: 'Free Express Shipping Across India', image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80', target_link: '/checkout' },
  ]);

  const [newHeading, setNewHeading] = useState('');
  const [newSubtext, setNewSubtext] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTargetLink, setNewTargetLink] = useState('');

  // Policy Pages State
  const [privacyPolicy, setPrivacyPolicy] = useState(`At SHADOW ARROW, we prioritize customer data privacy...`);
  const [returnPolicy, setReturnPolicy] = useState(`7-Day Easy Return & Replacement Policy across India...`);
  const [shippingPolicy, setShippingPolicy] = useState(`Express Dispatch within 24 hours of order placement...`);

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeading.trim() || !newImageUrl.trim()) return;

    setBanners([
      ...banners,
      {
        id: Date.now().toString(),
        heading: newHeading,
        subtext: newSubtext,
        image_url: newImageUrl,
        target_link: newTargetLink || '/',
      },
    ]);

    setNewHeading('');
    setNewSubtext('');
    setNewImageUrl('');
    setNewTargetLink('');
  };

  const handleDeleteBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  const handleSaveCMS = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
                MODULE 11 • STORE CMS & PAGE EDITOR
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1">
              Content Management System (CMS)
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage homepage hero banners, promotional sliders, and static store legal policies
            </p>
          </div>

          {saved && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>CMS Changes Published Live</span>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-3 border-b border-ops-700 pb-3">
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'banners' ? 'bg-blue-600 text-white' : 'bg-ops-800 text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Homepage Banners ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'policies' ? 'bg-blue-600 text-white' : 'bg-ops-800 text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Static Policy Pages</span>
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
            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold uppercase text-white">Privacy Policy Editor</h3>
              <textarea
                rows={4}
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold uppercase text-white">Returns & Refunds Policy Editor</h3>
              <textarea
                rows={4}
                value={returnPolicy}
                onChange={(e) => setReturnPolicy(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveCMS}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Save CMS Policy Text</span>
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
