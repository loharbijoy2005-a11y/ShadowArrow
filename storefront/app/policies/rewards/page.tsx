'use client';

import React from 'react';
import Header from '@/components/Header';
import GSTBadgeTooltip from '@/components/GSTBadgeTooltip';
import { Coins, Award, Gift, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RewardsPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        {/* Header Region */}
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-mono font-bold rounded-full uppercase border border-amber-200">
              LOYALTY PROGRAM
            </span>
            <GSTBadgeTooltip />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight">
            ArrowCoins Loyalty Rewards
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Last Updated: August 19, 2026 • SHADOW ARROW Prime Marketplace
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8 text-sm text-slate-600 leading-relaxed">
          {/* Section 1: Overview */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>1. What is ArrowCoins?</span>
            </h2>
            <p>
              The **ArrowCoins Loyalty Program** is our way of giving back to the community. Whether you are ordering boxy heavyweight streetwear tees, sneakers, or technical wear, every eligible order earns you ArrowCoins cashback directly credited to your account.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono space-y-1">
              <p className="font-bold text-slate-900">CORE CONVERSION RATE</p>
              <p className="text-amber-700 font-bold">1 ArrowCoin = ₹1.00 INR</p>
              <p className="text-slate-500">Coins are non-transferable and cannot be exchanged for raw bank currency.</p>
            </div>
          </section>

          {/* Section 2: Membership Tiers */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>2. 12-Month Rolling Membership Tiers</span>
            </h2>
            <p>
              Your cashback percentage and maximum credit caps are calculated based on your membership tier. Tiers are automatically evaluated based on your total **delivered orders** in a rolling 12-month window:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Silver Card */}
              <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">0–4 Delivered Orders</span>
                <h3 className="font-bold text-slate-800 text-sm">SILVER TIER</h3>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 list-disc list-inside">
                  <li><strong>1% cashback</strong> on orders</li>
                  <li>Cap: <strong>50 coins</strong> per order</li>
                </ul>
              </div>

              {/* Gold Card */}
              <div className="p-5 border border-amber-200 rounded-2xl bg-amber-50/50 space-y-2">
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">5–19 Delivered Orders</span>
                <h3 className="font-bold text-slate-800 text-sm">GOLD TIER</h3>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 list-disc list-inside">
                  <li><strong>2% cashback</strong> on orders</li>
                  <li>Cap: <strong>100 coins</strong> per order</li>
                </ul>
              </div>

              {/* Diamond Card */}
              <div className="p-5 border border-cyan-200 rounded-2xl bg-cyan-50/50 space-y-2">
                <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase">20+ Delivered Orders</span>
                <h3 className="font-bold text-slate-800 text-sm">DIAMOND TIER</h3>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 list-disc list-inside">
                  <li><strong>5% cashback</strong> on orders</li>
                  <li>Cap: <strong>200 coins</strong> per order</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Redemption Rules */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Gift className="w-4 h-4 text-rose-600" />
              <span>3. Redemption Limits & Checkout Caps</span>
            </h2>
            <p>
              To keep the program sustainable, we apply a maximum redemption limit per order:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Redemption Cap</strong>: You can pay for up to **5% of your total order amount** using ArrowCoins. The remaining balance must be paid via ONLINE or COD payment modes.</li>
              <li><strong>Coupon Conflicts</strong>: ArrowCoins can be combined with coupon codes. The 5% cap will be calculated based on the subtotal *after* the coupon discount is applied.</li>
            </ul>
          </section>

          {/* Section 4: Holding Periods & Expirations */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>4. Holding Periods & Expirations</span>
            </h2>
            <p>
              Coins earned from purchases are subject to abuse protection controls:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>7-Day Activation Hold</strong>: When you place an order, the earned coins are stored as `PENDING`. They will be activated and added to your spending balance **7 days after delivery** (upon expiration of the return/refund period).</li>
              <li><strong>365-Day Expiration</strong>: Activated coins are valid for exactly **365 days (1 year)** from the date they become active. Expired coins are automatically purged by the server.</li>
              <li><strong>Return/Cancellation Deductions</strong>: If an order is returned or cancelled, any pending or active coins earned from that order will be deducted from your account.</li>
            </ul>
          </section>

          {/* Section 5: Security & Verification */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase font-mono flex items-center space-x-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>5. Fraud Controls & Account Deletion</span>
            </h2>
            <p>
              Loyalty balances are linked strictly to a single customer's verified phone/email profile. Any attempts to generate multiple fake profiles to farm coins will result in immediate termination of the loyalty program benefit for those accounts. 
            </p>
            <p>
              *Please note: Requesting full account deletion under our Privacy Policy permanently forfeits all active and pending ArrowCoins. Deleted coins cannot be restored if you create a new profile.*
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="pt-4 flex justify-between items-center text-xs font-mono text-slate-500">
          <Link href="/" className="flex items-center space-x-1 hover:text-slate-900 transition">
            <span className="rotate-180 inline-block font-bold">→</span>
            <span>Back to Storefront</span>
          </Link>
          <Link href="/account" className="flex items-center space-x-1 hover:text-slate-900 transition text-blue-600 font-bold">
            <span>Go to Rewards Passbook</span>
            <span>→</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
