import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, Send, Plus, Package, Truck, ShieldCheck, Tag, Headphones, MessageSquare } from 'lucide-react';
import { Product, User, Order } from '../types';
import { sanitizeInput } from '../utils/security';

interface ShadowAiModalProps {
  isOpen: boolean;
  products: Product[];
  user?: User | null;
  orders?: Order[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ShadowAiModal: React.FC<ShadowAiModalProps> = ({
  isOpen,
  products,
  user,
  orders = [],
  onClose,
  onAddToCart
}) => {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; recProducts?: Product[] }[]
  >([
    {
      sender: 'assistant',
      text: `👋 Hello${user?.name ? ' ' + user.name : ''}! I am **Shadow Support Desk AI**, your 24/7 Senior Customer Service Executive.

I am here to assist you with:
- 📦 **Order Tracking & Courier Delivery**
- 🏠 **Delivery Address Updates**
- 🛡️ **Replacements, Returns & Refund Claims**
- 📜 **GST Invoices & Payment Help**
- 🎮 **Gear Recommendations**

How can I help resolve your issue today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    if (isSending) return;

    const raw = textToSend || input;
    const q = sanitizeInput(raw);
    if (!q) return;

    setIsSending(true);
    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setInput('');

    setTimeout(() => {
      const lower = q.toLowerCase();
      let reply = '';
      let recs: Product[] = [];

      // 1. SPECIFIC ORDER ID LOOKUP & TRACKING
      const orderIdMatch = q.match(/(ord-sa-\d+|\b\d{6}\b)/i);
      const specificOrder = orderIdMatch
        ? orders.find(
            (o) =>
              o.orderId.toLowerCase() === orderIdMatch[0].toLowerCase() ||
              o.orderId.toLowerCase().includes(orderIdMatch[0].toLowerCase())
          )
        : null;

      if (specificOrder) {
        const itemDetails = specificOrder.items
          ? specificOrder.items
              .map((i: any) => `  * **${i.name || i.product?.name}** (Qty: ${i.quantity}) - ₹${((i.price || i.product?.price || 0) * i.quantity).toLocaleString('en-IN')}`)
              .join('\n')
          : '  * Prime Product';

        const orderDateStr = specificOrder.createdAt
          ? new Date(specificOrder.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Recently Placed';

        reply = `📦 **Order Details & Live Status for \`${specificOrder.orderId}\`**:

- ⚡ **Current Status**: **${specificOrder.status}**
- 👤 **Customer**: ${specificOrder.name} (${specificOrder.phone})
- 🛒 **Ordered Items**:
${itemDetails}
- 💰 **Amount**: **₹${specificOrder.total.toLocaleString('en-IN')}** (${specificOrder.paymentMethod})
- 📍 **Delivery Address**: ${specificOrder.address.street}, ${specificOrder.address.city} - ${specificOrder.address.pincode}
- 📅 **Order Date**: ${orderDateStr}
- 🚚 **Dispatch Origin**: Central Warehouse (Pincode 722157) via Express Air

Need to update your delivery address or raise a request for this order? Reply here and I will assist you!`;
      } else if (orderIdMatch && !specificOrder) {
        reply = `🔍 **Order Lookup**:
I searched for Order ID \`${orderIdMatch[0].toUpperCase()}\`, but it was not found under your active login session.

💡 **Resolution Steps**:
1. Please verify your 6-digit Order ID number.
2. Check if you placed the order under a different phone number or account.
3. You can also view all your active orders in the **"Your Orders"** modal from the header menu!`;
      }
      // 2. ORDER / TRACKING / WHERE IS MY PARCEL
      else if (
        lower.includes('order') ||
        lower.includes('track') ||
        lower.includes('where is') ||
        lower.includes('status') ||
        lower.includes('kahan hai') ||
        lower.includes('kab aayega')
      ) {
        if (orders && orders.length > 0) {
          const orderSummaries = orders
            .map(
              (o, idx) =>
                `**${idx + 1}. \`${o.orderId}\`**: Status: **${o.status}** | Amount: ₹${o.total.toLocaleString('en-IN')}`
            )
            .join('\n');
          reply = `📦 **Here are your active orders (${orders.length})**:

${orderSummaries}

💡 *To get full details or tracking info, simply type the Order ID (e.g. \`${orders[0].orderId}\`)!*`;
        } else if (user) {
          reply = `📦 Hi ${user.name}, you don't have any active orders under this account yet. 

If you recently placed an order, please allow 1-2 minutes for MongoDB sync, or type your Order ID directly!`;
        } else {
          reply = `📦 To track your active order, please click **"Sign In"** in the top bar or send your 6-digit Order ID (e.g. \`ORD-SA-123456\`). All parcels are shipped within 24 hours via Prime Express Air!`;
        }
      }
      // 3. ADDRESS CHANGE / UPDATE ADDRESS
      else if (
        lower.includes('address') ||
        lower.includes('change address') ||
        lower.includes('location') ||
        lower.includes('pincode')
      ) {
        reply = `🏠 **Delivery Address Management**:

- **Update Profile Address**: You can add, edit, or switch your delivery locations anytime by clicking **Profile (User Icon)** in the top menu!
- **Change Address for Active Order**: If you placed an order and want to change the delivery destination before courier dispatch, please email us immediately at \`support.shadowarrow@gmail.com\` with your Order ID and new address!`;
      }
      // 4. DAMAGED / DEFECTIVE / WRONG ITEM / ISSUE / PROBLEM / COMPLAINT
      else if (
        lower.includes('damage') ||
        lower.includes('broken') ||
        lower.includes('defect') ||
        lower.includes('shattered') ||
        lower.includes('wrong') ||
        lower.includes('problem') ||
        lower.includes('issue') ||
        lower.includes('complain') ||
        lower.includes('not working') ||
        lower.includes('faulty') ||
        lower.includes('kharab')
      ) {
        reply = `🛡️ **7-Day Priority Support & Doorstep Replacement Desk**:

I am very sorry to hear that you experienced an issue! Don't worry, your purchase is 100% protected under our **7-Day Hassle-Free Doorstep Replacement Guarantee**.

📩 **How to Get an Instant Replacement**:
1. Take a quick photo or video showing the damaged/defective product or unboxing parcel.
2. Email your Order ID + photo proof to: **\`support.shadowarrow@gmail.com\`**
3. Our priority team will verify it and dispatch a brand new replacement parcel within **2 hours**!

*Registered GSTIN: 19BVKPL6301H1ZH*`;
      }
      // 5. REFUND / RETURN / CANCELLATION
      else if (
        lower.includes('return') ||
        lower.includes('refund') ||
        lower.includes('cancel') ||
        lower.includes('paisa') ||
        lower.includes('money back')
      ) {
        reply = `💳 **Returns & Refund Care Desk**:

- **7-Day Return Window**: You can request a doorstep return within 7 days of delivery.
- **Prepaid Refunds**: Automatically refunded to your original UPI/Card account within 3-5 business days.
- **COD Refunds**: Provide your UPI ID / Bank details when emailing support for direct electronic transfer.
- **Support Contact**: Email \`support.shadowarrow@gmail.com\` with your Order ID to initiate a return pickup!`;
      }
      // 6. PAYMENT / COD / UPI / RAZORPAY / FAILED PAYMENT
      else if (
        lower.includes('pay') ||
        lower.includes('cod') ||
        lower.includes('upi') ||
        lower.includes('card') ||
        lower.includes('cash') ||
        lower.includes('failed')
      ) {
        reply = `💳 **Payment Guidance & Security**:

- **Supported Modes**: We accept 100% Encrypted UPI (GPay, PhonePe, Paytm), All Bank Credit/Debit Cards, NetBanking via Razorpay, and Cash on Delivery (COD).
- **Payment Failed Issue?**: If money was deducted during a failed transaction, Razorpay automatically reverses the amount to your bank account within 24-48 hours. You can safely try placing the order again or select Cash on Delivery (COD)!`;
      }
      // 7. GST / INVOICE REQUEST
      else if (lower.includes('gst') || lower.includes('invoice') || lower.includes('bill') || lower.includes('tax')) {
        reply = `📜 **GST Invoice Care**:
All orders include a 100% Tax Compliant B2C / B2B GST Invoice (**GSTIN: 19BVKPL6301H1ZH**).

You can open **"Your Orders"** from the top header and click **"📄 GST Invoice"** next to any order to view & print your tax bill instantly!`;
      }
      // 8. AMAZON / FLIPKART SELLER QUERY
      else if (
        lower.includes('flipkart') ||
        lower.includes('amazon') ||
        lower.includes('seller') ||
        lower.includes('marketplace')
      ) {
        reply = `🛒 **Official Marketplace Presence**:
Yes! Shadow Arrow is an official verified brand seller on **Flipkart** and **Amazon India**, as well as on our direct standalone Prime Portal (\`shadowarrow.in\`).

⚡ *Buying directly on our website gives you 100% genuine warranty, exclusive mega discounts, and 3-Day Express Shipping!*`;
      }
      // 9. COUPONS / DISCOUNTS / CODES (EXPLICIT PROMO REQUEST)
      else if (
        lower.includes('coupon') ||
        lower.includes('discount') ||
        lower.includes('code') ||
        lower.includes('offer')
      ) {
        reply = `🔥 **Active Promotional Coupons**:
- **SHADOW10**: 10% Extra OFF on all cart items
- **SHADOW50**: 50% Mega Festival Discount on orders above ₹999
- **PRIME20**: 20% Cashback for Prime Members

You can apply these discount codes right inside your Cart Drawer!`;
      }
      // 10. PRODUCT RECOMMENDATIONS (ONLY IF CUSTOMER EXPLICITLY ASKS FOR GEAR!)
      else if (
        lower.includes('recommend') ||
        lower.includes('buy') ||
        lower.includes('purchase') ||
        lower.includes('keyboard') ||
        lower.includes('mouse') ||
        lower.includes('monitor') ||
        lower.includes('headphone') ||
        lower.includes('smartwatch') ||
        lower.includes('jacket') ||
        lower.includes('gear') ||
        lower.includes('suggest')
      ) {
        if (lower.includes('keyboard')) {
          recs = products.filter((p) => p.category === 'gaming').slice(0, 2);
          reply = `🎮 Here is our #1 esports-grade mechanical keyboard setup:`;
        } else if (lower.includes('monitor') || lower.includes('screen')) {
          recs = products.filter((p) => p.id === 'prod-4');
          reply = `🖥️ Check out our Ultra-Wide 2K Curved 165Hz Gaming Monitor:`;
        } else if (lower.includes('headphone') || lower.includes('audio')) {
          recs = products.filter((p) => p.id === 'prod-5');
          reply = `🎧 Check out our Active Noise-Cancelling Titanium Headphones:`;
        } else {
          recs = products.slice(0, 2);
          reply = `🛍️ Here are our top featured dark-themed Prime products:`;
        }
      }
      // 11. GREETINGS / HI / HELLO / BOT HELP
      else if (
        lower.includes('hi') ||
        lower.includes('hello') ||
        lower.includes('hey') ||
        lower.includes('help') ||
        lower.includes('kaise ho')
      ) {
        reply = `👋 Hello! I am your Senior Support Assistant at Shadow Arrow. 

I am here to solve any issue with your order, tracking, address changes, returns, or payments. What can I help you with today?`;
      }
      // 12. GENERAL SUPPORT ASSISTANT RESPONSIVE FALLBACK (EMPATHETIC & HELPFUL)
      else {
        reply = `🤝 **Shadow Customer Support Desk**:

I have logged your query. As your dedicated support agent, I want to ensure your issue is completely resolved!

- 📩 **Official Support Desk**: \`support.shadowarrow@gmail.com\`
- 📜 **Registered GSTIN**: **19BVKPL6301H1ZH**
- 🚚 **Dispatch & Logistics Hub**: Bankura, WB (Pincode 722157)

If you need help with an order, please share your 6-digit Order ID or type **"Track Order"**, **"Return"**, or **"Payment Issue"**!`;
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: reply, recProducts: recs }]);
      setIsSending(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative max-w-lg w-full bg-slate-900 border-2 border-purple-500/80 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.3)] overflow-hidden flex flex-col h-[580px]">

        {/* HEADER */}
        <div className="p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                Shadow Support Desk AI
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">24/7 SUPPORT</span>
              </h3>
              <p className="text-[10px] text-purple-300">Live order resolution, replacements & support desk</p>
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
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
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

        {/* QUICK ACTION CHIPS FOR SUPPORT DESK */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <button
            onClick={() => handleSend('Track my active order')}
            className="bg-slate-900 hover:bg-slate-800 text-emerald-400 px-3 py-1 rounded-full whitespace-nowrap border border-slate-800 transition flex items-center gap-1 font-bold"
          >
            <Package className="w-3 h-3" /> Track Order
          </button>
          <button
            onClick={() => handleSend('Item is damaged or defective')}
            className="bg-slate-900 hover:bg-slate-800 text-rose-400 px-3 py-1 rounded-full whitespace-nowrap border border-slate-800 transition flex items-center gap-1 font-bold"
          >
            <ShieldCheck className="w-3 h-3" /> Report Damage
          </button>
          <button
            onClick={() => handleSend('How to change delivery address?')}
            className="bg-slate-900 hover:bg-slate-800 text-cyan-400 px-3 py-1 rounded-full whitespace-nowrap border border-slate-800 transition flex items-center gap-1 font-bold"
          >
            <Truck className="w-3 h-3" /> Change Address
          </button>
          <button
            onClick={() => handleSend('Show active coupons')}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-3 py-1 rounded-full whitespace-nowrap border border-slate-800 transition flex items-center gap-1 font-bold"
          >
            <Tag className="w-3 h-3" /> Active Coupons
          </button>
        </div>

        {/* INPUT */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your issue or query e.g. 'Where is my order?'"
            className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isSending}
            className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
