'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GSTBadgeTooltip from '@/components/GSTBadgeTooltip';
import { RefreshCw, CheckCircle2, AlertOctagon, RotateCcw, CreditCard } from 'lucide-react';

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-mono font-bold rounded-full uppercase border border-blue-200">
              HASSLE-FREE GUARANTEE
            </span>
            <GSTBadgeTooltip />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight">Return & Refund Policy</h1>
          <p className="text-xs text-slate-500 font-mono">Effective Date: August 16, 2026 • SHADOW ARROW Prime Marketplace</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8 text-sm text-slate-600 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>1. 7-Day Easy Return & Exchange Window</span>
            </h2>
            <p>
              SHADOW ARROW Prime Marketplace stands behind the craftsmanship, heavy cotton weight, and fit of all our apparel and cyber footwear. We offer a customer-centric <strong>7-Day Easy Return and Size Exchange Policy</strong> starting from the calendar date of physical package delivery.
            </p>
            <p>
              If your oversized tee, heavy hoodie, cargo pants, or techwear sneakers do not fit as expected, or if you are dissatisfied with your purchase, you may initiate a return or size exchange request within seven (7) days of receiving your order.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>2. Mandatory Return Conditions & Quality Inspection</span>
            </h2>
            <p>
              To qualify for a 100% full refund or free size exchange, all returned items must strictly comply with the following physical inspection criteria:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
              <li>Items must be unwashed, unworn, unused, unaltered, and free of stains, perfume scents, deodorant marks, or pet hair.</li>
              <li>Original garment tags, woven brand labels, barcode tags, and price tickets must remain intact and attached in their original positions.</li>
              <li>Footwear must be returned in the original branded shoe box, free of outdoor sole wear or scuffs.</li>
              <li>Items must be packed securely in the original anti-tamper protective bag or equivalent cardboard packaging.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <AlertOctagon className="w-4 h-4 text-amber-600" />
              <span>3. Non-Returnable & Non-Exchangeable Categories</span>
            </h2>
            <p>
              Due to strict hygiene, health, and customized drop standards, the following item categories are strictly non-returnable and non-refundable once delivered:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
              <li>Socks, innerwear, masks, and personal hydration flasks once unsealed.</li>
              <li>Items purchased during heavily discounted archive sample clearance sales marked explicitly as "Final Sale".</li>
              <li>Customized, laser-engraved, or personalized technical accessories.</li>
              <li>Products showing clear evidence of intentional physical damage, chemical washing, or unauthorized alteration.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <RotateCcw className="w-4 h-4 text-purple-600" />
              <span>4. Reverse Pickup & Return Request Process</span>
            </h2>
            <p>
              Initiating a return or size exchange is fast and straightforward:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-2">
              <li>Contact our customer support team at <strong className="text-blue-600">support.shadowarrow@gmail.com</strong> or interact with Shadow AI Stylist on the storefront. Provide your Order ID (format: <code>SA-YYYYMMDD-XXXX</code>) and reason for return.</li>
              <li>Our team will verify eligibility and schedule a doorstep reverse courier pickup via BlueDart or Delhivery within 24 to 48 hours.</li>
              <li>Hand over the securely packaged item to the pickup executive. Retain the physical reverse pickup AWB receipt issued by the courier.</li>
              <li>Once received at our warehouse, our quality control team inspects the item within 48 hours. Upon approval, your replacement size is dispatched or your refund is authorized.</li>
            </ol>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>5. Refund Processing Timelines & Payment Modes</span>
            </h2>
            <p>
              Approved refunds are credited promptly according to the original payment method utilized during checkout:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 uppercase">Prepaid Orders (Razorpay UPI / Cards)</p>
                <p className="text-emerald-600 font-bold">5 to 7 Business Days</p>
                <p className="text-[10px] text-slate-500">Direct credit back to the original source Bank Account / Card / UPI VPA.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 uppercase">Cash on Delivery (COD) Orders</p>
                <p className="text-blue-600 font-bold">5 to 7 Business Days</p>
                <p className="text-[10px] text-slate-500">Credited via secure Razorpay Payout link or direct IMPS/NEFT bank transfer upon receiving customer account details.</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono space-y-1 mt-4">
              <p className="font-bold text-slate-900 uppercase">SHADOW ARROW Returns & Refunds Desk</p>
              <p className="text-slate-500">Support Hours: Monday – Saturday (10:00 AM – 7:00 PM IST)</p>
              <p className="text-blue-600 font-bold">Support Email: support.shadowarrow@gmail.com</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
