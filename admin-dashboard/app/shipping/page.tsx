'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Truck, Key, MapPin, Scale, Save, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function ShippingAdminPage() {
  const [saved, setSaved] = useState(false);
  const [shiprocketEmail, setShiprocketEmail] = useState('support.shadowarrow@gmail.com');
  const [shiprocketPassword, setShiprocketPassword] = useState('••••••••••••');
  const [delhiveryToken, setDelhiveryToken] = useState('delhivery_live_sec_984729104');
  const [pickupPincode, setPickupPincode] = useState('722157');

  const [localBaseRate, setLocalBaseRate] = useState(49);
  const [nationalBaseRate, setNationalBaseRate] = useState(99);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);

  const handleSaveSettings = (e: React.FormEvent) => {
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
                MODULE 8 • LOGISTICS & COURIER API
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1">
              Shipping & Logistics Integration
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Shiprocket & Delhivery API credentials, pickup warehouse pincodes, and weight-based rate rules
            </p>
          </div>

          {saved && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Logistics Settings Saved Live</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
          
          {/* Shiprocket & Courier API Integration */}
          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-ops-700 pb-4">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase">Courier API Credentials (Shiprocket & Delhivery)</h2>
                <p className="text-xs text-gray-400">Automated AWB generation and order dispatch sync</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Shiprocket User Email</label>
                <input
                  type="email"
                  value={shiprocketEmail}
                  onChange={(e) => setShiprocketEmail(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Shiprocket Password</label>
                <input
                  type="password"
                  value={shiprocketPassword}
                  onChange={(e) => setShiprocketPassword(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Delhivery Express API Token</label>
                <input
                  type="password"
                  value={delhiveryToken}
                  onChange={(e) => setDelhiveryToken(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Primary Warehouse Pickup Pincode</label>
                <input
                  type="text"
                  value={pickupPincode}
                  onChange={(e) => setPickupPincode(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Shipping Rates & Zone Rules */}
          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-ops-700 pb-4">
              <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase">Shipping Rate Calculation & Zone Rules</h2>
                <p className="text-xs text-gray-400">Configure customer shipping charges & free delivery thresholds</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Local / West Bengal Delivery Rate (₹)</label>
                <input
                  type="number"
                  value={localBaseRate}
                  onChange={(e) => setLocalBaseRate(Number(e.target.value))}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">National Rest of India Rate (₹)</label>
                <input
                  type="number"
                  value={nationalBaseRate}
                  onChange={(e) => setNationalBaseRate(Number(e.target.value))}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Free Shipping Cart Minimum (₹)</label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-3 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
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
              <span>Save Logistics Configuration</span>
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
