'use client';

import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';

interface ThermalLabelModalProps {
  orders: any[];
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

export default function ThermalLabelModal({ orders, onClose }: ThermalLabelModalProps) {
  if (!orders || orders.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const renderQRCodeSVG = () => (
    <svg className="w-16 h-16 bg-white p-1 border border-black" viewBox="0 0 100 100" fill="currentColor">
      <rect x="5" y="5" width="30" height="30" fill="#000000"/>
      <rect x="10" y="10" width="20" height="20" fill="#ffffff"/>
      <rect x="15" y="15" width="10" height="10" fill="#000000"/>
      
      <rect x="65" y="5" width="30" height="30" fill="#000000"/>
      <rect x="70" y="10" width="20" height="20" fill="#ffffff"/>
      <rect x="75" y="15" width="10" height="10" fill="#000000"/>

      <rect x="5" y="65" width="30" height="30" fill="#000000"/>
      <rect x="10" y="70" width="20" height="20" fill="#ffffff"/>
      <rect x="15" y="75" width="10" height="10" fill="#000000"/>

      <rect x="42" y="10" width="16" height="25" fill="#000000"/>
      <rect x="40" y="42" width="22" height="22" fill="#000000"/>
      <rect x="68" y="68" width="15" height="12" fill="#000000"/>
      <rect x="85" y="82" width="10" height="13" fill="#000000"/>
      <rect x="42" y="75" width="15" height="18" fill="#000000"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-mono animate-origin-expand">
      
      {/* Strict Multi-Page 4x6 Thermal CSS Overrides */}
      <style jsx global>{`
        @media print {
          @page {
            size: 100mm 150mm;
            margin: 2mm;
          }
          body * {
            visibility: hidden;
          }
          #bulk-thermal-printable-batch, #bulk-thermal-printable-batch * {
            visibility: visible;
          }
          #bulk-thermal-printable-batch {
            position: absolute;
            left: 0;
            top: 0;
            width: 100mm;
            padding: 0;
            margin: 0;
            background: white !important;
            color: black !important;
          }
          .thermal-page-break {
            page-break-after: always;
            break-after: page;
            height: 146mm;
            max-height: 146mm;
            overflow: hidden;
            box-sizing: border-box;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white text-black rounded-2xl max-w-xl w-full p-4 shadow-2xl relative border-2 border-black max-h-[95vh] overflow-y-auto">
        
        {/* Top Header Control */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-black no-print">
          <div className="flex items-center space-x-2">
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
              BULK THERMAL BATCH ({orders.length} LABELS)
            </span>
            <span className="text-xs text-gray-600 font-bold">4x6 Direct Thermal (100x150mm)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-neutral-800 transition"
              title="Print All Thermal Labels"
            >
              <Printer className="w-4 h-4" />
              <span>Print Batch ({orders.length})</span>
            </button>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Batch Area */}
        <div id="bulk-thermal-printable-batch" className="mt-2 space-y-6">
          {orders.map((ord: any, index: number) => {
            const totalAmount = ord.total_amount || 0;
            const taxableBase = totalAmount / 1.18;
            const totalGst = totalAmount - taxableBase;
            const cgst = totalGst / 2;
            const sgst = totalGst / 2;
            const amountInWords = numberToWordsINR(totalAmount);

            return (
              <div
                key={ord.order_id || index}
                className="thermal-page-break p-2 border-2 border-black rounded-xl bg-white text-black space-y-2 text-[10px] leading-tight font-mono mb-4"
              >
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-2 space-y-0.5">
                  <h1 className="text-xl font-black tracking-tighter uppercase">SHADOW ARROW</h1>
                  <p className="font-bold text-[9px] uppercase">PREMIUM STREETWEAR APPAREL</p>
                  <p className="text-[9px]">GSTIN: <strong>19BVKPL6301H1ZH</strong></p>
                  <p className="text-[8px]">Address: C/O BINOD LOHAR, DAPANJURI ROAD, BHARA, Dapanjuri, Bankura, WB - 722157</p>
                  <p className="text-[8px]">Support: support.shadowarrow@gmail.com</p>
                </div>

                {/* Shipping Badge & Order Info */}
                <div className="border-b-2 border-black pb-1 flex justify-between items-center font-bold">
                  <div className="text-left">
                    <p className="text-[8px] uppercase text-gray-600">ORDER NO:</p>
                    <p className="text-sm font-black">#{ord.order_id}</p>
                  </div>
                  <div className="border-2 border-black px-3 py-1 bg-black text-white text-xs font-black uppercase">
                    {ord.payment_method === 'COD' ? 'CASH ON DELIVERY (COD)' : 'PREPAID ONLINE'}
                  </div>
                </div>

                {/* Customer Address */}
                <div className="border-b-2 border-black pb-2 space-y-0.5">
                  <p className="font-bold text-[9px] uppercase text-gray-800">SHIP TO / CUSTOMER ADDRESS:</p>
                  <p className="font-bold text-xs">{ord.customer_name}</p>
                  <p className="font-bold">Mob: {ord.customer_phone}</p>
                  <p className="text-[9px]">{ord.customer_email}</p>
                  <p className="text-[9.5px] font-semibold whitespace-pre-line border-l-2 border-black pl-1.5 mt-1">
                    {ord.shipping_address}
                  </p>
                </div>

                {/* Invoice Meta */}
                <div className="grid grid-cols-2 gap-1 border-b-2 border-black pb-1 text-[9px]">
                  <div>
                    <p>Invoice No: <strong>INV-{ord.order_id}</strong></p>
                    <p>Invoice Date: <strong>{new Date(ord.created_at || Date.now()).toLocaleDateString('en-IN')}</strong></p>
                  </div>
                  <div className="text-right">
                    <p>Pay Status: <strong className="uppercase">{ord.payment_status}</strong></p>
                    {ord.razorpay_payment_id && (
                      <p>Txn ID: <strong className="text-[8.5px]">{ord.razorpay_payment_id}</strong></p>
                    )}
                  </div>
                </div>

                {/* Item Table */}
                <table className="w-full text-left border-collapse border border-black text-[9px]">
                  <thead>
                    <tr className="bg-black text-white font-bold uppercase border-b border-black">
                      <th className="p-1 border-r border-white">Item</th>
                      <th className="p-1 border-r border-white text-center">HSN</th>
                      <th className="p-1 border-r border-white text-center">Qty</th>
                      <th className="p-1 text-right">Amt (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {ord.items && ord.items.map((it: any, iIdx: number) => (
                      <tr key={iIdx}>
                        <td className="p-1 border-r border-black font-bold">
                          {it.title} {it.size ? `(${it.size})` : ''}
                        </td>
                        <td className="p-1 border-r border-black text-center">61091000</td>
                        <td className="p-1 border-r border-black text-center font-bold">{it.quantity}</td>
                        <td className="p-1 text-right font-bold">₹{(it.price * it.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Tax Breakdown & Totals */}
                <div className="border-b-2 border-black pb-1 text-[9px] space-y-0.5 font-bold">
                  <div className="flex justify-between">
                    <span>Taxable Base:</span>
                    <span>₹{taxableBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST (9%) + SGST (9%):</span>
                    <span>₹{cgst.toFixed(2)} + ₹{sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-black font-black">
                    <span>GRAND TOTAL:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-[8px] font-normal italic pt-0.5">Amount in words: {amountInWords}</p>
                </div>

                {/* Dynamic QR Code */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    {renderQRCodeSVG()}
                    <div className="text-[7.5px] leading-tight max-w-[170px]">
                      <p className="font-bold uppercase">E-INVOICE VERIFIED</p>
                      <p>Scannable Invoice Data. GST Law Compliant Dispatch Document.</p>
                    </div>
                  </div>

                  <div className="text-right text-[7.5px] space-y-0.5">
                    <p className="font-bold">7-Day Easy Return Policy</p>
                    <p>Computer Generated Invoice</p>
                    <p className="font-black">NO SIGNATURE REQUIRED</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
