'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GSTBadgeTooltip from '@/components/GSTBadgeTooltip';
import { Scale, CheckCircle2, ShieldAlert, Copyright, HelpCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-mono font-bold rounded-full uppercase border border-blue-200">
              TERMS & CONDITIONS
            </span>
            <GSTBadgeTooltip />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-500 font-mono">Effective Date: August 16, 2026 • SHADOW ARROW Prime Marketplace</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8 text-sm text-slate-600 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>1. Agreement & Acceptance of Terms</span>
            </h2>
            <p>
              Welcome to SHADOW ARROW Prime Marketplace ("Platform"). These Terms of Service constitute a legally binding agreement between you ("User", "Customer", or "You") and SHADOW ARROW Prime Marketplace regarding your access to and use of our web platform, storefront API, customer account portal, and automated AI styling services.
            </p>
            <p>
              By accessing the website, browsing catalog items, interacting with Shadow AI Stylist, registering an account, or purchasing products, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service, along with our Privacy Policy, Shipping Policy, and Return & Refund Policy. If you do not agree to all terms, you must immediately discontinue use of the Platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>2. Account Registration, Eligibility & Security</span>
            </h2>
            <p>
              To place orders and access order history tracking, you may register a customer account on the Platform. By creating an account, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
              <li>You are at least 18 years of age or possess legal parental/guardian consent to enter into binding contracts under the Indian Contract Act, 1872.</li>
              <li>All information provided during registration (full legal name, phone number, email address, shipping destination) is truthful, accurate, and current.</li>
              <li>You are solely responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>3. Product Specifications, Pricing & Order Acceptance</span>
            </h2>
            <p>
              We strive to display product images, fabric composition details, oversized fit parameters, color swatches, and pricing with complete accuracy. However, slight variations in color tone may occur due to screen calibration and monitor display settings.
            </p>
            <p>
              All prices listed on the Platform are in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST). SHADOW ARROW reserves the right to adjust pricing, revise promotional drops, or discontinue items without prior notice. Receipt of an electronic order confirmation does not signify final order acceptance. We reserve the right to decline, limit, or cancel any order for reasons including inventory stockout, suspected fraudulent payment, delivery address unserviceability, or pricing display errors. If an order is canceled after payment debit, a full 100% refund is credited back to the original source payment method within 5-7 business days.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Copyright className="w-4 h-4 text-purple-600" />
              <span>4. Intellectual Property Rights</span>
            </h2>
            <p>
              All original content, visual design tokens, logo trademarks, graphic prints, photographic campaign imagery, software code (Golang REST API, Next.js storefront, Python FastAPI AI microservice), sound assets, and brand assets available on this Platform are the exclusive property of SHADOW ARROW Prime Marketplace and are protected under Indian and international copyright, trademark, and trade dress laws.
            </p>
            <p>
              Users are granted a limited, revocable, non-exclusive, non-transferable license to access the Platform solely for personal, non-commercial shopping purposes. Unauthorized reproduction, modification, distribution, or reverse-engineering of any Platform component is strictly prohibited.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>5. Limitation of Liability & Governing Law</span>
            </h2>
            <p>
              To the maximum extent permitted under applicable law, SHADOW ARROW Prime Marketplace shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the Platform, courier shipping delays caused by force majeure events (natural disasters, strikes, transit disruptions), or technical service interruptions.
            </p>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes or legal claims arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts located in Kolkata, West Bengal, India.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono space-y-1">
              <p className="font-bold text-slate-900 uppercase">SHADOW ARROW Legal Department</p>
              <p className="text-slate-500">Registered Entity: SHADOW ARROW Prime Marketplace</p>
              <p className="text-blue-600 font-bold">Support Email: support.shadowarrow@gmail.com</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
