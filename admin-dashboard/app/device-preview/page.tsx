'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Smartphone, Tablet, Laptop, RefreshCw, ExternalLink, RotateCw, Monitor, ArrowLeft, ChevronDown } from 'lucide-react';

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://www.shadowarrow.in';

type DeviceType = 'mobile' | 'tablet' | 'laptop';

// Device catalog: Company → Models → dimensions
const DEVICE_CATALOG: Record<string, { label: string; type: DeviceType; w: string; h: string }[]> = {
  'Apple': [
    { label: 'iPhone SE (2022)', type: 'mobile', w: '375px', h: '667px' },
    { label: 'iPhone 14 / 13', type: 'mobile', w: '390px', h: '844px' },
    { label: 'iPhone 14 Plus / 13 Pro Max', type: 'mobile', w: '428px', h: '926px' },
    { label: 'iPhone 14 Pro', type: 'mobile', w: '393px', h: '852px' },
    { label: 'iPhone 14 Pro Max', type: 'mobile', w: '430px', h: '932px' },
    { label: 'iPhone 15', type: 'mobile', w: '393px', h: '852px' },
    { label: 'iPhone 15 Pro Max', type: 'mobile', w: '430px', h: '932px' },
    { label: 'iPad Mini (6th Gen)', type: 'tablet', w: '744px', h: '1133px' },
    { label: 'iPad (10th Gen)', type: 'tablet', w: '820px', h: '1180px' },
    { label: 'iPad Air (M1)', type: 'tablet', w: '820px', h: '1180px' },
    { label: 'iPad Pro 11"', type: 'tablet', w: '834px', h: '1194px' },
    { label: 'iPad Pro 12.9"', type: 'tablet', w: '1024px', h: '1366px' },
    { label: 'MacBook Air 13"', type: 'laptop', w: '1280px', h: '800px' },
    { label: 'MacBook Pro 14"', type: 'laptop', w: '1512px', h: '982px' },
    { label: 'MacBook Pro 16"', type: 'laptop', w: '1728px', h: '1117px' },
  ],
  'Samsung': [
    { label: 'Galaxy A14', type: 'mobile', w: '360px', h: '780px' },
    { label: 'Galaxy A54 5G', type: 'mobile', w: '393px', h: '851px' },
    { label: 'Galaxy S23', type: 'mobile', w: '360px', h: '780px' },
    { label: 'Galaxy S23+', type: 'mobile', w: '393px', h: '851px' },
    { label: 'Galaxy S23 Ultra', type: 'mobile', w: '412px', h: '915px' },
    { label: 'Galaxy S24', type: 'mobile', w: '360px', h: '780px' },
    { label: 'Galaxy S24 Ultra', type: 'mobile', w: '412px', h: '932px' },
    { label: 'Galaxy Z Fold 5 (Open)', type: 'tablet', w: '812px', h: '1080px' },
    { label: 'Galaxy Tab S9', type: 'tablet', w: '800px', h: '1280px' },
    { label: 'Galaxy Tab S9 Ultra', type: 'tablet', w: '1024px', h: '1600px' },
  ],
  'OnePlus': [
    { label: 'OnePlus Nord CE 3 Lite', type: 'mobile', w: '393px', h: '851px' },
    { label: 'OnePlus 11', type: 'mobile', w: '412px', h: '919px' },
    { label: 'OnePlus 12', type: 'mobile', w: '412px', h: '919px' },
    { label: 'OnePlus Open', type: 'tablet', w: '800px', h: '1000px' },
  ],
  'Google': [
    { label: 'Pixel 7a', type: 'mobile', w: '393px', h: '851px' },
    { label: 'Pixel 8', type: 'mobile', w: '412px', h: '915px' },
    { label: 'Pixel 8 Pro', type: 'mobile', w: '412px', h: '915px' },
    { label: 'Pixel Fold', type: 'tablet', w: '884px', h: '1080px' },
    { label: 'Pixel Tablet', type: 'tablet', w: '1280px', h: '800px' },
  ],
  'Xiaomi / Redmi': [
    { label: 'Redmi 12C', type: 'mobile', w: '393px', h: '854px' },
    { label: 'Redmi Note 12', type: 'mobile', w: '393px', h: '873px' },
    { label: 'Xiaomi 13', type: 'mobile', w: '393px', h: '851px' },
    { label: 'Xiaomi 14 Ultra', type: 'mobile', w: '412px', h: '924px' },
    { label: 'Redmi Pad SE', type: 'tablet', w: '800px', h: '1280px' },
  ],
  'Realme / OPPO': [
    { label: 'Realme C55', type: 'mobile', w: '393px', h: '873px' },
    { label: 'Realme 11 Pro+', type: 'mobile', w: '393px', h: '873px' },
    { label: 'OPPO Reno 10 Pro', type: 'mobile', w: '412px', h: '919px' },
    { label: 'OPPO Find X6 Pro', type: 'mobile', w: '412px', h: '919px' },
  ],
  'Vivo': [
    { label: 'Vivo Y56 5G', type: 'mobile', w: '393px', h: '854px' },
    { label: 'Vivo V27 Pro', type: 'mobile', w: '393px', h: '851px' },
    { label: 'Vivo X90 Pro', type: 'mobile', w: '412px', h: '915px' },
  ],
  'Generic / Desktop': [
    { label: 'Small Mobile (360px)', type: 'mobile', w: '360px', h: '640px' },
    { label: 'Standard Mobile (390px)', type: 'mobile', w: '390px', h: '844px' },
    { label: 'Large Mobile (430px)', type: 'mobile', w: '430px', h: '932px' },
    { label: 'Standard Tablet (768px)', type: 'tablet', w: '768px', h: '1024px' },
    { label: 'Large Tablet (1024px)', type: 'tablet', w: '1024px', h: '1366px' },
    { label: 'Laptop HD (1280px)', type: 'laptop', w: '1280px', h: '800px' },
    { label: 'Laptop FHD (1366px)', type: 'laptop', w: '1366px', h: '768px' },
    { label: 'Desktop FHD (1920px)', type: 'laptop', w: '100%', h: '900px' },
  ],
};

const COMPANIES = Object.keys(DEVICE_CATALOG);

export default function DevicePreviewPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>('Apple');
  const [selectedModelIdx, setSelectedModelIdx] = useState<number>(1); // iPhone 14 default
  const [isLandscape, setIsLandscape] = useState(false);
  const [key, setKey] = useState(0);

  const models = DEVICE_CATALOG[selectedCompany] || [];
  const selectedModel = models[selectedModelIdx] || models[0];
  const deviceType: DeviceType = selectedModel?.type || 'mobile';

  const getDimensions = () => {
    if (!selectedModel) return { width: '390px', height: '844px' };
    if (selectedModel.w === '100%') return { width: '100%', height: selectedModel.h };
    if (isLandscape && deviceType !== 'laptop') {
      return { width: selectedModel.h, height: selectedModel.w };
    }
    return { width: selectedModel.w, height: selectedModel.h };
  };

  const dimensions = getDimensions();

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
    setSelectedModelIdx(0);
    setIsLandscape(false);
  };

  const reloadIframe = () => setKey((prev) => prev + 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans space-y-6">
      
      {/* Top Header & Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4 backdrop-blur-xl">
        
        {/* Title Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                Real-time responsive viewport inspector. Select company → model for accurate dimensions.
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2 font-mono">
            {deviceType !== 'laptop' && (
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

        {/* Device Selector Row — Company → Model */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t border-slate-800 pt-4">
          
          {/* Company Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold font-mono">Company</label>
            <div className="relative">
              <select
                value={selectedCompany}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="appearance-none bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                {COMPANIES.map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="text-slate-600 font-bold text-lg hidden sm:block">→</div>

          {/* Model Dropdown */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="text-[10px] text-slate-400 uppercase font-bold font-mono">Model / Device</label>
            <div className="relative">
              <select
                value={selectedModelIdx}
                onChange={(e) => setSelectedModelIdx(Number(e.target.value))}
                className="appearance-none w-full bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                {models.map((model, idx) => (
                  <option key={idx} value={idx}>
                    {model.type === 'mobile' ? '📱' : model.type === 'tablet' ? '🖥' : '💻'} {model.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Device Type Badge */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold font-mono">Viewport</label>
            <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl">
              {deviceType === 'mobile' ? <Smartphone className="w-4 h-4 text-blue-400" /> :
               deviceType === 'tablet' ? <Tablet className="w-4 h-4 text-purple-400" /> :
               <Laptop className="w-4 h-4 text-emerald-400" />}
              <span className="text-xs font-mono font-bold text-white">
                {isLandscape && deviceType !== 'laptop' ? dimensions.width : selectedModel?.w} × {isLandscape && deviceType !== 'laptop' ? dimensions.height : selectedModel?.h}
              </span>
              {isLandscape && deviceType !== 'laptop' && (
                <span className="text-[10px] text-amber-400 font-mono font-bold border border-amber-500/30 px-1.5 py-0.5 rounded">LANDSCAPE</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex flex-col items-center justify-center min-h-[750px] p-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden shadow-inner relative">
        
        {/* Mockup Display Wrapper */}
        <div
          className={`transition-all duration-300 bg-slate-950 border-4 border-slate-800 shadow-2xl overflow-hidden relative ${
            deviceType === 'mobile'
              ? 'rounded-[40px] p-3'
              : deviceType === 'tablet'
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
          {deviceType === 'mobile' && !isLandscape && (
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
        <div className="mt-4 text-center font-mono text-xs text-slate-500 space-y-1">
          <div>
            <span className="text-blue-400 font-bold">{selectedCompany}</span> — <span className="text-white font-bold">{selectedModel?.label}</span>
          </div>
          <div>
            Viewport: <strong className="text-slate-300">{dimensions.width} × {dimensions.height}</strong>
            {isLandscape && deviceType !== 'laptop' && <span className="ml-2 text-amber-400">(Landscape)</span>}
          </div>
        </div>
      </div>

    </div>
  );
}
