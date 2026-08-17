(function() {
  try {
    var raw = localStorage.getItem('shadow_arrow_theme_config');
    if (raw) {
      var cfg = JSON.parse(raw);
      var root = document.documentElement;

      if (cfg.accent_hue !== undefined) root.style.setProperty('--accent-hue', cfg.accent_hue);
      if (cfg.bg_darkness !== undefined) root.style.setProperty('--bg-darkness', cfg.bg_darkness + '%');
      if (cfg.glow_intensity !== undefined) root.style.setProperty('--glow-intensity', (cfg.glow_intensity / 100).toString());
      if (cfg.buy_now_hue !== undefined) root.style.setProperty('--buy-now-hue', cfg.buy_now_hue);
      if (cfg.add_cart_hue !== undefined) root.style.setProperty('--add-cart-hue', cfg.add_cart_hue);
      if (cfg.checkout_hue !== undefined) root.style.setProperty('--checkout-hue', cfg.checkout_hue);

      if (cfg.primary_color) root.style.setProperty('--color-primary', cfg.primary_color);
      if (cfg.buy_now_btn_color) root.style.setProperty('--color-buy-now', cfg.buy_now_btn_color);
      if (cfg.add_cart_btn_color) root.style.setProperty('--color-add-cart', cfg.add_cart_btn_color);
      if (cfg.navbar_bg_color) root.style.setProperty('--color-navbar-bg', cfg.navbar_bg_color);
      if (cfg.bg_color) root.style.setProperty('--color-bg', cfg.bg_color);
      if (cfg.card_bg_color) root.style.setProperty('--color-card-bg', cfg.card_bg_color);
      if (cfg.checkout_bg_color) root.style.setProperty('--color-checkout-bg', cfg.checkout_bg_color);
      if (cfg.checkout_btn_color) root.style.setProperty('--color-checkout-btn', cfg.checkout_btn_color);
    }
  } catch (e) {
    // Fail-safe silent catch
  }
})();
