'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, RefreshCw, Upload, MessageSquarePlus } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Unique session per browser tab
const SESSION_ID: string =
  typeof window !== 'undefined'
    ? sessionStorage.getItem('sa_chat_session') ||
      (() => {
        const id = `sf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        sessionStorage.setItem('sa_chat_session', id);
        return id;
      })()
    : 'storefront_user_session';

// Detect language from user input and tell the AI to respond in same language
function detectLanguage(text: string): string {
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bangla
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi / Devanagari
  if (/[\u0600-\u06FF]/.test(text)) return 'ur'; // Urdu / Arabic script
  return 'en';
}

// Strip markdown asterisks from AI responses so raw ** never shows in chat
function cleanText(text: string): string {
  return text
    .replace(/\*\*\*([\s\S]*?)\*\*\*/g, '$1')
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
    .replace(/\*([\s\S]*?)\*/g, '$1')
    .replace(/\*+/g, '');
}

const SUPPORT_KEYWORDS: string[] = [
  'broken', 'damaged', 'wrong item', 'return', 'refund',
  'delivery issue', 'delay', 'issue', 'problem', 'not received',
  'missing', 'complaint', 'exchange', 'lost', 'torn', 'defective',
];

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  showTicketCTA?: boolean;
  relatedIssue?: string;
}

export default function AIChatWindow({ isOpen, onClose }: AIChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hey! I'm Shadow Arrow AI \u2014 your personal stylist and support assistant \uD83D\uDE0A\n\nAsk me anything: sizing advice, outfit ideas, order tracking, returns \u2014 I got you!",
    },
  ]);
  const [input, setInput]     = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef         = useRef<HTMLDivElement>(null);

  const [activeTicketMsgId, setActiveTicketMsgId] = useState<string | null>(null);
  const [ticketContact, setTicketContact]           = useState<string>('');
  const [ticketImg, setTicketImg]                   = useState<string>('');
  const [submittingTicket, setSubmittingTicket]     = useState<boolean>(false);

  const scrollToBottom = (): void =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const lang: string      = detectLanguage(userText);
    const isSupport: boolean = SUPPORT_KEYWORDS.some((k) => userText.toLowerCase().includes(k));

    try {
      const res = await axios.post(`${API_URL}/api/v1/ai/chat`, {
        message:    userText,
        session_id: SESSION_ID,
        language:   lang,
      });

      const reply: string =
        res.data?.response ||
        res.data?.reply ||
        "I'm here to help! Could you tell me a bit more so I can sort this out for you?";

      const aiMsg: Message = {
        id:            (Date.now() + 1).toString(),
        sender:        'ai',
        text:          cleanText(reply),
        showTicketCTA: isSupport,
        relatedIssue:  isSupport ? userText : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('[Shadow Arrow AI] Request failed:', err?.response?.status, err?.response?.data || err?.message);
      const fallbackMsg: Message = {
        id:            (Date.now() + 1).toString(),
        sender:        'ai',
        text:          "Hmm, having a bit of trouble connecting right now. Hang on and try again \u2014 or let me know what you need and I'll do my best!",
        showTicketCTA: isSupport,
        relatedIssue:  isSupport ? userText : undefined,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('File size must be under 3MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setTicketImg(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAutoTicket = async (e: React.FormEvent, issueText: string): Promise<void> => {
    e.preventDefault();
    if (!ticketContact.trim()) return;
    setSubmittingTicket(true);
    try {
      const isEmail: boolean = ticketContact.includes('@');
      const payload = {
        customer_phone: isEmail ? '' : ticketContact.trim(),
        customer_email: isEmail ? ticketContact.trim() : '',
        category:       'Customer Support Inquiry',
        issue_text:     issueText || 'Support request via Shadow Arrow AI chat',
        image_url:      ticketImg,
        status:         'OPEN',
        priority:       'HIGH',
      };
      const res    = await axios.post(`${API_URL}/api/v1/support/tickets`, payload);
      const ticket = res.data?.ticket || res.data;

      setMessages((prev) => [
        ...prev,
        {
          id:     Date.now().toString(),
          sender: 'ai',
          text:   `Done! I've raised a priority support ticket for you.\n\nTicket ID: #${ticket.ticket_id || 'TICK-REGISTERED'}\n\nOur team will reach out to you at ${ticketContact} very soon. Hang tight!`,
        },
      ]);
      setActiveTicketMsgId(null);
      setTicketContact('');
      setTicketImg('');
    } catch {
      alert('Could not create ticket right now. Please try again in a moment.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col h-[540px]">

      {/* Header */}
      <div className="bg-slate-950 p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-none text-white tracking-wide">Shadow Arrow AI</h3>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span>Online &middot; Fashion &amp; Support</span>
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
          <div key={m.id}>
            <div className={`flex items-start space-x-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

              {m.sender === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 mt-1 shadow">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-3 font-sans leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none shadow'
                  : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-tl-none whitespace-pre-line shadow'
              }`}>
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center shrink-0 mt-1 shadow">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Ticket CTA */}
            {m.sender === 'ai' && m.showTicketCTA && activeTicketMsgId !== m.id && (
              <div className="ml-8 mt-2">
                <button
                  onClick={() => setActiveTicketMsgId(m.id)}
                  className="flex items-center space-x-1.5 text-[10px] text-blue-400 hover:text-blue-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-full transition"
                >
                  <MessageSquarePlus className="w-3 h-3" />
                  <span>Still not resolved? Raise a ticket instantly</span>
                </button>
              </div>
            )}

            {/* Auto-ticket form */}
            {m.sender === 'ai' && activeTicketMsgId === m.id && (
              <form
                onSubmit={(e) => handleAutoTicket(e, m.relatedIssue || '')}
                className="ml-8 mt-2 bg-slate-800 border border-slate-700 rounded-xl p-3 space-y-2 text-[11px]"
              >
                <p className="text-slate-300 font-medium">
                  Drop your phone or email and I&apos;ll create the ticket right now &#128071;
                </p>
                <input
                  type="text"
                  required
                  value={ticketContact}
                  onChange={(e) => setTicketContact(e.target.value)}
                  placeholder="Phone number or email address"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-700 hover:bg-slate-900 rounded-lg text-slate-300 text-[10px] cursor-pointer w-full transition">
                  <Upload className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{ticketImg ? 'Photo attached!' : 'Attach damage photo (optional)'}</span>
                  <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </label>
                <div className="flex space-x-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => { setActiveTicketMsgId(null); setTicketContact(''); setTicketImg(''); }}
                    className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-[10px] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTicket || !ticketContact.trim()}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-[10px] rounded-lg transition"
                  >
                    {submittingTicket ? 'Creating...' : 'Raise Ticket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 ml-8 text-slate-400 italic">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Shadow Arrow AI is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex space-x-1.5 overflow-x-auto text-[10px]">
        <button onClick={() => setInput('What size should I order?')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 font-medium transition">
          &#128085; Sizing Help
        </button>
        <button onClick={() => setInput('I received a damaged item')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 font-medium transition">
          &#9888;&#65039; Damaged Item
        </button>
        <button onClick={() => setInput('I want to return my order')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 font-medium transition">
          &#128260; Return Order
        </button>
        <button onClick={() => setInput('Track my order')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 font-medium transition">
          &#128230; Track Order
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Shadow Arrow AI anything..."
          className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 transition active:scale-95 shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
