'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import GSTBadgeTooltip from '@/components/GSTBadgeTooltip';
import { ShieldCheck, Lock, Eye, Server, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [customText, setCustomText] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('shadow_policy_privacy');
    if (saved) setCustomText(saved);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-mono font-bold rounded-full uppercase border border-blue-200">
              LEGAL & COMPLIANCE
            </span>
            <GSTBadgeTooltip />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 font-mono">Effective Date: August 16, 2026 • SHADOW ARROW Prime Marketplace</p>
        </div>

        {customText ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-4 text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans">
            {customText}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8 text-sm text-slate-600 leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>1. Information Collection & Scope</span>
              </h2>
              <p>
                SHADOW ARROW Prime Marketplace ("we", "us", or "our") respects the privacy rights of all users and online visitors. This Privacy Policy details how we collect, store, process, transfer, and protect your personal identification information when you browse our website, interact with Shadow AI Stylist, or place an order for streetwear apparel, footwear, and accessories.
              </p>
              <p>
                We collect information directly provided by you during account registration, checkout, or customer service communications. This includes your full legal name, shipping and billing addresses, primary telephone number, email address, pincode, size preferences, and specific delivery instructions.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>2. Purpose & Use of Collected Data</span>
              </h2>
              <p>
                Your personal information is strictly processed for legitimate business operations and legal compliance under the Information Technology Act, 2000, and Consumer Protection (E-Commerce) Rules, 2020 of India.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
                <li>Process customer orders, verify transaction authenticity, and issue official GST Tax Invoices.</li>
                <li>Dispatch packages via authorized Pan-India logistics partners (BlueDart Express, Delhivery, Expressbees).</li>
                <li>Provide personalized fashion stylist recommendations via Shadow AI Stylist.</li>
                <li>Maintain financial auditing records in compliance with Indian GST taxation laws.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>3. Payment Gateway & Third-Party Processing</span>
              </h2>
              <p>
                All online payment transactions are securely routed through Razorpay Software Private Limited. SHADOW ARROW does NOT store, record, or retain raw credit card numbers or UPI PINs on our servers.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>4. Grievance Redressal & Support Desk</span>
              </h2>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono space-y-1">
                <p className="font-bold text-slate-900 uppercase">SHADOW ARROW Privacy & Grievance Desk</p>
                <p className="text-slate-500">Registered Entity: SHADOW ARROW Prime Marketplace</p>
                <p className="text-slate-500">GSTIN: 19BVKPL6301H1ZH</p>
                <p className="text-blue-600 font-bold">Email: support.shadowarrow@gmail.com</p>
                <p className="text-slate-500">Address: Dapanjuri Road, Bhara, Bankura, West Bengal - 722157</p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
