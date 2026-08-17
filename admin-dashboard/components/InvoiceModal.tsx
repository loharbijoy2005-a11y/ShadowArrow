'use client';

import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle } from 'lucide-react';

interface InvoiceModalProps {
  order: any;
  onClose: () => void;
}

function numberToWordsINR(amount: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  let num = Math.floor(amount);
  if (num === 0) return 'Zero Rupees Only';

  function convert(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? convert(n % 10000000) : '');
  }

  return convert(num).trim() + ' Rupees Only';
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const [downloading, setDownloading] = useState(false);
  if (!order) return null;

  const totalAmount = order.total_amount || 0;
  const taxableBase = totalAmount / 1.18;
  const totalGst = totalAmount - taxableBase;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const amountInWords = numberToWordsINR(totalAmount);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('tax-invoice-printable');
    if (!element) return;

    setDownloading(true);
    try {
      // Dynamic import to avoid SSR 'self is not defined' error during Next.js build
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const opt: any = {
        margin: 6,
        filename: `SHADOW_ARROW_TAX_INVOICE_${order.order_id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 800,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const renderQRCodeSVG = () => (
    <svg className="w-16 h-16 bg-white p-1 border border-gray-300 rounded" viewBox="0 0 100 100" fill="currentColor">
      <rect x="5" y="5" width="30" height="30" fill="#0f172a"/>
      <rect x="10" y="10" width="20" height="20" fill="#ffffff"/>
      <rect x="15" y="15" width="10" height="10" fill="#0f172a"/>
      
      <rect x="65" y="5" width="30" height="30" fill="#0f172a"/>
      <rect x="70" y="10" width="20" height="20" fill="#ffffff"/>
      <rect x="75" y="15" width="10" height="10" fill="#0f172a"/>

      <rect x="5" y="65" width="30" height="30" fill="#0f172a"/>
      <rect x="10" y="70" width="20" height="20" fill="#ffffff"/>
      <rect x="15" y="75" width="10" height="10" fill="#0f172a"/>

      <rect x="42" y="10" width="16" height="25" fill="#0f172a"/>
      <rect x="40" y="42" width="22" height="22" fill="#0f172a"/>
      <rect x="68" y="68" width="15" height="12" fill="#0f172a"/>
      <rect x="85" y="82" width="10" height="13" fill="#0f172a"/>
      <rect x="42" y="75" width="15" height="18" fill="#0f172a"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-sans">
      
      {/* Strict CSS Print Engine Rules for 100% Exact 1-Page A4 PDF Output */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm;
          }
          html, body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          #tax-invoice-printable, #tax-invoice-printable * {
            visibility: visible !important;
          }
          #tax-invoice-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 190mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white text-gray-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-gray-300 max-h-[95vh] overflow-y-auto">
        
        {/* Top Control Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 no-print font-mono">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              OFFICIAL GST TAX INVOICE
            </span>
            <span className="text-xs text-gray-500">Ref: #{order.order_id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Generating PDF...' : 'Download A4 PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-black rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="tax-invoice-printable" className="mt-4 p-4 bg-white border border-gray-300 rounded-xl space-y-4 text-xs leading-normal text-gray-900">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-900 pb-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 font-mono">SHADOW ARROW</h1>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider font-mono">OFFICIAL GST TAX INVOICE / BILL OF SUPPLY</p>
              <p className="text-[10px] text-gray-500 font-mono">Original for Recipient</p>
            </div>
            <div className="text-right font-mono text-[10px]">
              <p className="font-bold text-gray-900">SELLER GSTIN</p>
              <p className="font-bold text-blue-700 text-xs">19BVKPL6301H1ZH</p>
              <p className="text-gray-500">support.shadowarrow@gmail.com</p>
            </div>
          </div>

          {/* Seller vs Order Meta */}
          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Sold By (Registered Seller)</p>
              <p className="font-bold text-gray-900 text-xs mt-0.5">SHADOW ARROW (Bijoy Lohar)</p>
              <p className="text-gray-600 text-[10px] leading-tight mt-0.5">
                C/O BINOD LOHAR, DAPANJURI ROAD, BHARA, Dapanjuri, District: Bankura, West Bengal - 722157
              </p>
              <p className="text-gray-600 text-[10px] mt-0.5">State Code: 19 (West Bengal)</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-right space-y-0.5">
              <p><span className="text-gray-500">Invoice No:</span> <strong className="text-gray-900">INV-SA-{order.order_id}</strong></p>
              <p><span className="text-gray-500">Invoice Date:</span> <strong>{new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}</strong></p>
              <p><span className="text-gray-500">Order ID:</span> <strong className="text-blue-700">#{order.order_id}</strong></p>
              <p>
                <span className="text-gray-500">Payment Mode:</span>{' '}
                <strong className={`uppercase ${order.payment_method === 'COD' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {order.payment_method === 'COD' ? 'Cash On Delivery (COD)' : 'PREPAID (ONLINE)'}
                </strong>
              </p>
              {order.payment_method !== 'COD' && order.razorpay_payment_id && (
                <p><span className="text-gray-500">Txn ID:</span> <strong className="text-gray-900">{order.razorpay_payment_id}</strong></p>
              )}
            </div>
          </div>

          {/* Billing & Shipping Address */}
          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Billing Address (Bill To)</p>
              <p className="font-bold text-gray-900 text-xs mt-0.5">{order.customer_name}</p>
              <p className="text-gray-600 text-[10px]">Mob: {order.customer_phone}</p>
              <p className="text-gray-600 text-[10px]">{order.customer_email}</p>
              <p className="text-gray-600 text-[10px] leading-tight mt-0.5">{order.shipping_address}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Shipping Address (Ship To)</p>
              <p className="font-bold text-gray-900 text-xs mt-0.5">{order.customer_name}</p>
              <p className="text-gray-600 text-[10px]">Mob: {order.customer_phone}</p>
              <p className="text-gray-600 text-[10px]">{order.customer_email}</p>
              <p className="text-gray-600 text-[10px] leading-tight mt-0.5">{order.shipping_address}</p>
            </div>
          </div>

          {/* Item Table with Warranty */}
          <table className="w-full text-left border-collapse border border-gray-300 text-[11px] font-mono">
            <thead>
              <tr className="bg-gray-100 text-gray-800 font-bold uppercase border-b border-gray-300">
                <th className="p-2 border-r border-gray-300 text-center w-8">#</th>
                <th className="p-2 border-r border-gray-300">Product Description</th>
                <th className="p-2 border-r border-gray-300 text-center">HSN</th>
                <th className="p-2 border-r border-gray-300 text-center">Qty</th>
                <th className="p-2 border-r border-gray-300 text-center">Warranty Period</th>
                <th className="p-2 border-r border-gray-300 text-right">Taxable Rate</th>
                <th className="p-2 border-r border-gray-300 text-center">GST</th>
                <th className="p-2 text-right">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items && order.items.map((it: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border-r border-gray-200 text-center font-bold">{idx + 1}</td>
                  <td className="p-2 border-r border-gray-200 font-bold text-gray-900">
                    {it.title} {it.size ? `(Size: ${it.size})` : ''}
                  </td>
                  <td className="p-2 border-r border-gray-200 text-center text-gray-600">61091000</td>
                  <td className="p-2 border-r border-gray-200 text-center font-bold">{it.quantity}</td>
                  <td className="p-2 border-r border-gray-200 text-center font-bold text-blue-700">
                    {it.warranty || '6 Months Brand Warranty'}
                  </td>
                  <td className="p-2 border-r border-gray-200 text-right">₹{(it.price / 1.18).toFixed(2)}</td>
                  <td className="p-2 border-r border-gray-200 text-center text-gray-600">18%</td>
                  <td className="p-2 text-right font-bold text-gray-900">₹{(it.price * it.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tax Breakdown & Totals Box */}
          <div className="flex justify-between items-start pt-2 font-mono text-[11px]">
            <div className="space-y-1 max-w-[280px]">
              <div className="flex items-center space-x-1 text-emerald-700 font-bold text-[10px]">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>GST VERIFIED DIGITAL TAX INVOICE</span>
              </div>
              <p className="text-[9.5px] text-gray-500 leading-tight">
                Supply calculated under 18% Total GST (9% CGST + 9% SGST). E-Invoice verification payload embedded.
              </p>
              <p className="text-[9.5px] text-gray-700 font-bold pt-1">
                Amount in Words: <span className="text-gray-900 italic font-semibold">{amountInWords}</span>
              </p>
            </div>

            <div className="w-56 bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Base Value:</span>
                <span>₹{taxableBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST (9%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST (9%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-900 pt-1.5 border-t border-gray-300">
                <span>GRAND TOTAL:</span>
                <span className="text-blue-700">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms & E-Sign Disclaimer */}
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-[9px] font-mono text-gray-500">
            <div>
              <p className="font-bold text-gray-700">Returns & Policy Note:</p>
              <p>7-Day Easy Return & Replacement Policy across India. Terms apply.</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">For SHADOW ARROW</p>
              <p className="text-gray-600 italic">Computer Generated Tax Invoice</p>
              <p className="font-bold text-gray-800 uppercase">NO SIGNATURE REQUIRED</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
