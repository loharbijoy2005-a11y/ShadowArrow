'use client';

import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  onClose: () => void;
}

export default function SizeGuideModal({ onClose }: SizeGuideModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Ruler className="w-5 h-5 text-black" />
            <h3 className="font-bold text-lg text-slate-900">Apparel Size & Fit Guide</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-black rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-600">
          All SHADOW ARROW heavy tees and hoodies are engineered with an <strong>Oversized Drop-Shoulder Boxy Fit</strong>. If you prefer a standard fitted silhouette, we recommend sizing down one size.
        </p>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                <th className="p-3">Size</th>
                <th className="p-3">Chest (Inches)</th>
                <th className="p-3">Length (Inches)</th>
                <th className="p-3">Shoulder (Inches)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">S</td>
                <td className="p-3">42 - 44"</td>
                <td className="p-3">28.5"</td>
                <td className="p-3">21.5"</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">M</td>
                <td className="p-3">44 - 46"</td>
                <td className="p-3">29.5"</td>
                <td className="p-3">22.5"</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">L</td>
                <td className="p-3">46 - 48"</td>
                <td className="p-3">30.5"</td>
                <td className="p-3">23.5"</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">XL</td>
                <td className="p-3">48 - 50"</td>
                <td className="p-3">31.5"</td>
                <td className="p-3">24.5"</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">XXL</td>
                <td className="p-3">50 - 52"</td>
                <td className="p-3">32.5"</td>
                <td className="p-3">25.5"</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-gray-500 space-y-1">
          <p className="font-semibold text-slate-800">Care Instructions:</p>
          <p>Machine wash cold with inside-out garment. Line dry to prevent shrinkage of heavyweight French Terry cotton.</p>
        </div>
      </div>
    </div>
  );
}
