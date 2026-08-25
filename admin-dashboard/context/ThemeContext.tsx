'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeConfig {
  mode: 'DARK' | 'LIGHT';
  darkness: number; // 0 to 100
  hue: number; // 0 to 360
  accentHex: string;
  glowIntensity: number; // 0 to 100
  presetName: string;
}

const DEFAULT_THEME: ThemeConfig = {
  mode: 'DARK',
  darkness: 80,
  hue: 217,
  accentHex: '#3b82f6',
  glowIntensity: 60,
  presetName: 'Cyber Blue',
};

interface ThemeContextType {
  theme: ThemeConfig;
  setMode: (mode: 'DARK' | 'LIGHT') => void;
  setDarkness: (val: number) => void;
  setHue: (val: number) => void;
  setAccentHex: (hex: string) => void;
  setGlowIntensity: (val: number) => void;
  applyPreset: (preset: ThemeConfig) => void;
  resetDefaults: () => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_theme_config');
    if (saved) {
      try {
        setTheme(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved admin theme config');
      }
    }
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.style.setProperty('--click-x', `${e.clientX}px`);
        root.style.setProperty('--click-y', `${e.clientY}px`);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleGlobalClick);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('click', handleGlobalClick);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('admin_theme_config', JSON.stringify(theme));
    applyThemeToDOM(theme);
  }, [theme]);

  const applyThemeToDOM = (cfg: ThemeConfig) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (cfg.mode === 'LIGHT') {
      root.classList.add('light-mode');
      const lightness = Math.round(98 - (cfg.darkness / 100) * 15); // 83% to 98%
      const bgLight = `hsl(${cfg.hue}, 20%, ${lightness}%)`;
      const cardLight = `#ffffff`;
      const borderLight = `hsl(${cfg.hue}, 15%, 88%)`;

      root.style.setProperty('--admin-bg', bgLight);
      root.style.setProperty('--admin-card-bg', cardLight);
      root.style.setProperty('--admin-border', borderLight);
      root.style.setProperty('--admin-text', '#0f172a');
      root.style.setProperty('--admin-accent', cfg.accentHex);
      root.style.setProperty('--admin-glow-shadow', `0 4px 20px ${cfg.accentHex}25`);
    } else {
      root.classList.remove('light-mode');
      const lightness = Math.round(18 - (cfg.darkness / 100) * 15); // 3% to 18%
      const bgDark = `hsl(${cfg.hue}, 25%, ${lightness}%)`;
      const cardDark = `hsl(${cfg.hue}, 22%, ${lightness + 5}%)`;
      const borderDark = `hsl(${cfg.hue}, 18%, ${lightness + 12}%)`;

      root.style.setProperty('--admin-bg', bgDark);
      root.style.setProperty('--admin-card-bg', cardDark);
      root.style.setProperty('--admin-border', borderDark);
      root.style.setProperty('--admin-text', '#f8fafc');
      root.style.setProperty('--admin-accent', cfg.accentHex);
      root.style.setProperty('--admin-glow-shadow', `0 0 ${cfg.glowIntensity / 3}px ${cfg.accentHex}66`);
    }
  };

  const setMode = (mode: 'DARK' | 'LIGHT') => {
    setTheme((prev) => ({
      ...prev,
      mode,
      presetName: mode === 'LIGHT' ? 'Pure White Light' : 'Custom Dark',
    }));
  };

  const setDarkness = (darkness: number) => {
    setTheme((prev) => ({ ...prev, darkness, presetName: 'Custom' }));
  };

  const setHue = (hue: number) => {
    const accentHex = `hsl(${hue}, 85%, 55%)`;
    setTheme((prev) => ({ ...prev, hue, accentHex, presetName: 'Custom' }));
  };

  const setAccentHex = (accentHex: string) => {
    setTheme((prev) => ({ ...prev, accentHex, presetName: 'Custom' }));
  };

  const setGlowIntensity = (glowIntensity: number) => {
    setTheme((prev) => ({ ...prev, glowIntensity, presetName: 'Custom' }));
  };

  const applyPreset = (preset: ThemeConfig) => {
    setTheme(preset);
  };

  const resetDefaults = () => {
    setTheme(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider
      value={{
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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within a ThemeProvider');
  }
  return context;
}
