'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, HelpCircle } from 'lucide-react';
import SupportWidgetModal from '@/components/SupportWidgetModal';

export default function Footer() {
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          
          {/* Brand Bio */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white text-slate-900 font-black flex items-center justify-center rounded-lg text-sm">
                SA
              </div>
              <span className="font-black text-lg text-white uppercase tracking-tight">SHADOW ARROW</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Streetwear and technical lifestyle apparel engineered for extreme comfort, boxy silhouettes, and high-density cotton construction.
            </p>
            <p className="text-xs font-mono text-blue-400">GSTIN: 19BVKPL6301H1ZH</p>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 font-mono">Catalog Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/?category=Apparel#catalog" className="hover:text-white transition">Apparel & Heavy Tees</Link></li>
              <li><Link href="/?category=Footwear#catalog" className="hover:text-white transition">Techwear & Cyber Sneakers</Link></li>
              <li><Link href="/?category=Accessories#catalog" className="hover:text-white transition">Precision Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Assistance */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 font-mono">Customer Assistance</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/account" className="hover:text-white transition">User Account & Profile</Link></li>
              <li>
                <button
                  onClick={() => setSupportModalOpen(true)}
                  className="hover:text-white text-blue-400 font-bold transition flex items-center space-x-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>24x7 Help Desk / Support</span>
                </button>
              </li>
              <li><a href="mailto:support.shadowarrow@gmail.com" className="hover:text-white transition flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>support.shadowarrow@gmail.com</span>
              </a></li>
            </ul>
          </div>

          {/* Compliance & Policies */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 font-mono">Compliance & Policies</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/policies/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/policies/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/policies/shipping" className="hover:text-white transition">Shipping & Delivery Policy</Link></li>
              <li><Link href="/policies/returns" className="hover:text-white transition">Return & Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-mono gap-4">
          <p>SHADOW ARROW Prime Marketplace</p>
          <p>Support: support.shadowarrow@gmail.com</p>
        </div>
      </div>

      <SupportWidgetModal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
    </footer>
  );
}
