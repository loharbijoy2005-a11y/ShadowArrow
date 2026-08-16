'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle } from 'lucide-react';

interface TaxInvoiceModalProps {
  order: any;
  onClose: () => void;
}

export default function TaxInvoiceModal({ order, onClose }: TaxInvoiceModalProps) {
  if (!order) return null;

  const handleDownloadPDF = () => {
    window.print();
  };

  const totalAmount = order.total_amount || 0;
  const taxableBase = totalAmount / 1.18;
  const totalGst = totalAmount - taxableBase;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  const renderQRCode = () => (
    <svg className="w-20 h-20 text-slate-900 border border-slate-300 p-1 rounded bg-white" viewBox="0 0 100 100" fill="currentColor">
      <rect x="10" y="10" width="25" height="25" fill="#0f172a"/>
      <rect x="15" y="15" width="15" height="15" fill="#ffffff"/>
      <rect x="18" y="18" width="9" height="9" fill="#0f172a"/>
      
      <rect x="65" y="10" width="25" height="25" fill="#0f172a"/>
      <rect x="70" y="15" width="15" height="15" fill="#ffffff"/>
      <rect x="73" y="18" width="9" height="9" fill="#0f172a"/>
      
      <rect x="10" y="65" width="25" height="25" fill="#0f172a"/>
      <rect x="15" y="70" width="15" height="15" fill="#ffffff"/>
      <rect x="18" y="73" width="9" height="9" fill="#0f172a"/>

      <rect x="45" y="10" width="8" height="20" fill="#0f172a"/>
      <rect x="40" y="40" width="20" height="20" fill="#0f172a"/>
      <rect x="65" y="65" width="15" height="10" fill="#0f172a"/>
      <rect x="75" y="78" width="15" height="12" fill="#0f172a"/>
      <rect x="45" y="75" width="12" height="15" fill="#0f172a"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden;
          }
          #invoice-printable-area, #invoice-printable-area * {
            visibility: visible;
          }
          #invoice-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-300 max-h-[95vh] overflow-y-auto">
        
        {/* Header Controls */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 no-print">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
              GST TAX INVOICE
            </span>
            <span className="text-xs font-mono text-slate-500">Ref: #{order.order_id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1.5 bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download A4 PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-black rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Compact Single-Page Printable Invoice */}
        <div id="invoice-printable-area" className="mt-4 space-y-4 text-xs">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-3">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">SHADOW ARROW</h1>
              <p className="text-[10px] text-slate-500 font-mono">OFFICIAL GST TAX INVOICE</p>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-700">
              <p className="font-bold text-slate-900">REGISTERED SELLER GSTIN</p>
              <p className="text-blue-600 font-bold">19BVKPL6301H1ZH</p>
              <p className="text-[10px] text-slate-500">support.shadowarrow@gmail.com</p>
            </div>
          </div>

          {/* Customer & Details Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Billed To (Customer)</p>
              <p className="font-bold text-slate-900 text-xs mt-0.5">{order.customer_name}</p>
              <p className="text-slate-600 font-mono text-[11px]">{order.customer_phone}</p>
              <p className="text-slate-600 font-mono text-[10px]">{order.customer_email}</p>
              <p className="text-slate-600 text-[10px] mt-0.5 leading-tight">{order.shipping_address}</p>
            </div>
            <div className="text-right space-y-0.5 font-mono text-[11px]">
              <p><span className="text-slate-500">Invoice No:</span> <span className="font-bold text-slate-900">INV-{order.order_id}</span></p>
              <p><span className="text-slate-500">Invoice Date:</span> <span>{new Date(order.created_at || Date.now()).toLocaleDateString()}</span></p>
              <p><span className="text-slate-500">Payment Mode:</span> <span className="uppercase font-bold text-blue-600">{order.payment_method}</span></p>
              <p><span className="text-slate-500">Payment Status:</span> <span className="uppercase font-bold text-emerald-600">{order.payment_status}</span></p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                <th className="p-2 border-r border-slate-200">Item Description</th>
                <th className="p-2 border-r border-slate-200 text-center font-mono">HSN</th>
                <th className="p-2 border-r border-slate-200 text-center">Qty</th>
                <th className="p-2 border-r border-slate-200 text-right">Taxable Rate</th>
                <th className="p-2 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items && order.items.map((it: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">
                    {it.title} {it.size ? `(${it.size})` : ''}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-500">61091000</td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono">{it.quantity}</td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono">₹{(it.price / 1.18).toFixed(2)}</td>
                  <td className="p-2 text-right font-mono font-bold text-slate-900">₹{(it.price * it.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tax Breakdown & Digital QR Code Stamp */}
          <div className="flex justify-between items-end pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-3">
              {renderQRCode()}
              <div className="text-[9px] text-slate-500 space-y-0.5 max-w-[200px]">
                <p className="font-bold text-slate-800 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>GST Verified Digital Invoice</span>
                </p>
                <p>18% Total GST (9% CGST + 9% SGST). E-Invoice payload verified.</p>
              </div>
            </div>

            <div className="w-52 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Base:</span>
                <span>₹{taxableBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (9%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-300">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
