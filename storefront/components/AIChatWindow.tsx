'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, RefreshCw, Upload } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Generate a unique session ID per browser tab so each user has their own chat context
const SESSION_ID = typeof window !== 'undefined'
  ? (sessionStorage.getItem('sa_chat_session') || (() => {
      const id = `sf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem('sa_chat_session', id);
      return id;
    })())
  : 'storefront_user_session';

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isTicketForm?: boolean;
  ticketData?: any;
}

export default function AIChatWindow({ isOpen, onClose }: AIChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hi there! Welcome to SHADOW ARROW. How can I help you find the perfect fit, style, or order today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inline Ticket Form state
  const [ticketContact, setTicketContact] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketImg, setTicketImg] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const lower = userText.toLowerCase();
    const isSupportIssue = ["broken", "damaged", "wrong item", "return", "refund", "delivery issue", "delay", "issue"].some(k => lower.includes(k));

    if (isSupportIssue) {
      setTimeout(() => {
        const ticketMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I'm so sorry to hear that! You can log a priority support ticket right here with proof photo attachment:",
          isTicketForm: true,
        };
        setMessages((prev) => [...prev, ticketMsg]);
        setTicketDesc(userText);
        setLoading(false);
      }, 300);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/v1/ai/chat`, {
        message: userText,
        session_id: SESSION_ID,
      });

      // Support both `response` and `reply` keys from the AI microservice
      const reply =
        res.data?.response ||
        res.data?.reply ||
        "SHADOW ARROW oversized fits are designed for ultimate urban comfort! What style can I help you pair?";
      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      // Log the real error so devs can debug — check browser console
      console.error('[AI Chat] Request failed:', err?.response?.status, err?.response?.data || err?.message);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I can help with styling advice, sizing, or tracking your order! Feel free to ask any question or share your Order ID.",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('File size must be under 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setTicketImg(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleInlineTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketContact.trim() || !ticketDesc.trim()) return;

    setSubmittingTicket(true);
    try {
      const payload = {
        customer_phone: ticketContact.trim(),
        customer_email: ticketContact.includes('@') ? ticketContact.trim() : '',
        category: 'Customer Support Inquiry',
        issue_text: ticketDesc.trim(),
        image_url: ticketImg,
        status: 'OPEN',
        priority: 'HIGH',
      };

      const res = await axios.post(`${API_URL}/api/v1/support/tickets`, payload);
      const ticket = res.data?.ticket || res.data;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: `✅ Support ticket logged! Reference ID: #${ticket.ticket_id || 'TICK-REGISTERED'}. Our customer care team will get back to your contact (${ticketContact}) shortly.`,
        },
      ]);
      setTicketDesc('');
      setTicketContact('');
      setTicketImg('');
    } catch (err) {
      alert('Failed to log ticket. Please try again.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col h-[520px]">
      
      {/* Header */}
      <div className="bg-slate-950 p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-none text-white">SHADOW ARROW Stylist</h3>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span>Online • Fashion & Support</span>
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-3 shadow-xs font-sans leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none whitespace-pre-line'
              }`}
            >
              <p>{m.text}</p>

              {/* Inline Ticket Form */}
              {m.isTicketForm && (
                <form onSubmit={handleInlineTicketSubmit} className="mt-3 pt-3 border-t border-slate-700 space-y-2 text-xs">
                  <input
                    type="text"
                    required
                    value={ticketContact}
                    onChange={(e) => setTicketContact(e.target.value)}
                    placeholder="Enter phone or email"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                  />
                  <textarea
                    required
                    rows={2}
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    placeholder="Describe issue..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-[11px]"
                  />
                  <div className="flex items-center space-x-2">
                    <label className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-300 text-[10px] cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>{ticketImg ? 'Photo Attached' : 'Upload Damage Photo'}</span>
                      <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                    </label>
                    <button
                      type="submit"
                      disabled={submittingTicket}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase rounded-lg shadow"
                    >
                      {submittingTicket ? 'Submitting...' : 'Create Ticket'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            {m.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 italic">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Stylist is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex space-x-1.5 overflow-x-auto text-[10px]">
        <button
          onClick={() => setInput("What size fit should I get?")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 font-medium transition"
        >
          👕 Sizing & Fit Advice
        </button>
        <button
          onClick={() => setInput("I received a damaged item")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 font-medium transition"
        >
          ⚠️ Report Damaged Item
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about styles, sizing, or report issues..."
          className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
