'use client';

import React from 'react';
import Header from '@/components/Header';
import { ShieldCheck, Lock, Eye, Server, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full space-y-8">
        <div className="border-b border-slate-800 pb-6 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold rounded-full uppercase border border-blue-500/30">
              LEGAL & COMPLIANCE
            </span>
            <span className="text-xs font-mono text-slate-500">GSTIN: 19BVKPL6301H1ZH</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 font-mono">Effective Date: August 16, 2026 • SHADOW ARROW Prime Marketplace</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 text-sm text-slate-300 leading-relaxed font-sans">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white uppercase font-mono flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span>1. Information Collection & Scope</span>
            </h2>
            <p>
              SHADOW ARROW Prime Marketplace ("we", "us", or "our") respects the privacy rights of all users and online visitors. This Privacy Policy details how we collect, store, process, transfer, and protect your personal identification information when you browse our website, interact with Shadow AI Stylist, or place an order for streetwear apparel, footwear, and accessories.
            </p>
            <p>
              We collect information directly provided by you during account registration, checkout, or customer service communications. This includes your full legal name, shipping and billing addresses, 10-digit primary telephone number, email address, pincode, size preferences, and specific delivery instructions. Additionally, automated technical log data such as IP address, browser user-agent string, device identifiers, and session timestamps are logged to prevent fraudulent transactions and optimize server performance.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white uppercase font-mono flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>2. Purpose & Use of Collected Data</span>
            </h2>
            <p>
              Your personal information is strictly processed for legitimate business operations and legal compliance under the Information Technology Act, 2000, and Consumer Protection (E-Commerce) Rules, 2020 of India. Specifically, your data is utilized to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2">
              <li>Process customer orders, verify transaction authenticity, and issue official GST Tax Invoices.</li>
              <li>Dispatch packages via authorized Pan-India logistics partners (BlueDart Express, Delhivery, Expressbees) and transmit real-time SMS/Email AWB tracking links.</li>
              <li>Provide personalized fashion stylist recommendations, size assistance, and support ticket management through Shadow AI Stylist.</li>
              <li>Detect, investigate, and prevent fraudulent transactions, unauthorized account access, and card testing exploits.</li>
              <li>Maintain financial auditing records in compliance with Indian GST taxation laws.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white uppercase font-mono flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>3. Payment Gateway & Third-Party Processing</span>
            </h2>
            <p>
              All online payment transactions (UPI, Credit Cards, Debit Cards, NetBanking, and Digital Wallets) are securely routed and processed through Razorpay Software Private Limited. SHADOW ARROW does NOT store, record, or retain raw credit card numbers, CVVs, card expiration dates, bank login credentials, or UPI PINs on our servers.
            </p>
            <p>
              Payment data transmission is encrypted using industry-standard 256-bit Secure Sockets Layer (SSL) and Transport Layer Security (TLS 1.3) protocols. Razorpay operates under PCI-DSS Level 1 compliance standards mandated by the Reserve Bank of India (RBI).
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white uppercase font-mono flex items-center space-x-2 border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>4. Cookie Policy & Web Analytics</span>
            </h2>
            <p>
              We utilize essential HTTP session cookies and local storage tokens to preserve your shopping cart state, maintain authenticated user sessions, and remember dark theme display settings. Essential cookies cannot be disabled as they are required for standard website functionality and checkout operations.
            </p>
            <p>
              We do not sell, rent, trade, or monetize customer personal data to third-party advertising networks or data brokers under any circumstances.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white uppercase font-mono flex items-center space-x-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>5. Data Retention, Rights & Grievance Redressal</span>
            </h2>
            <p>
              Customer transaction records and tax invoices are retained for a statutory period of 7 years in accordance with Indian tax audit regulations. Account profile data remains active until explicit deletion is requested by the user.
            </p>
            <p>
              Under applicable Indian privacy regulations, you have the right to request access to, correction of, or permanent erasure of your non-statutory personal data. To exercise your rights or lodge a privacy grievance, please contact our designated Statutory Grievance Officer:
            </p>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono space-y-1">
              <p className="font-bold text-white uppercase">SHADOW ARROW Privacy & Grievance Desk</p>
              <p className="text-slate-400">Registered Entity: SHADOW ARROW Prime Marketplace</p>
              <p className="text-slate-400">GSTIN: 19BVKPL6301H1ZH</p>
              <p className="text-blue-400 font-bold">Email: support.shadowarrow@gmail.com</p>
              <p className="text-slate-400">Address: Technopark Urban Sector, Kolkata, West Bengal, India</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
