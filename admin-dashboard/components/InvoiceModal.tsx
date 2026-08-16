'use client';

import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';

interface InvoiceModalProps {
  order: any;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.total_amount ? order.total_amount / 1.18 : 0;
  const totalGst = order.total_amount - subtotal;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  const renderQRCode = () => (
    <svg className="w-16 h-16 text-slate-900 border border-slate-300 p-1 rounded bg-white" viewBox="0 0 100 100" fill="currentColor">
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
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden;
          }
          #tax-invoice-printable, #tax-invoice-printable * {
            visibility: visible;
          }
          #tax-invoice-printable {
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

      <div className="bg-white text-gray-900 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 relative">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 no-print">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">GST TAX INVOICE</span>
            <span className="text-xs text-gray-500 font-mono">Ref: #{order.order_id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Invoice</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="tax-invoice-printable" className="mt-4 space-y-4 text-xs">
          <div className="flex justify-between items-start border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-xl font-black text-gray-900">TAX INVOICE</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">ORIGINAL FOR RECIPIENT</p>
            </div>
            <div className="text-right text-[11px] text-gray-600 font-mono">
              <p className="font-bold text-gray-800">SELLER GSTIN</p>
              <p className="font-mono text-blue-700 font-bold">19BVKPL6301H1ZH</p>
              <p className="text-[10px]">support.shadowarrow@gmail.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-[11px]">
            <div>
              <p className="text-[9px] font-bold text-gray-500 uppercase font-mono">Billed To (Customer)</p>
              <p className="font-bold text-gray-900 text-xs mt-0.5">{order.customer_name}</p>
              <p className="text-gray-600 font-mono">{order.customer_phone}</p>
              <p className="text-gray-600 font-mono text-[10px]">{order.customer_email}</p>
              <p className="text-gray-600 text-[10px] mt-0.5 whitespace-pre-line">{order.shipping_address}</p>
            </div>
            <div className="text-right space-y-0.5 font-mono">
              <p><span className="text-gray-500">Invoice No:</span> <span className="font-bold">INV-{order.order_id}</span></p>
              <p><span className="text-gray-500">Invoice Date:</span> <span>{new Date(order.created_at || Date.now()).toLocaleDateString()}</span></p>
              <p><span className="text-gray-500">Payment Mode:</span> <span className="uppercase font-bold text-blue-600">{order.payment_method}</span></p>
              <p><span className="text-gray-500">Payment Status:</span> <span className="uppercase font-bold text-green-600">{order.payment_status}</span></p>
            </div>
          </div>

          <table className="w-full text-left border-collapse border border-gray-200 text-[11px]">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-bold uppercase border-b border-gray-200">
                <th className="p-2 border-r border-gray-200">Item Description</th>
                <th className="p-2 border-r border-gray-200 text-center font-mono">HSN</th>
                <th className="p-2 border-r border-gray-200 text-center">Qty</th>
                <th className="p-2 border-r border-gray-200 text-right">Taxable Rate</th>
                <th className="p-2 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items && order.items.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border-r border-gray-200 font-medium">
                    {item.title} {item.size ? `(${item.size})` : ''}
                  </td>
                  <td className="p-2 border-r border-gray-200 text-center font-mono">61091000</td>
                  <td className="p-2 border-r border-gray-200 text-center font-mono">{item.quantity}</td>
                  <td className="p-2 border-r border-gray-200 text-right font-mono">₹{(item.price / 1.18).toFixed(2)}</td>
                  <td className="p-2 text-right font-mono font-bold">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-end pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {renderQRCode()}
              <div className="text-[9px] text-gray-500 space-y-0.5 max-w-[180px]">
                <p className="font-bold text-gray-800 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>GST Verified Invoice</span>
                </p>
                <p>Supply calculated under 18% GST (9% CGST + 9% SGST).</p>
              </div>
            </div>

            <div className="w-52 space-y-1 text-[11px] font-mono">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Base:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST (9%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST (9%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-900 pt-1 border-t border-gray-300">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{order.total_amount ? order.total_amount.toFixed(2) : '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
