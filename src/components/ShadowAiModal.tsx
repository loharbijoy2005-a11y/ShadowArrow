import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, Send, Plus } from 'lucide-react';
import { Product } from '../types';

interface ShadowAiModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ShadowAiModal: React.FC<ShadowAiModalProps> = ({
  isOpen,
  products,
  onClose,
  onAddToCart
}) => {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; recProducts?: Product[] }[]
  >([
    {
      sender: 'assistant',
      text: '⚡ Greetings! I am **Shadow AI**, your personal shopping assistant. How can I assist you with product recommendations, discount coupons, or delivery times today?'
    }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setInput('');

    setTimeout(() => {
      const lower = q.toLowerCase();
      let reply = '';
      let recs: Product[] = [];

      if (lower.includes('keyboard') || lower.includes('mechanical')) {
        const p = products.find((x) => x.id === 'prod-1') || products[0];
        reply = '🎮 The **Shadow Stealth Pro Mechanical Gaming Keyboard** is our #1 bestseller! Features hot-swappable brown switches and RGB lighting.';
        if (p) recs.push(p);
      } else if (lower.includes('coupon') || lower.includes('discount') || lower.includes('code')) {
        reply = '🔥 Active Promo Codes:\n- **SHADOW10**: 10% Extra OFF\n- **SHADOW50**: 50% Mega Festival OFF on orders > ₹999';
      } else if (lower.includes('monitor') || lower.includes('curved') || lower.includes('screen')) {
        const p = products.find((x) => x.id === 'prod-4');
        reply = '⚡ Check out the **Ultra-Wide 2K Curved Gaming Monitor (34")**! 165Hz smooth refresh rate and 1500R panoramic curvature.';
        if (p) recs.push(p);
      } else if (lower.includes('jacket') || lower.includes('fashion') || lower.includes('hoodie')) {
        const p = products.find((x) => x.id === 'prod-3');
        reply = '🧥 The **Cyberpunk Shadow Streetwear Bomber Jacket** is crafted with water-resistant ballistic fabric and reflective orange trim.';
        if (p) recs.push(p);
      } else {
        recs = products.slice(0, 2);
        reply = 'Here are our top recommended Prime gear items tailored for your dark high-performance setup:';
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: reply, recProducts: recs }]);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative max-w-lg w-full bg-slate-900 border-2 border-purple-500/80 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.3)] overflow-hidden flex flex-col h-[560px]">

        {/* HEADER */}
        <div className="p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                Shadow AI Assistant
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono">ONLINE</span>
              </h3>
              <p className="text-[10px] text-purple-300">Ask about gear specs, coupons, or order status</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CHAT BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-purple-600 text-white font-medium rounded-tr-none shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.recProducts && m.recProducts.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-slate-800">
                    {m.recProducts.map((p) => (
                      <div key={p.id} className="flex items-center gap-2.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-950" />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-bold text-xs text-white truncate">{p.name}</div>
                          <div className="text-amber-400 font-black text-xs">₹{p.price.toLocaleString('en-IN')}</div>
                        </div>
                        <button
                          onClick={() => onAddToCart(p)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* QUICK CHIPS */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleSend('Recommend mechanical keyboard')}
            className="bg-slate-900 hover:bg-slate-800 text-purple-300 px-3 py-1 rounded-full whitespace-nowrap border border-slate-800 transition"
          >
            🎮 Mechanical Keyboards
          </button>
          <button
            onClick={() => handleSend('Show discount coupons')}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-3 py-1 rounded-full whitespace-nowrap border border-slate-800 transition"
          >
            🔥 Active Coupons
          </button>
          <button
            onClick={() => handleSend('Curved monitor deals')}
            className="bg-slate-900 hover:bg-slate-800 text-cyan-400 px-3 py-1 rounded-full whitespace-nowrap border border-slate-800 transition"
          >
            ⚡ Curved Monitors
          </button>
        </div>

        {/* INPUT */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Shadow AI e.g. 'Best mouse under ₹2000?'"
            className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleSend()}
            className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
