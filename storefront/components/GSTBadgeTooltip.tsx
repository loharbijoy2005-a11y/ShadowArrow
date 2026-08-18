'use client';

import React, { useState } from 'react';
import { ShieldCheck, MapPin, Building2, UserCheck, Calendar, CheckCircle2 } from 'lucide-react';

interface GSTBadgeTooltipProps {
  gstin?: string;
  className?: string;
  children?: React.ReactNode;
  enableHover?: boolean;
}

export default function GSTBadgeTooltip({
  gstin = '19BVKPL6301H1ZH',
  className = '',
  children,
  enableHover = true,
}: GSTBadgeTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => enableHover && setIsHovered(true)}
      onMouseLeave={() => enableHover && setIsHovered(false)}
    >
      {/* Trigger element */}
      <div className="cursor-pointer">
        {children ? (
          children
        ) : (
          <span className={`inline-flex items-center space-x-1.5 font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors font-bold underline decoration-blue-500/40 underline-offset-4 ${className}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>GSTIN: {gstin}</span>
          </span>
        )}
      </div>

      {/* Hover Popup Card (Only opens when enabled) */}
      {isHovered && enableHover && (
        <div className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-3 w-72 sm:w-96 z-50 bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl p-4 shadow-2xl text-slate-100 font-sans text-xs animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          
          {/* Arrow Tail */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-slate-900" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white font-mono uppercase text-[11px] tracking-wider">Government GST Certificate</h4>
                <p className="text-[10px] text-slate-400">Form GST REG-06 • Active Regular</p>
              </div>
            </div>
            <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-mono text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>VERIFIED</span>
            </span>
          </div>

          {/* GST Details Grid */}
          <div className="space-y-2.5 font-mono text-[11px]">
            
            <div className="flex justify-between items-center bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 uppercase text-[10px]">GSTIN Number</span>
              <span className="font-bold text-blue-400 tracking-wider text-xs">{gstin}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 space-y-0.5">
                <span className="text-slate-400 uppercase block">Trade Name</span>
                <span className="font-bold text-white block truncate">Shadow Arrow</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 space-y-0.5">
                <span className="text-slate-400 uppercase block">Legal Name</span>
                <span className="font-bold text-white block truncate">Bijoy Lohar</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 space-y-1">
              <span className="text-slate-400 uppercase text-[10px] block flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>Principal Place of Business</span>
              </span>
              <p className="text-slate-300 text-[10px] leading-relaxed">
                C/O Binod Lohar, Dapanjuri Road, Bhara, Bankura, West Bengal - 722157
              </p>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
              <span>Jurisdictional Office: <strong className="text-slate-200">KOLKATA</strong></span>
              <span>Issue Date: <strong className="text-slate-200">25/06/2026</strong></span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
