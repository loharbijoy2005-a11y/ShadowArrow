'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const applyTheme = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/settings/theme`);
        const theme = res.data;
        if (theme) {
          const root = document.documentElement;
          if (theme.primary_color) root.style.setProperty('--color-primary', theme.primary_color);
          if (theme.buy_now_btn_color) root.style.setProperty('--color-buy-now', theme.buy_now_btn_color);
          if (theme.add_cart_btn_color) root.style.setProperty('--color-add-cart', theme.add_cart_btn_color);
          if (theme.navbar_bg_color) root.style.setProperty('--color-navbar-bg', theme.navbar_bg_color);
          if (theme.bg_color) root.style.setProperty('--color-bg', theme.bg_color);
          if (theme.card_bg_color) root.style.setProperty('--color-card-bg', theme.card_bg_color);
          if (theme.text_primary_color) root.style.setProperty('--color-text-primary', theme.text_primary_color);
          if (theme.text_secondary_color) root.style.setProperty('--color-text-secondary', theme.text_secondary_color);
        }
      } catch (err) {
        console.warn('Failed to load dynamic theme, using default CSS variables', err);
      } finally {
        setThemeLoaded(true);
      }
    };

    applyTheme();
  }, []);

  return <>{children}</>;
}
