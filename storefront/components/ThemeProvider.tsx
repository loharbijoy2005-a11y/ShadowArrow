'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeLoaded, setThemeLoaded] = useState(false);

  const applyTheme = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/settings/theme`);
      const theme = res.data;
      if (theme) {
        const root = document.documentElement;
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
        if (theme.text_primary_color) root.style.setProperty('--color-text-primary', theme.text_primary_color);
        if (theme.text_secondary_color) root.style.setProperty('--color-text-secondary', theme.text_secondary_color);
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic theme settings', err);
    } finally {
      setThemeLoaded(true);
    }
  }, []);

  useEffect(() => {
    applyTheme();

    // Re-fetch and sync dynamic theme when window regains focus (admin saved new colors in another tab)
    const handleFocus = () => {
      applyTheme();
    };

    window.addEventListener('focus', handleFocus);
    // Background interval sync every 12 seconds
    const interval = setInterval(applyTheme, 12000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [applyTheme]);

  return <>{children}</>;
}
