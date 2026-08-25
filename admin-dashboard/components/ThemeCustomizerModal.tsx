'use client';

import React from 'react';
import { useAdminTheme, ThemeConfig } from '@/context/ThemeContext';
import { X, Palette, Sun, Moon, Sparkles, RotateCcw, Check } from 'lucide-react';

const PRESETS: ThemeConfig[] = [
  { presetName: 'Pure White Minimal', mode: 'LIGHT', darkness: 10, hue: 217, accentHex: '#2563eb', glowIntensity: 30 },
  { presetName: 'Pearl White Emerald', mode: 'LIGHT', darkness: 15, hue: 155, accentHex: '#059669', glowIntensity: 35 },
  { presetName: 'Cyber Blue Dark', mode: 'DARK', darkness: 85, hue: 217, accentHex: '#3b82f6', glowIntensity: 60 },
  { presetName: 'Neon Emerald Dark', mode: 'DARK', darkness: 90, hue: 155, accentHex: '#10b981', glowIntensity: 70 },
  { presetName: 'Violet Syndicate', mode: 'DARK', darkness: 88, hue: 270, accentHex: '#8b5cf6', glowIntensity: 75 },
  { presetName: 'Amber Gold Dark', mode: 'DARK', darkness: 85, hue: 38, accentHex: '#f59e0b', glowIntensity: 65 },
];

const PRESET_COLORS = [
  { name: 'Electric Blue', hex: '#3b82f6', hue: 217 },
  { name: 'Neon Emerald', hex: '#10b981', hue: 155 },
  { name: 'Cyber Purple', hex: '#8b5cf6', hue: 270 },
  { name: 'Amber Gold', hex: '#f59e0b', hue: 38 },
  { name: 'Rose Red', hex: '#ef4444', hue: 350 },
  { name: 'Cyan Wave', hex: '#06b6d4', hue: 190 },
];

export default function ThemeCustomizerModal() {
  const {
    theme,
    setMode,
    setDarkness,
    setHue,
    setAccentHex,
    setGlowIntensity,
    applyPreset,
    resetDefaults,
    isCustomizerOpen,
    setIsCustomizerOpen,
  } = useAdminTheme();

  if (!isCustomizerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-origin-expand">
      <div className="bg-ops-800 border border-ops-700 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-mono text-xs text-gray-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ops-700 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Admin Theme & Appearance</h2>
              <p className="text-[11px] text-gray-400">Switch between Pure White Light & Cyber Dark themes</p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-ops-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Toggle (Light White vs Dark Mode) */}
        <div className="space-y-2">
          <label className="block font-bold text-gray-300 uppercase tracking-wider text-[11px]">
            Appearance Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('LIGHT')}
              className={`p-3.5 rounded-2xl border flex items-center justify-center space-x-2.5 font-bold transition-all ${
                theme.mode === 'LIGHT'
                  ? 'bg-white text-slate-900 border-blue-500 ring-2 ring-blue-500/50 shadow-lg'
                  : 'bg-ops-900 text-gray-400 border-ops-700 hover:bg-ops-700'
              }`}
            >
              <Sun className={`w-5 h-5 ${theme.mode === 'LIGHT' ? 'text-amber-500 fill-amber-500' : ''}`} />
              <span>☀️ Pure White (Light Mode)</span>
            </button>

            <button
              onClick={() => setMode('DARK')}
              className={`p-3.5 rounded-2xl border flex items-center justify-center space-x-2.5 font-bold transition-all ${
                theme.mode === 'DARK'
                  ? 'bg-ops-900 text-blue-400 border-blue-500 ring-2 ring-blue-500/50 shadow-lg'
                  : 'bg-ops-900 text-gray-400 border-ops-700 hover:bg-ops-700'
              }`}
            >
              <Moon className={`w-5 h-5 ${theme.mode === 'DARK' ? 'text-blue-400 fill-blue-400' : ''}`} />
              <span>🌙 Cyber Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Live Theme Preview Box */}
        <div
          className="p-4 rounded-2xl border space-y-2 transition-all shadow-lg"
          style={{
            backgroundColor: theme.mode === 'LIGHT' ? '#ffffff' : 'var(--admin-card-bg, #111827)',
            borderColor: 'var(--admin-border, #1f2937)',
            color: theme.mode === 'LIGHT' ? '#0f172a' : '#ffffff',
            boxShadow: 'var(--admin-glow-shadow, none)',
          }}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold uppercase text-[11px]">Live Preview Card</span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
              style={{ backgroundColor: theme.accentHex }}
            >
              {theme.mode} • {theme.presetName}
            </span>
          </div>
          <p className="text-[11px] opacity-80">
            Current Theme: <strong>{theme.mode === 'LIGHT' ? 'Pure White Light' : 'Dark Cyber'}</strong> ({theme.darkness}% Tone)
          </p>
        </div>

        {/* Quick Preset Selector */}
        <div className="space-y-2">
          <label className="block font-bold text-gray-300 uppercase tracking-wider text-[11px]">
            Theme Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.presetName}
                onClick={() => applyPreset(p)}
                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                  theme.presetName === p.presetName
                    ? 'border-blue-500 bg-blue-600/20 text-white font-bold'
                    : 'border-ops-700 bg-ops-900/60 text-gray-400 hover:bg-ops-700'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: p.accentHex }}
                  />
                  <span className="truncate text-[10px]">{p.presetName}</span>
                </div>
                {theme.presetName === p.presetName && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Sliding Bar 1: Background Tone & Intensity */}
        <div className="bg-ops-900/60 p-4 rounded-2xl border border-ops-700 space-y-3">
          <div className="flex justify-between items-center">
            <label className="font-bold text-gray-200 uppercase text-[11px] flex items-center space-x-2">
              {theme.mode === 'LIGHT' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
              <span>{theme.mode === 'LIGHT' ? 'White Softness & Tint' : 'Background Darkness & Pitch'}</span>
            </label>
            <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded font-bold text-[11px]">
              {theme.darkness}%
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Sun className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={theme.darkness}
              onChange={(e) => setDarkness(Number(e.target.value))}
              className="w-full h-2 bg-ops-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <Moon className="w-4 h-4 text-blue-400 shrink-0" />
          </div>
        </div>

        {/* Sliding Bar 2: Color Hue & Accent Selector */}
        <div className="bg-ops-900/60 p-4 rounded-2xl border border-ops-700 space-y-3">
          <div className="flex justify-between items-center">
            <label className="font-bold text-gray-200 uppercase text-[11px] flex items-center space-x-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Accent Color Shift (Hue Slider)</span>
            </label>
            <span
              className="px-2 py-0.5 rounded font-bold text-[11px] text-white"
              style={{ backgroundColor: theme.accentHex }}
            >
              {theme.hue}° Hue
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max="360"
            value={theme.hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
          />

          {/* Preset Color Swatches */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">Preset Swatches:</span>
            <div className="flex items-center space-x-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setHue(c.hue);
                    setAccentHex(c.hex);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    theme.accentHex === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sliding Bar 3: Glow & Shadow Intensity */}
        <div className="bg-ops-900/60 p-4 rounded-2xl border border-ops-700 space-y-3">
          <div className="flex justify-between items-center">
            <label className="font-bold text-gray-200 uppercase text-[11px] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Shadow & Glow Intensity</span>
            </label>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded font-bold text-[11px]">
              {theme.glowIntensity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={theme.glowIntensity}
            onChange={(e) => setGlowIntensity(Number(e.target.value))}
            className="w-full h-2 bg-ops-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-ops-700 flex justify-between items-center">
          <button
            onClick={resetDefaults}
            className="flex items-center space-x-1.5 px-4 py-2 bg-ops-700 hover:bg-ops-600 text-gray-300 rounded-xl text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="px-6 py-2.5 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
            style={{ backgroundColor: theme.accentHex }}
          >
            Save & Apply Theme
          </button>
        </div>

      </div>
    </div>
  );
}
