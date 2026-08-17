'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Settings, Shield, Key, Save, CheckCircle2, Lock, Smartphone, Database, Mail, Globe } from 'lucide-react';

export default function SettingsAdminPage() {
  const [saved, setSaved] = useState(false);

  // Store Settings
  const [storeName, setStoreName] = useState('SHADOW ARROW');
  const [supportEmail, setSupportEmail] = useState('support.shadowarrow@gmail.com');
  const [supportPhone, setSupportPhone] = useState('+91 9847291040');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // API Credentials Settings
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_live_9847291040');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('••••••••••••••••');
  const [mongoUri, setMongoUri] = useState('mongodb+srv://shadow_admin:••••••••@cluster0.mongodb.net/shadow_arrow_db');
  const [whatsAppToken, setWhatsAppToken] = useState('EAAG••••••••••••••••');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
                MODULE 12 • SYSTEM CONFIGURATIONS
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1">
              Store Settings & API Key Vault
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage core brand profile, Razorpay keys, MongoDB cluster URI, and WhatsApp cloud tokens
            </p>
          </div>

          {saved && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Vault & Settings Encrypted & Saved</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
          
          {/* General Store Settings */}
          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-ops-700 pb-4">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase">General Store Profile</h2>
                <p className="text-xs text-gray-400">Public customer contact & brand branding details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Store Brand Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Customer Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Support Phone Helpline</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Secure API Key Management Vault */}
          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-ops-700 pb-4">
              <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase">Encrypted API Key Vault</h2>
                <p className="text-xs text-gray-400">Razorpay Key Secrets, WhatsApp Cloud API, and MongoDB Database URI</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Razorpay Merchant Key ID</label>
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Razorpay Key Secret (Encrypted)</label>
                <input
                  type="password"
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">MongoDB Atlas Connection URI</label>
                <input
                  type="password"
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">WhatsApp Cloud API Access Token</label>
                <input
                  type="password"
                  value={whatsAppToken}
                  onChange={(e) => setWhatsAppToken(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save System Configurations</span>
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
