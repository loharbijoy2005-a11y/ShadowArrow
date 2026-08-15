import React, { useState } from 'react';
import { X, Printer, Download, ShieldCheck, Truck, FileText, Award, CheckCircle2 } from 'lucide-react';
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

  const invoiceDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Calculate Itemized GST & Taxable Values
  const itemsBreakdown = (order.items || []).map((item: any) => {
    const price = item.price || item.product?.price || 0;
    const qty = item.quantity || 1;
    const gstRate = item.gstRate || item.product?.gstRate || 18;
    const hsnCode = item.hsnCode || item.product?.hsnCode || '8471';
    const warranty = item.product?.warranty || item.warranty || '1 Year Official Warranty';

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 print:p-0">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md print:hidden" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white my-8 print:my-0 print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none">
        
        {/* ACTION & TAB BAR (Hidden in Print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('invoice')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'invoice'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>📄 GST Tax Invoice</span>
            </button>

            <button
              onClick={() => setActiveTab('warranty')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'warranty'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>📜 Warranty Certificate</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download A4 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: GST TAX INVOICE */}
        {activeTab === 'invoice' && (
          <div className="p-6 md:p-8 space-y-6 print:p-6 print:text-black">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 print:border-black/20 pb-6 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-2xl tracking-wider text-amber-400 print:text-amber-600">SHADOW ARROW</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 print:text-black border border-amber-500/40 px-2 py-0.5 rounded font-black uppercase">PRIME MARKETPLACE</span>
                </div>
                <p className="text-xs text-slate-400 print:text-gray-600 mt-1">Official Legal GST Tax Invoice & Order Receipt</p>
                <p className="text-[11px] text-slate-400 print:text-gray-600 font-mono mt-0.5">
                  Seller GSTIN: <strong className="text-amber-400 print:text-black">19AABCS1429B1Z0</strong> | Reg. E-Commerce Vendor
                </p>
              </div>

              <div className="text-left md:text-right space-y-1">
                <h3 className="font-black text-lg text-white print:text-black uppercase tracking-tight">TAX INVOICE</h3>
                <p className="text-xs text-amber-400 print:text-amber-700 font-mono font-bold">Invoice No: INV-{order.orderId}</p>
                <p className="text-xs text-slate-400 print:text-gray-600">Invoice Date: {invoiceDate}</p>
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
                <p className="text-slate-300 print:text-gray-700">Warehouse 722157 (Central Dispatches)</p>
                <p className="text-slate-300 print:text-gray-700">Bankura, West Bengal - 722157</p>
                <p className="text-slate-400 print:text-gray-600 font-mono">GSTIN: 19AABCS1429B1Z0</p>
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

            {/* ITEMIZED HSN & GST TABLE */}
            <div>
              <h4 className="font-bold text-xs text-slate-300 print:text-gray-800 uppercase tracking-wider mb-2">Itemized HSN & GST Tax Breakdown</h4>
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

            {/* TOTALS & PAYMENT SUMMARY */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-2">
              <div className="space-y-1 text-xs text-slate-400 print:text-gray-600">
                <p className="font-bold text-slate-300 print:text-black">Payment & Transaction Info:</p>
                <p>Payment Method: <strong className="text-amber-400 print:text-black font-mono">{order.paymentMethod}</strong></p>
                <p>Transaction ID: <strong className="font-mono text-emerald-400 print:text-black">{order.razorpayPaymentId || 'Verified'}</strong></p>
                <p>Status: <span className="bg-emerald-500/20 text-emerald-400 print:text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">GST COMPLIANT PAID</span></p>
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
                  <span>Grand Total (Incl. GST):</span>
                  <span className="font-mono text-base">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="pt-4 border-t border-slate-800 print:border-gray-300 text-center text-[10px] text-slate-500 print:text-gray-600 space-y-1">
              <p className="font-bold text-slate-400 print:text-black">Thank you for shopping with SHADOW ARROW PRIME MARKETPLACE!</p>
              <p>Computer generated GST invoice. Contact 24/7 Support at <strong>support.shadowarrow@gmail.com</strong></p>
            </div>

          </div>
        )}

        {/* TAB 2: OFFICIAL WARRANTY CERTIFICATE */}
        {activeTab === 'warranty' && (
          <div className="p-6 md:p-8 space-y-6 print:p-6 print:text-black">
            
            {/* WARRANTY HEADER */}
            <div className="text-center border-b border-slate-800 print:border-black/20 pb-6 space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8 text-amber-400 print:text-amber-700" />
              </div>
              <h2 className="font-black text-2xl text-amber-400 print:text-amber-800 uppercase tracking-tight">
                OFFICIAL BRAND WARRANTY CERTIFICATE
              </h2>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Issued by Shadow Arrow Authorized Brand Service Center
              </p>
              <p className="text-xs text-slate-500 print:text-gray-500 font-mono">
                Order Ref: <strong className="text-white print:text-black">{order.orderId}</strong> | Invoice Date: {invoiceDate}
              </p>
            </div>

            {/* CUSTOMER & WARRANTY CARD DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Customer Information</span>
                <p className="font-bold text-white print:text-black">{order.name}</p>
                <p className="text-slate-400 print:text-gray-600 font-mono">Phone: +91 {order.phone}</p>
                <p className="text-slate-400 print:text-gray-600">{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Warranty Status</span>
                <p className="font-bold text-emerald-400 print:text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 100% COVERED & REGISTERED
                </p>
                <p className="text-slate-400 print:text-gray-600 font-mono">Seller GSTIN: 19AABCS1429B1Z0</p>
              </div>
            </div>

            {/* COVERED PRODUCTS LIST WITH WARRANTY DURATION */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-300 print:text-gray-800 uppercase tracking-wider">Covered Products & Warranty Periods</h4>
              
              <div className="space-y-3">
                {itemsBreakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <h5 className="font-bold text-white print:text-black text-sm">{item.name}</h5>
                      <p className="text-xs text-slate-400 print:text-gray-600 font-mono">HSN Code: {item.hsnCode} | Qty: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-amber-500/20 text-amber-300 print:text-amber-900 border border-amber-500/40 text-xs font-black px-3 py-1 rounded-xl block">
                        🛡️ {item.warranty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WARRANTY TERMS */}
            <div className="bg-slate-950/60 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 text-xs space-y-2 text-slate-300 print:text-gray-800">
              <h5 className="font-bold text-amber-400 print:text-black uppercase">Warranty Terms & Replacement Policy:</h5>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 print:text-gray-700">
                <li>Warranty covers hardware manufacturing defects, switch failures, and internal component malfunctions.</li>
                <li>Free doorstep pickup and replacement dispatch within 48 hours for valid claims.</li>
                <li>Physical damage, water submersion beyond rating, and unauthorized disassembly are excluded.</li>
                <li>To register a claim, email <strong>support.shadowarrow@gmail.com</strong> with Order Ref ID <strong>{order.orderId}</strong>.</li>
              </ul>
            </div>

            {/* STAMP & SIGNATURE */}
            <div className="pt-6 border-t border-slate-800 print:border-gray-300 flex justify-between items-end text-xs text-slate-400 print:text-gray-700">
              <div>
                <p className="font-bold text-white print:text-black">SHADOW ARROW BRAND HUB</p>
                <p className="text-[10px] text-slate-500">Authorized Warranty Stamp</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 print:text-black text-xs font-bold rounded-xl">
                  ✓ AUTHORIZED OFFICIAL WARRANTY
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
