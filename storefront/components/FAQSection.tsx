'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, RotateCcw, FileText, Sparkles } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Materials & Sizing',
    question: 'What materials and fabric GSM are used in Shadow Arrow apparel?',
    answer: 'Our signature tees and hoodies are crafted from 350 to 450 GSM 100% organic French Terry combed cotton. They feature drop-shoulder boxy fits, pre-shrunk bio-wash treatment, and high-density matte screen printing.',
  },
  {
    id: 'faq-2',
    category: 'Shipping & Delivery',
    question: 'How long does shipping and delivery take across India?',
    answer: 'Orders are processed within 24 hours. Express delivery takes 2 to 3 business days for metro cities (Kolkata, Delhi NCR, Mumbai, Bangalore, Hyderabad) and 4 to 6 business days for rest of India with live AWB tracking.',
  },
  {
    id: 'faq-3',
    category: 'Payment Options',
    question: 'Is Cash on Delivery (COD) available for all pin codes?',
    answer: 'Yes! Cash on Delivery (COD) is available across 26,000+ pin codes in India. We also accept Razorpay online payments via UPI (Google Pay, PhonePe, Paytm), Net Banking, and Credit/Debit cards.',
  },
  {
    id: 'faq-4',
    category: 'Returns & Exchange',
    question: 'What is the 7-Day Return and Replacement Policy?',
    answer: 'If you receive a defective item, incorrect size, or damaged parcel, you can request a 100% replacement or full refund within 7 days of delivery via our 24x7 Help Desk or email.',
  },
  {
    id: 'faq-5',
    category: 'Tax & GST Invoice',
    question: 'Can I get an official GST Tax Invoice with my GSTIN for business tax credit?',
    answer: 'Yes! Every Shadow Arrow order comes with a government-verified GST Tax Invoice (Form GST REG-06, GSTIN: 19BVKPL6301H1ZH) containing 18% GST breakdown (9% CGST + 9% SGST), HSN code 61091000, and seller details.',
  },
  {
    id: 'faq-6',
    category: 'Order Tracking',
    question: 'How do I track my active order status in real time?',
    answer: 'You can click "Track Order" in the navigation bar or floating widget and enter your 10-digit mobile number or Order ID (e.g. #SA-1082) to view live courier status, AWB tracking, and delivery ETA.',
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-12 bg-slate-900/60 border-t border-slate-800 text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 font-mono text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Got Questions? We’ve Got Answers.
          </h2>
          <p className="text-xs text-slate-400 font-mono max-w-xl mx-auto">
            Everything you need to know about Shadow Arrow products, shipping, COD payments, returns, and GST invoices.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 font-sans">
          {FAQ_DATA.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-800/90 border-blue-500/50 shadow-lg shadow-blue-500/5'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex justify-between items-center space-x-4 focus:outline-none"
                >
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-700 text-blue-400 font-mono text-[10px] font-bold rounded-md shrink-0">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-sm text-white">{faq.question}</h3>
                  </div>
                  <div className={`p-1.5 rounded-full bg-slate-900/80 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 pt-1 text-xs text-slate-300 leading-relaxed font-mono border-t border-slate-700/40 animate-in fade-in duration-200">
                    <p className="pl-2 border-l-2 border-blue-500">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
