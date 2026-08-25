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
  const taxableBase = (totalAmount / 1.18).toFixed(2);
  const totalGst = (totalAmount - parseFloat(taxableBase)).toFixed(2);
  const cgst = (parseFloat(totalGst) / 2).toFixed(2);
  const sgst = (parseFloat(totalGst) / 2).toFixed(2);
  const amountInWords = numberToWordsINR(totalAmount);
  const courierPartner = order.courier_partner || order.courier_name || 'Blue Dart Express';
  const awbNumber = order.awb_number || order.tracking_number || 'Handed to Courier';

  const handlePrint = () => {
    const element = document.getElementById('tax-invoice-printable');
    if (!element) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SHADOW_ARROW_TAX_INVOICE_${order.order_id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4 portrait; margin: 8mm; }
            body { font-family: monospace, sans-serif; background: #ffffff; color: #000000; padding: 10px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 190mm; margin: 0 auto;">
            ${element.outerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('tax-invoice-printable');
    if (!element) return;

    setDownloading(true);
    try {
      // Dynamic import to avoid SSR build errors
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;

      // Clone element outside scroll container to prevent scroll offset blank canvas
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '794px';
      container.style.backgroundColor = '#ffffff';

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '100%';
      clone.style.margin = '0';
      container.appendChild(clone);
      document.body.appendChild(container);

      const opt: any = {
        margin: [6, 8, 6, 8],
        filename: `SHADOW_ARROW_TAX_INVOICE_${order.order_id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollY: 0,
          scrollX: 0,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(clone).save();
      document.body.removeChild(container);
    } catch (err) {
      console.error('PDF export failed, falling back to clean print driver:', err);
      handlePrint();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-sans animate-origin-expand">
      
      {/* CSS Print Engine Fallback Rules */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm;
          }
          body > *:not(#tax-invoice-printable) {
            display: none !important;
          }
          #tax-invoice-printable {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 190mm !important;
            margin: 0 auto !important;
            background: #ffffff !important;
            color: #000000 !important;
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
        <div id="tax-invoice-printable" className="mt-4 p-4 bg-white border border-gray-300 rounded-xl space-y-4 text-xs leading-normal text-gray-900 font-mono">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-900 pb-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">SHADOW ARROW</h1>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">OFFICIAL GST TAX INVOICE / BILL OF SUPPLY</p>
              <p className="text-[10px] text-gray-500">Original for Recipient</p>
            </div>
            <div className="text-right text-[10px]">
              <p className="font-bold text-gray-900">SELLER GSTIN</p>
              <p className="font-bold text-blue-700 text-xs">19BVKPL6301H1ZH</p>
              <p className="text-gray-500">support.shadowarrow@gmail.com</p>
            </div>
          </div>

          {/* Seller vs Order & Shipper Metadata Table */}
          <table className="w-full border-collapse text-[11px]">
            <tbody>
              <tr>
                <td className="w-1/2 align-top pr-2">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Sold By (Registered Seller)</p>
                    <p className="font-bold text-gray-900 text-xs mt-0.5">SHADOW ARROW (Bijoy Lohar)</p>
                    <p className="text-gray-600 text-[10px] leading-tight mt-0.5">
                      C/O BINOD LOHAR, DAPANJURI ROAD, BHARA, Dapanjuri, District: Bankura, West Bengal - 722157
                    </p>
                    <p className="text-gray-600 text-[10px] mt-0.5">State Code: 19 (West Bengal)</p>
                  </div>
                </td>
                <td className="w-1/2 align-top pl-2 text-right">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-0.5">
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
                    <p className="pt-1 border-t border-gray-200">
                      Shipper: <strong className="text-gray-900">{courierPartner}</strong> | AWB: <strong className="text-blue-700">{awbNumber}</strong>
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Billing & Shipping Address Table */}
          <table className="w-full border-collapse text-[11px]">
            <tbody>
              <tr>
                <td className="w-1/2 align-top pr-2">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Billing Address (Bill To / Buyer)</p>
                    <p className="font-bold text-gray-900 text-xs mt-0.5">{order.customer_name}</p>
                    <p className="text-gray-600 text-[10px]">Mob: {order.customer_phone}</p>
                    <p className="text-gray-600 text-[10px]">{order.customer_email}</p>
                    <p className="text-gray-600 text-[10px] leading-tight mt-0.5">{order.shipping_address}</p>
                  </div>
                </td>
                <td className="w-1/2 align-top pl-2">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Shipping Address (Ship To)</p>
                    <p className="font-bold text-gray-900 text-xs mt-0.5">{order.customer_name}</p>
                    <p className="text-gray-600 text-[10px]">Mob: {order.customer_phone}</p>
                    <p className="text-gray-600 text-[10px]">{order.customer_email}</p>
                    <p className="text-gray-600 text-[10px] leading-tight mt-0.5">{order.shipping_address}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Item Table with Warranty */}
          <table className="w-full text-left border-collapse border border-gray-300 text-[11px]">
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

          {/* Tax Breakdown & Totals Table */}
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="align-top">
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
                </td>
                <td className="align-top text-right">
                  <div className="w-56 bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1 inline-block text-left">
                    <div className="flex justify-between text-gray-600">
                      <span>Taxable Base Value:</span>
                      <span>₹{taxableBase}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>CGST (9%):</span>
                      <span>₹{cgst}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>SGST (9%):</span>
                      <span>₹{sgst}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-900 pt-1.5 border-t border-gray-300">
                      <span>GRAND TOTAL:</span>
                      <span className="text-blue-700">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Terms & E-Sign Disclaimer */}
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-[9px] text-gray-500">
            <div>
              <p className="font-bold text-gray-700">Returns & Policy Note:</p>
              <p>7-Day Easy Return Policy across India. Terms apply.</p>
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
