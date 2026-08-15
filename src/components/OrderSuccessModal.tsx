import React from 'react';
import { CheckCircle2, FileText, Shield, Truck, ArrowRight, Package } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';

interface OrderSuccessModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  order,
  onClose,
  onViewInvoice
}) => {
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative max-w-lg w-full bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl z-[101] text-center transform transition-all animate-in fade-in zoom-in-95 my-8">
        
        {/* GLOWING CHECKMARK */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </div>

        <div>
          <span className="inline-block bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-xs px-3.5 py-1 rounded-full font-mono mb-2 tracking-wider">
            🎉 ORDER CONFIRMED & DISPATCHING
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Thank You, {order.name}!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Order Reference ID: <strong className="text-amber-400 font-mono">{order.orderId}</strong>
          </p>
        </div>

        {/* DETAILS CARD */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs text-left">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-400 font-bold">Payment Method:</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono text-[10px]">
              {order.paymentMethod}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-400 font-bold">Total Amount Paid:</span>
            <span className="font-black text-amber-400 font-mono text-sm">
              ₹{order.total.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-400 font-bold">Estimated Delivery:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-indigo-400" />
              <span>3-5 Business Days (Air Express)</span>
            </span>
          </div>

          {/* ORDERED ITEMS PREVIEW */}
          <div className="pt-1">
            <span className="text-slate-400 font-bold text-[11px] block mb-2">Order Summary ({order.items.length} items):</span>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {order.items.map((item: any, idx: number) => {
                const img = item.image || item.product?.image || '/assets/keyboard.png';
                const name = item.name || item.product?.name || 'Item';
                const price = item.price || item.product?.price || 0;
                return (
                  <div key={idx} className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800 text-[11px]">
                    <img src={img} alt={name} className="w-10 h-10 object-cover rounded-lg bg-slate-950 border border-slate-800" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{name}</div>
                      <div className="text-slate-400 font-mono">Qty: {item.quantity || 1} × ₹{price}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onViewInvoice(order)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Tax Invoice & Warranty</span>
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-3 rounded-xl text-xs shadow-xl transition flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
