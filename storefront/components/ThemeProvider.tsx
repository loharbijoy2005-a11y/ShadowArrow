'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Global Axios Request Interceptor to attach Customer Auth token if available
if (typeof window !== 'undefined') {
  axios.interceptors.request.use(
    (config) => {
      try {
        const userStr = localStorage.getItem('shadow_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const token = user.token || user.Token;
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }
      } catch (e) {
        console.warn('Axios auth interceptor error', e);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeLoaded, setThemeLoaded] = useState(false);

  const applyThemeConfig = useCallback((theme: any) => {
    if (!theme) return;
    const root = document.documentElement;

    // HSL Master Variables
    if (theme.accent_hue !== undefined) root.style.setProperty('--accent-hue', theme.accent_hue);
    if (theme.bg_darkness !== undefined) root.style.setProperty('--bg-darkness', theme.bg_darkness + '%');
    if (theme.glow_intensity !== undefined) root.style.setProperty('--glow-intensity', (theme.glow_intensity / 100).toString());
    if (theme.buy_now_hue !== undefined) root.style.setProperty('--buy-now-hue', theme.buy_now_hue);
    if (theme.add_cart_hue !== undefined) root.style.setProperty('--add-cart-hue', theme.add_cart_hue);
    if (theme.checkout_hue !== undefined) root.style.setProperty('--checkout-hue', theme.checkout_hue);

    // Color Overrides
    if (theme.primary_color) root.style.setProperty('--color-primary', theme.primary_color);
    if (theme.buy_now_btn_color) root.style.setProperty('--color-buy-now', theme.buy_now_btn_color);
    if (theme.add_cart_btn_color) root.style.setProperty('--color-add-cart', theme.add_cart_btn_color);
    if (theme.navbar_bg_color) root.style.setProperty('--color-navbar-bg', theme.navbar_bg_color);
    if (theme.navbar_text_color) root.style.setProperty('--color-navbar-text', theme.navbar_text_color);
    if (theme.bg_color) root.style.setProperty('--color-bg', theme.bg_color);
    if (theme.card_bg_color) root.style.setProperty('--color-card-bg', theme.card_bg_color);
    if (theme.checkout_bg_color) root.style.setProperty('--color-checkout-bg', theme.checkout_bg_color);
    if (theme.checkout_card_color) root.style.setProperty('--color-checkout-card', theme.checkout_card_color);
    if (theme.checkout_btn_color) root.style.setProperty('--color-checkout-btn', theme.checkout_btn_color);
    if (theme.footer_bg_color) root.style.setProperty('--color-footer-bg', theme.footer_bg_color);
    if (theme.footer_text_color) root.style.setProperty('--color-footer-text', theme.footer_text_color);

    try {
      localStorage.setItem('shadow_arrow_theme_config', JSON.stringify(theme));
    } catch (e) {}
  }, []);

  const fetchLatestTheme = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/settings/theme`);
      const theme = res.data;
      if (theme) {
        applyThemeConfig(theme);
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic theme', err);
    } finally {
      setThemeLoaded(true);
    }
  }, [applyThemeConfig]);

  useEffect(() => {
    fetchLatestTheme();

    const handleThemeEvent = (e: any) => {
      if (e.detail) {
        applyThemeConfig(e.detail);
      } else {
        fetchLatestTheme();
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'shadow_arrow_theme_config' && e.newValue) {
        try {
          applyThemeConfig(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    window.addEventListener('themeChanged', handleThemeEvent as EventListener);
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('focus', fetchLatestTheme);

    const interval = setInterval(fetchLatestTheme, 15000);

    return () => {
      window.removeEventListener('themeChanged', handleThemeEvent as EventListener);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', fetchLatestTheme);
      clearInterval(interval);
    };
  }, [fetchLatestTheme, applyThemeConfig]);

  return <>{children}</>;
}
