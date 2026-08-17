'use client';

import React from 'react';
import Header from '@/components/Header';
import GSTBadgeTooltip from '@/components/GSTBadgeTooltip';
import { Truck, Clock, MapPin, ShieldCheck, FileCheck } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-mono font-bold rounded-full uppercase border border-blue-200">
              LOGISTICS & FULFILLMENT
            </span>
            <GSTBadgeTooltip />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight">Shipping & Delivery Policy</h1>
          <p className="text-xs text-slate-500 font-mono">Effective Date: August 16, 2026 • SHADOW ARROW Pan-India Express</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8 text-sm text-slate-600 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>1. Order Dispatch & Processing Timelines</span>
            </h2>
            <p>
              At SHADOW ARROW Prime Marketplace, we prioritize rapid fulfillment and pristine package safety for all streetwear drops and techwear gear. Once your order is confirmed via Razorpay Online Payment or Cash on Delivery (COD) verification, our warehouse team initiates quality inspection, anti-tamper poly-bagging, and dispatch processing.
            </p>
            <p>
              All standard orders are dispatched from our centralized fulfillment center within <strong>24 to 48 business hours</strong> (excluding Sundays and national public holidays). During high-demand limited streetwear drop campaigns, dispatch timelines may extend up to 72 hours. You will receive an automated order status confirmation SMS and email as soon as your items pass quality verification.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>2. Delivery Timelines Across India</span>
            </h2>
            <p>
              We partner exclusively with tier-1 accredited Pan-India express logistics providers—including BlueDart Express, Delhivery, Expressbees, and Shadowfax—to ensure fast, reliable transit. Estimated delivery timelines across regions are outlined below:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 uppercase">Metro Cities</p>
                <p className="text-blue-600 font-bold">2 to 4 Business Days</p>
                <p className="text-[10px] text-slate-500">Delhi NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 uppercase">Tier 2 & 3 Cities</p>
                <p className="text-purple-600 font-bold">3 to 6 Business Days</p>
                <p className="text-[10px] text-slate-500">State Capitals & Major Urban Towns</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 uppercase">Rest of India & Special Regions</p>
                <p className="text-amber-600 font-bold">5 to 7 Business Days</p>
                <p className="text-[10px] text-slate-500">North-East, J&K, Island Regions</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>3. Shipping Charges & Free Delivery Thresholds</span>
            </h2>
            <p>
              SHADOW ARROW provides <strong>100% FREE Express Shipping</strong> on all prepaid and COD orders across India. There are zero hidden delivery fees, handling surcharges, or distance multipliers added to your cart total during checkout.
            </p>
            <p>
              For Cash on Delivery (COD) orders, a nominal non-refundable COD handling fee of ₹49 may apply at checkout to cover courier cash collection and verification protocols.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>4. Real-Time Tracking & Dispatch Notifications</span>
            </h2>
            <p>
              As soon as your package is handed over to our courier partner, an official Air Waybill (AWB) tracking number is generated. You will receive an immediate notification containing your live courier tracking link via SMS, WhatsApp, and Email.
            </p>
            <p>
              You can track your package 24/7 directly using our persistent floating <strong>Track Order bubble widget</strong> on the storefront, or by visiting our dedicated <a href="/track-order" className="text-blue-600 font-bold hover:underline">Track Order portal</a> and submitting your Order ID (format: <code>SA-YYYYMMDD-XXXX</code>) or registered phone number.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>5. Failed Delivery Attempts & Wrong Address Protocol</span>
            </h2>
            <p>
              Our courier partners will make up to three (3) delivery attempts before marking a shipment as Return to Origin (RTO). The courier executive will attempt telephonic contact using your registered mobile number prior to final delivery.
            </p>
            <p>
              If a package is returned to our warehouse due to an incorrect or incomplete shipping address, recipient unavailability, or refusal to accept a COD order, our customer support team will contact you to re-confirm delivery details. Re-shipping an RTO package may incur a nominal re-dispatch freight fee of ₹99.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono space-y-1">
              <p className="font-bold text-slate-900 uppercase">SHADOW ARROW Express Logistics Desk</p>
              <p className="text-slate-500">Support Hours: Monday – Saturday (10:00 AM – 7:00 PM IST)</p>
              <p className="text-blue-600 font-bold">Logistics Helpline Email: support.shadowarrow@gmail.com</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
