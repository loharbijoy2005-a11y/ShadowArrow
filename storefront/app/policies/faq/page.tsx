'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import GSTBadgeTooltip from '@/components/GSTBadgeTooltip';
import { HelpCircle, ChevronDown, Sparkles, Truck, CreditCard, RotateCcw, Package, ShieldCheck } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: '1. Sizing, Fits & Materials',
    icon: <Package className="w-4 h-4 text-blue-500" />,
    items: [
      {
        question: 'What materials and fabric weights (GSM) do you use?',
        answer: 'All our streetwear garments (T-shirts, hoodies, cargo bottoms) are built from 100% combed organic French Terry cotton, with weights ranging from 350 GSM to 450 GSM. They are bio-washed, silicon-finished, and pre-shrunk to retain shape and softness even after multiple washes.',
      },
      {
        question: 'How do I choose the correct size? Are fits oversized?',
        answer: 'Yes! Most of our items are custom-engineered with a signature boxy, drop-shoulder, oversized fit. If you prefer a standard fit, we recommend ordering one size down. You can refer to our interactive Size Guide on any product detail page or ask the AI Stylist Assistant for recommendations.',
      },
      {
        question: 'What are the wash care instructions for graphic prints?',
        answer: 'To preserve high-density matte puff prints and screen prints, wash the garments inside out in cold water on a gentle cycle. Do not iron directly on the print area, do not dry clean, and lay flat to dry to avoid stretching the cotton fibers.',
      },
    ],
  },
  {
    title: '2. Shipping & Delivery Timelines',
    icon: <Truck className="w-4 h-4 text-emerald-500" />,
    items: [
      {
        question: 'How long will it take to ship and deliver my order?',
        answer: 'We dispatch all orders within 24 hours. Express courier deliveries take 2 to 3 business days for metro cities (Kolkata, Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai) and 4 to 6 business days for the rest of India.',
      },
      {
        question: 'Which delivery couriers do you use?',
        answer: 'We partner with India’s leading premium logistics carriers, primarily BlueDart Express, Delhivery, and Expressbees. Every order receives a live Shiprocket AWB tracking link via SMS, WhatsApp, and Email as soon as it leaves our warehouse.',
      },
      {
        question: 'How do I track my active order status?',
        answer: 'You can track your order in real time by clicking "Track Order" in the website menu or by opening the tracking modal. Simply enter your 10-digit mobile number or Order ID (e.g. #SA-1082) to view current courier checkpoints and estimated delivery time.',
      },
    ],
  },
  {
    title: '3. Payments, COD & GST Invoicing',
    icon: <CreditCard className="w-4 h-4 text-amber-500" />,
    items: [
      {
        question: 'Do you offer Cash on Delivery (COD)?',
        answer: 'Yes! Cash on Delivery (COD) is available for over 26,000+ PIN codes across India. There are no hidden charges. You can inspect the package condition upon delivery before making cash or UPI payments to the delivery partner.',
      },
      {
        question: 'What online payment modes do you support?',
        answer: 'We secure all digital payments using Razorpay. We support Pan-India UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking across 50+ major banks, Credit/Debit Cards (Visa, Mastercard, RuPay), and popular Wallet options.',
      },
      {
        question: 'Can I get a tax invoice with my business GSTIN for tax credit?',
        answer: 'Absolutely. We issue a government-registered GST Tax Invoice (Form GST REG-06) with every order. Our registered GSTIN is 19BVKPL6301H1ZH. During checkout, you can input your company name and GSTIN to claim a 18% Input Tax Credit (HSN code 61091000).',
      },
    ],
  },
  {
    title: '4. Returns, Exchanges & Refunds',
    icon: <RotateCcw className="w-4 h-4 text-purple-500" />,
    items: [
      {
        question: 'What is your return and exchange policy?',
        answer: 'We provide a hassle-free 7-day Return and Replacement policy. If your item is defective, has sizing issues, or was damaged in transit, you can initiate a request via our 24x7 Support Desk. We will schedule a courier to pick up the item from your doorstep at zero cost.',
      },
      {
        question: 'How long does the refund process take?',
        answer: 'Once the returned item is picked up and reaches our fulfillment center, we verify its condition (unused, original tags attached) and process the refund within 48 hours. Online payments are refunded to the original payment source; COD refunds are credited via UPI or Bank Transfer as per your preference.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string>('0-0');

  const toggleAccordion = (catIdx: number, itemIdx: number) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenIndex((prev) => (prev === key ? '' : key));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        
        {/* Header Block */}
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-mono font-bold rounded-full uppercase border border-blue-200">
              Customer Assistance
            </span>
            <GSTBadgeTooltip />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight">
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Last Updated: August 18, 2026 • SHADOW ARROW Prime Marketplace
          </p>
        </div>

        {/* Detailed FAQ Categories */}
        <div className="space-y-8">
          {FAQ_DATA.map((cat, catIdx) => (
            <section key={catIdx} className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-200 pb-2">
                {cat.icon}
                <span>{cat.title}</span>
              </h2>

              <div className="space-y-3">
                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isOpen = openIndex === key;
                  return (
                    <div
                      key={itemIdx}
                      className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                        isOpen
                          ? 'bg-white border-blue-500 shadow-md shadow-blue-500/5'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <button
                        onClick={() => toggleAccordion(catIdx, itemIdx)}
                        className="w-full p-4 sm:p-5 text-left flex justify-between items-center space-x-4 focus:outline-none"
                      >
                        <h3 className="font-bold text-sm text-slate-900">{item.question}</h3>
                        <div className={`p-1 bg-slate-100 rounded-full text-slate-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-600 bg-blue-50' : ''}`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-5 sm:px-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                          <p className="pl-3 border-l-2 border-blue-500 font-sans text-slate-700">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Still Need Help banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 border border-slate-800 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-black uppercase text-base flex items-center justify-center sm:justify-start space-x-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Still have questions?</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Our 24x7 Help Desk and AI stylist are always active to assist you.
            </p>
          </div>
          <a
            href="mailto:support.shadowarrow@gmail.com"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-xl transition shadow"
          >
            Email Help Desk
          </a>
        </div>
      </main>
    </div>
  );
}
