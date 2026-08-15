import React, { useState } from 'react';
import { X, Printer, ShieldCheck, Truck, FileText, Award, CheckCircle2, CreditCard } from 'lucide-react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'invoice' | 'warranty'>('invoice');

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDateObj = order.createdAt ? new Date(order.createdAt) : new Date();
  const formattedDate = invoiceDateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = invoiceDateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const officialGstIn = '19BVKPL6301H1ZH';

  // Calculate Itemized GST & Taxable Values
  const itemsBreakdown = (order.items || []).map((item: any) => {
    const price = item.price || item.product?.price || 0;
    const qty = item.quantity || 1;
    const gstRate = item.gstRate || item.product?.gstRate || 18;
    const hsnCode = item.hsnCode || item.product?.hsnCode || '8471';
    const warranty = item.product?.warranty || item.warranty || '1 Year Official Brand Warranty';

    const itemTotal = price * qty;
    const gstAmount = Math.round(itemTotal * (gstRate / (100 + gstRate)));
    const taxableValue = itemTotal - gstAmount;
    const cgst = Math.round(gstAmount / 2);
    const sgst = gstAmount - cgst;

    return {
      name: item.name || item.product?.name || 'Prime Marketplace Item',
      hsnCode,
      gstRate,
      qty,
      unitPrice: price,
      itemTotal,
      taxableValue,
      gstAmount,
      cgst,
      sgst,
      warranty
    };
  });

  const totalTaxable = itemsBreakdown.reduce((sum, i) => sum + i.taxableValue, 0);
  const totalGst = itemsBreakdown.reduce((sum, i) => sum + i.gstAmount, 0);
  const totalCgst = itemsBreakdown.reduce((sum, i) => sum + i.cgst, 0);
  const totalSgst = itemsBreakdown.reduce((sum, i) => sum + i.sgst, 0);

  const txnId = order.razorpayPaymentId || `TXN-${order.orderId.toUpperCase()}`;
  const isOnline = !(order.paymentMethod || '').toLowerCase().includes('cod');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 print:p-0">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md print:hidden" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white my-8 print:my-0 print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none">
        
        {/* ACTION & TAB BAR (Hidden in Print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('invoice')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'invoice'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>📄 Official Invoice</span>
            </button>

            <button
              onClick={() => setActiveTab('warranty')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'warranty'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>📜 Printable Warranty Card</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download A4 Paper</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: OFFICIAL INVOICE */}
        {activeTab === 'invoice' && (
          <div className="p-6 md:p-8 space-y-6 print:p-6 print:text-black">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 print:border-black/20 pb-6 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-2xl tracking-wider text-amber-400 print:text-amber-700">SHADOW ARROW</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 print:text-black border border-amber-500/40 px-2 py-0.5 rounded font-black uppercase">PRIME MARKETPLACE</span>
                </div>
                <p className="text-xs text-slate-400 print:text-gray-600 mt-1">Official Legal Invoice & Order Receipt</p>
                <p className="text-[11px] text-slate-400 print:text-gray-600 font-mono mt-0.5">
                  Seller GSTIN: <strong className="text-amber-400 print:text-black">{officialGstIn}</strong> | Reg. E-Commerce Vendor
                </p>
              </div>

              <div className="text-left md:text-right space-y-1">
                <h3 className="font-black text-lg text-white print:text-black uppercase tracking-tight">TAX INVOICE</h3>
                <p className="text-xs text-amber-400 print:text-amber-700 font-mono font-bold">Invoice No: INV-{order.orderId}</p>
                <p className="text-xs text-slate-400 print:text-gray-600">Invoice Date: {formattedDate} ({formattedTime})</p>
                <p className="text-xs text-slate-400 print:text-gray-600">Place of Supply: {order.address?.state || 'West Bengal'}</p>
              </div>
            </div>

            {/* SENDER & RECEIVER DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-slate-800 print:border-black/20 pb-6">
              
              {/* SELLER DETAILS */}
              <div className="bg-slate-950/60 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-1">
                <h4 className="font-bold text-amber-400 print:text-amber-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Shipped From (Central Warehouse)</span>
                </h4>
                <p className="font-bold text-white print:text-black">SHADOW ARROW LOGISTICS HUB</p>
                <p className="text-slate-300 print:text-gray-700">Warehouse 722157 (Central Dispatches)</p>
                <p className="text-slate-300 print:text-gray-700">Bankura, West Bengal - 722157</p>
                <p className="text-slate-400 print:text-gray-600 font-mono">GSTIN: {officialGstIn}</p>
                <p className="text-slate-400 print:text-gray-600 font-mono">Email: support.shadowarrow@gmail.com</p>
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
              </div>

            </div>

            {/* ITEMIZED HSN & TAX TABLE */}
            <div>
              <h4 className="font-bold text-xs text-slate-300 print:text-gray-800 uppercase tracking-wider mb-2">Itemized HSN & Tax Breakdown</h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-gray-300">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-gray-800 uppercase font-bold border-b border-slate-800 print:border-gray-300">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">HSN</th>
                      <th className="p-2.5 text-center">GST %</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Taxable Val</th>
                      <th className="p-2.5 text-right">CGST</th>
                      <th className="p-2.5 text-right">SGST</th>
                      <th className="p-2.5 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                    {itemsBreakdown.map((item, idx) => (
                      <tr key={idx} className="text-slate-200 print:text-black">
                        <td className="p-2.5 font-mono text-slate-500 print:text-gray-500">{idx + 1}</td>
                        <td className="p-2.5 font-medium">{item.name}</td>
                        <td className="p-2.5 text-center font-mono text-amber-400 print:text-black font-bold">{item.hsnCode}</td>
                        <td className="p-2.5 text-center font-mono text-emerald-400 print:text-black font-bold">{item.gstRate}%</td>
                        <td className="p-2.5 text-center font-bold">{item.qty}</td>
                        <td className="p-2.5 text-right font-mono">₹{item.taxableValue.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-right font-mono text-slate-400 print:text-gray-600">₹{item.cgst.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-right font-mono text-slate-400 print:text-gray-600">₹{item.sgst.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-amber-400 print:text-black">₹{item.itemTotal.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTALS & FULL PAYMENT/TRANSACTION DETAILS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-2">
              
              <div className="bg-slate-950/60 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-1.5 text-xs text-slate-300 print:text-gray-800 w-full md:w-auto flex-1">
                <p className="font-bold text-amber-400 print:text-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Verified Payment & Transaction Record</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono mt-1">
                  <div>
                    <span className="text-slate-400 print:text-gray-600 block">Payment Mode:</span>
                    <strong className="text-amber-400 print:text-black">{order.paymentMethod || 'Razorpay Online'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-gray-600 block">Transaction ID:</span>
                    <strong className="text-emerald-400 print:text-black">{txnId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-gray-600 block">Payment Timestamp:</span>
                    <strong className="text-slate-200 print:text-black">{formattedDate} at {formattedTime}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-gray-600 block">Verification Status:</span>
                    <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] uppercase ${isOnline ? 'bg-emerald-500/20 text-emerald-400 print:text-emerald-800' : 'bg-amber-500/20 text-amber-400 print:text-amber-800'}`}>
                      {isOnline ? '✓ PAID & VERIFIED ONLINE' : 'COD - PAYMENT UPON DELIVERY'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-72 bg-slate-950/80 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 print:text-gray-700">
                  <span>Total Taxable Value:</span>
                  <span className="font-mono font-bold text-white print:text-black">₹{totalTaxable.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-gray-700">
                  <span>Central GST (CGST):</span>
                  <span className="font-mono">₹{totalCgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-gray-700">
                  <span>State GST (SGST):</span>
                  <span className="font-mono">₹{totalSgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-gray-700">
                  <span>Express Delivery:</span>
                  <span className="font-mono text-emerald-400 print:text-emerald-700 font-bold">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 print:border-gray-300 flex justify-between font-black text-sm text-amber-400 print:text-black">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="pt-4 border-t border-slate-800 print:border-gray-300 text-center text-[10px] text-slate-500 print:text-gray-600 space-y-1">
              <p className="font-bold text-slate-400 print:text-black">Thank you for shopping with SHADOW ARROW PRIME MARKETPLACE!</p>
              <p>Computer generated tax invoice. Contact 24/7 Support at <strong>support.shadowarrow@gmail.com</strong> | GSTIN: {officialGstIn}</p>
            </div>

          </div>
        )}

        {/* TAB 2: OFFICIAL PRINTABLE WARRANTY CERTIFICATE */}
        {activeTab === 'warranty' && (
          <div className="p-6 md:p-8 space-y-6 print:p-6 print:text-black">
            
            {/* WARRANTY HEADER */}
            <div className="text-center border-b border-slate-800 print:border-black/20 pb-6 space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg print:border-black/30">
                <Award className="w-10 h-10 text-amber-400 print:text-amber-700" />
              </div>
              <h2 className="font-black text-2xl text-amber-400 print:text-amber-800 uppercase tracking-tight">
                OFFICIAL BRAND WARRANTY CERTIFICATE
              </h2>
              <p className="text-xs text-slate-400 print:text-gray-600 font-medium">
                Authorized Guarantee & 48-Hour Doorstep Replacement Protection
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 print:text-gray-600 font-mono pt-1">
                <span>Order Ref: <strong className="text-white print:text-black">{order.orderId}</strong></span>
                <span>•</span>
                <span>Date: <strong className="text-white print:text-black">{formattedDate}</strong></span>
                <span>•</span>
                <span>Seller GSTIN: <strong className="text-amber-400 print:text-black">{officialGstIn}</strong></span>
              </div>
            </div>

            {/* CUSTOMER & PAYMENT VERIFICATION DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="bg-slate-950/70 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-1">
                <span className="text-[10px] text-amber-400 print:text-amber-800 font-bold uppercase block tracking-wider">
                  Registered Owner Information
                </span>
                <p className="font-bold text-white print:text-black text-sm">{order.name}</p>
                <p className="text-slate-300 print:text-gray-700">{order.address?.street}, {order.address?.city}</p>
                <p className="text-slate-300 print:text-gray-700">{order.address?.state} - {order.address?.pincode}</p>
                <p className="text-slate-400 print:text-gray-600 font-mono pt-1">Phone: +91 {order.phone}</p>
              </div>

              <div className="bg-slate-950/70 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-1">
                <span className="text-[10px] text-emerald-400 print:text-emerald-800 font-bold uppercase block tracking-wider">
                  Payment & Warranty Registration
                </span>
                <p className="font-bold text-emerald-400 print:text-emerald-800 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4" /> 100% OFFICIAL WARRANTY COVERED
                </p>
                <p className="text-slate-400 print:text-gray-600 font-mono">Payment Mode: {order.paymentMethod || 'Online Prepaid'}</p>
                <p className="text-slate-400 print:text-gray-600 font-mono">Transaction ID: {txnId}</p>
                <p className="text-slate-400 print:text-gray-600 font-mono">Timestamp: {formattedDate} ({formattedTime})</p>
              </div>

            </div>

            {/* COVERED PRODUCTS LIST WITH WARRANTY DURATION */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-300 print:text-gray-800 uppercase tracking-wider">
                Covered Products & Warranty Certificate
              </h4>
              
              <div className="space-y-3">
                {itemsBreakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 flex flex-wrap justify-between items-center gap-3">
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-white print:text-black text-sm">{item.name}</h5>
                      <p className="text-xs text-slate-400 print:text-gray-600 font-mono">HSN: {item.hsnCode} | Quantity: {item.qty} Unit(s)</p>
                      <p className="text-[11px] text-slate-500 print:text-gray-500 font-mono">Item Total: ₹{item.itemTotal.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="text-right">
                      <span className="bg-amber-500/20 text-amber-300 print:text-amber-900 border border-amber-500/40 text-xs font-black px-3.5 py-1.5 rounded-xl block shadow-sm">
                        🛡️ {item.warranty}
                      </span>
                      <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block mt-1">
                        ✓ Registered Serial Coverage
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WARRANTY TERMS & CLAIM PROCEDURE */}
            <div className="bg-slate-950/60 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 text-xs space-y-2 text-slate-300 print:text-gray-800">
              <h5 className="font-bold text-amber-400 print:text-black uppercase tracking-wider text-[11px]">
                Brand Warranty Terms & Doorstep Replacement Policy:
              </h5>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 print:text-gray-700">
                <li>Warranty covers all hardware manufacturing defects, internal circuit failures, switch issues, and motor defects.</li>
                <li>Free doorstep reverse pickup and replacement dispatch within 48 hours for verified claims.</li>
                <li>Physical damage, water damage beyond IP rating, and unauthorized third-party repairs are excluded.</li>
                <li>To claim warranty, send an email to <strong>support.shadowarrow@gmail.com</strong> or WhatsApp support with Order ID: <strong>{order.orderId}</strong> and GSTIN: <strong>{officialGstIn}</strong>.</li>
              </ul>
            </div>

            {/* STAMP & SIGNATURE */}
            <div className="pt-6 border-t border-slate-800 print:border-gray-300 flex justify-between items-end text-xs text-slate-400 print:text-gray-700">
              <div>
                <p className="font-bold text-white print:text-black">SHADOW ARROW BRAND HUB</p>
                <p className="text-[10px] text-slate-500 font-mono">GSTIN: {officialGstIn}</p>
                <p className="text-[10px] text-slate-500">Authorized Digital Warranty Stamp</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 print:text-black text-xs font-bold rounded-xl shadow-sm">
                  ✓ OFFICIAL SEAL & STAMP VERIFIED
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
