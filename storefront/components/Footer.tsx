'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, HelpCircle, MessageSquare, X, ArrowRight, Bell } from 'lucide-react';
import SupportWidgetModal from '@/components/SupportWidgetModal';
import GSTBadgeTooltip from '@/components/GSTBadgeTooltip';
import FAQSection from '@/components/FAQSection';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function Footer() {
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [unreadReplyTicket, setUnreadReplyTicket] = useState<any | null>(null);
  const [dismissedTickets, setDismissedTickets] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Background Poll for Support Replies
  useEffect(() => {
    const checkSupportReplies = async () => {
      try {
        const savedUserStr = localStorage.getItem('shadow_user');
        if (!savedUserStr) return;
        const u = JSON.parse(savedUserStr);
        const contact = u.phone || u.email;
        if (!contact) return;

        const res = await axios.get(`${API_URL}/api/v1/user/tickets?contact=${encodeURIComponent(contact)}`);
        const tickets = res.data || [];

        let foundUnreadTicket: any = null;
        let count = 0;

        for (const t of tickets) {
          const messages = t.messages || [];
          if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            const tId = t.ticket_id || t.id;
            // If last message is from admin and not dismissed
            if (lastMsg.sender === 'admin') {
              count++;
              if (!dismissedTickets.includes(tId) && !foundUnreadTicket) {
                foundUnreadTicket = {
                  ...t,
                  latestAdminMsg: lastMsg.message,
                };
              }
            }
          }
        }

        setUnreadCount(count);
        if (foundUnreadTicket) {
          setUnreadReplyTicket(foundUnreadTicket);
        }
      } catch (err) {
        // Silently ignore network poll errors
      }
    };

    checkSupportReplies();
    const interval = setInterval(checkSupportReplies, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [dismissedTickets]);

  const handleDismissToast = (tId: string) => {
    setDismissedTickets((prev) => [...prev, tId]);
    setUnreadReplyTicket(null);
  };

  const handleOpenTicketFromToast = () => {
    setUnreadReplyTicket(null);
    setSupportModalOpen(true);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          
          {/* Brand Bio */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 group">
              <div className="sa_logo_badge w-8 h-8 rounded-lg text-xs font-black shadow-md">
                SA
              </div>
              <span className="shadow_arrow_logo font-black text-lg text-white uppercase tracking-tight">SHADOW ARROW</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Streetwear and technical lifestyle apparel engineered for extreme comfort, boxy silhouettes, and high-density cotton construction.
            </p>
            <GSTBadgeTooltip />
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
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-mono animate-pulse">
                      {unreadCount}
                    </span>
                  )}
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

        {/* FAQ Accordion Section */}
        <FAQSection />

        {/* Bottom Bar with Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-mono gap-4">
          <p>© {new Date().getFullYear()} SHADOW ARROW Inc. All rights reserved. Registered Trademark & Government GST Verified Marketplace (GSTIN: 19BVKPL6301H1ZH).</p>
          <p>Support: support.shadowarrow@gmail.com</p>
        </div>
      </div>

      {/* FLOATING SUPPORT BUTTON (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3 font-sans">
        
        {/* POPUP TOAST NOTIFICATION WHEN SUPPORT TEAM REPLIES */}
        {unreadReplyTicket && (
          <div className="max-w-sm w-full bg-slate-900 border-2 border-blue-500 rounded-3xl p-4 shadow-2xl text-white text-xs space-y-2.5 animate-bounce relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-600 rounded-xl text-white">
                  <Bell className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="font-mono font-bold text-blue-400 text-xs uppercase">Support Reply Received!</span>
                  <p className="text-[10px] text-slate-400 font-mono">Ticket #{unreadReplyTicket.ticket_id}</p>
                </div>
              </div>
              <button
                onClick={() => handleDismissToast(unreadReplyTicket.ticket_id || unreadReplyTicket.id)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-200 line-clamp-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50 italic">
              "{unreadReplyTicket.latestAdminMsg}"
            </p>

            <button
              onClick={handleOpenTicketFromToast}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase font-mono flex items-center justify-center space-x-1.5 shadow-md transition"
            >
              <span>View Support Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Quick Trigger Button */}
        <button
          onClick={() => setSupportModalOpen(true)}
          className="relative p-3.5 bg-slate-900 hover:bg-black text-white rounded-full shadow-2xl border border-slate-700 hover:border-blue-500 transition flex items-center justify-center group active:scale-95"
          title="Open Help Desk Support"
        >
          <MessageSquare className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center border-2 border-slate-900 animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <SupportWidgetModal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
    </footer>
  );
}
