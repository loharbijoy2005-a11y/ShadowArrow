import React from 'react';
import { X, Printer, Download, ShieldCheck, Truck } from 'lucide-react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 print:p-0">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md print:hidden" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white my-8 print:my-0 print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none">
        
        {/* ACTION BAR (Hidden in Print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1 rounded-full font-bold">
              TAX INVOICE & RECEIPT
            </span>
            <span className="text-xs text-slate-400 font-mono">#{order.orderId}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INVOICE BODY (Printable Content) */}
        <div className="p-6 md:p-8 space-y-6 print:p-6 print:text-black">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 print:border-black/20 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-wider text-amber-400 print:text-amber-600">SHADOW ARROW</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 print:text-black border border-amber-500/40 px-2 py-0.5 rounded font-black uppercase">PRIME</span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">Official Tax Invoice & Order Confirmation</p>
              <p className="text-[11px] text-slate-500 print:text-gray-500 font-mono">GSTIN: 19BVKPL6301H1ZH | Registered E-Commerce Vendor</p>
            </div>

            <div className="text-left md:text-right space-y-1">
              <h3 className="font-black text-lg text-white print:text-black uppercase tracking-tight">TAX INVOICE</h3>
              <p className="text-xs text-amber-400 print:text-amber-700 font-mono font-bold">Invoice No: INV-{order.orderId}</p>
              <p className="text-xs text-slate-400 print:text-gray-600">Date: {invoiceDate}</p>
              <p className="text-xs text-slate-400 print:text-gray-600">Place of Supply: {order.address?.state || 'West Bengal'}</p>
            </div>
          </div>

          {/* SENDER & RECEIVER DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-slate-800 print:border-black/20 pb-6">
            
            {/* SELLER / WAREHOUSE DETAILS */}
            <div className="bg-slate-950/60 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-1">
              <h4 className="font-bold text-amber-400 print:text-amber-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Shipped From (Central Warehouse)</span>
              </h4>
              <p className="font-bold text-white print:text-black">SHADOW ARROW LOGISTICS HUB</p>
              <p className="text-slate-300 print:text-gray-700">Primary Warehouse (5952+GJ8 Dapanjuri)</p>
              <p className="text-slate-300 print:text-gray-700">Bankura, West Bengal - 722157</p>
              <p className="text-slate-400 print:text-gray-600 font-mono">Official Email: support.shadowarrow@gmail.com</p>
            </div>

            {/* CUSTOMER DETAILS */}
            <div className="bg-slate-950/60 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-1">
              <h4 className="font-bold text-amber-400 print:text-amber-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Billed To & Shipped To</span>
              </h4>
              <p className="font-bold text-white print:text-black">{order.name}</p>
              <p className="text-slate-300 print:text-gray-700">{order.address?.street}, {order.address?.city}</p>
              <p className="text-slate-300 print:text-gray-700">{order.address?.state || 'West Bengal'} - {order.address?.pincode}</p>
              <p className="text-slate-400 print:text-gray-600 font-mono">Phone: +91 {order.phone}</p>
              {order.email && <p className="text-slate-400 print:text-gray-600 font-mono">Email: {order.email}</p>}
            </div>

          </div>

          {/* ITEM TABLE */}
          <div>
            <h4 className="font-bold text-xs text-slate-300 print:text-gray-800 uppercase tracking-wider mb-2">Order Items Breakdown</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-gray-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-gray-800 uppercase font-bold border-b border-slate-800 print:border-gray-300">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">HSN Code</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {order.items?.map((item: any, idx: number) => {
                    const price = item.price || item.product?.price || 0;
                    const qty = item.quantity || 1;
                    const itemTotal = price * qty;
                    return (
                      <tr key={idx} className="text-slate-200 print:text-black">
                        <td className="p-3 font-mono text-slate-500 print:text-gray-500">{idx + 1}</td>
                        <td className="p-3 font-medium">
                          {item.name || item.product?.name || 'Prime Item'}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-400 print:text-gray-600">84713010</td>
                        <td className="p-3 text-center font-bold">{qty}</td>
                        <td className="p-3 text-right font-mono">₹{price.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono font-bold text-amber-400 print:text-black">₹{itemTotal.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTALS & PAYMENT SUMMARY */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-2">
            <div className="space-y-1 text-xs text-slate-400 print:text-gray-600">
              <p className="font-bold text-slate-300 print:text-black">Payment Summary:</p>
              <p>Method: <strong className="text-amber-400 print:text-black font-mono">{order.paymentMethod}</strong></p>
              <p>Payment Status: <span className="bg-emerald-500/20 text-emerald-400 print:text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">VERIFIED & CONFIRMED</span></p>
              <p className="text-[10px] text-slate-500 print:text-gray-500 italic mt-2">This is a computer-generated invoice and requires no physical signature.</p>
            </div>

            <div className="w-full md:w-64 bg-slate-950/80 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400 print:text-gray-700">
                <span>Subtotal:</span>
                <span className="font-mono">₹{(order.subtotal || order.total).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400 print:text-gray-700">
                <span>Express Delivery:</span>
                <span className="font-mono text-emerald-400 print:text-emerald-700">FREE</span>
              </div>
              <div className="flex justify-between text-slate-400 print:text-gray-700">
                <span>GST (Included 18%):</span>
                <span className="font-mono">₹{Math.round(order.total * 0.18 / 1.18).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 print:border-gray-300 flex justify-between font-black text-sm text-amber-400 print:text-black">
                <span>Grand Total:</span>
                <span className="font-mono text-base">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* FOOTER GUARANTEE */}
          <div className="pt-4 border-t border-slate-800 print:border-gray-300 text-center text-[10px] text-slate-500 print:text-gray-600 space-y-1">
            <p className="font-bold text-slate-400 print:text-black">Thank you for shopping with SHADOW ARROW PRIME MARKETPLACE!</p>
            <p>For any order queries, contact 24/7 Official Email Support at <strong>support.shadowarrow@gmail.com</strong>.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
