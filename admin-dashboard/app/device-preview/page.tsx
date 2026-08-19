'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Smartphone, Tablet, Laptop, RefreshCw, ExternalLink, RotateCw, Monitor, ArrowLeft } from 'lucide-react';

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://www.shadowarrow.in';

type DeviceType = 'mobile' | 'tablet' | 'laptop';

export default function DevicePreviewPage() {
  const [device, setDevice] = useState<DeviceType>('mobile');
  const [isLandscape, setIsLandscape] = useState(false);
  const [key, setKey] = useState(0);

  const reloadIframe = () => {
    setKey((prev) => prev + 1);
  };

  const getDimensions = () => {
    if (device === 'mobile') {
      return isLandscape ? { width: '667px', height: '375px' } : { width: '375px', height: '667px' };
    }
    if (device === 'tablet') {
      return isLandscape ? { width: '1024px', height: '768px' } : { width: '768px', height: '1024px' };
    }
    return { width: '100%', height: '800px' };
  };

  const dimensions = getDimensions();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans space-y-6">
      
      {/* Top Header & Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl">
        
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition flex items-center space-x-1.5 text-xs font-mono font-bold"
            title="Return to Admin Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-xl">
            <Monitor className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base uppercase font-mono tracking-wider text-white flex items-center space-x-2">
              <span>Live Storefront Device Inspector</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] rounded-full font-mono">
                LIVE SYNC
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Real-time responsive viewport inspector for Mobile, Tablet & Laptop viewports.
            </p>
          </div>
        </div>

        {/* Device Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 space-x-1 font-mono text-xs">
          
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              device === 'mobile'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Phone (375px)</span>
          </button>

          <button
            onClick={() => setDevice('tablet')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              device === 'tablet'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden sm:inline">Pad (768px)</span>
          </button>

          <button
            onClick={() => setDevice('laptop')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              device === 'laptop'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span className="hidden sm:inline">Laptop</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 font-mono">
          {device !== 'laptop' && (
            <button
              onClick={() => setIsLandscape((prev) => !prev)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Rotate Screen Orientation"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={reloadIframe}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Reload Live Preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Tab</span>
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex flex-col items-center justify-center min-h-[750px] p-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden shadow-inner relative">
        
        {/* Mockup Display Wrapper */}
        <div
          className={`transition-all duration-300 bg-slate-950 border-4 border-slate-800 shadow-2xl overflow-hidden relative ${
            device === 'mobile'
              ? 'rounded-[40px] p-3'
              : device === 'tablet'
              ? 'rounded-[32px] p-4'
              : 'rounded-2xl w-full p-2'
          }`}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: '100%',
          }}
        >
          {/* Top Notch for Phone */}
          {device === 'mobile' && !isLandscape && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl z-20 flex items-center justify-center">
              <div className="w-3 h-3 bg-slate-900 rounded-full border border-slate-700" />
            </div>
          )}

          {/* Screen Content Iframe */}
          <iframe
            key={key}
            src={STORE_URL}
            className="w-full h-full rounded-2xl bg-white border-0"
            title="SHADOW ARROW Live Storefront Preview"
          />
        </div>

        {/* Footer info badge */}
        <div className="mt-4 text-center font-mono text-xs text-slate-500">
          <span>Viewing Mode: <strong className="text-blue-400 uppercase">{device}</strong></span> • 
          <span> Resolution: <strong className="text-slate-300">{dimensions.width} x {dimensions.height}</strong></span>
        </div>
      </div>

    </div>
  );
}
