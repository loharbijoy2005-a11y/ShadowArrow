import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import CartToast from '@/components/CartToast';
import Footer from '@/components/Footer';
import TrackOrderBubbleModal from '@/components/TrackOrderBubbleModal';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'SHADOW ARROW | Prime Marketplace Streetwear & Techwear',
  description: 'Official online store for SHADOW ARROW. Heavyweight 280-450 GSM French Terry cotton t-shirts, hoodies, cargo pants, and cyber footwear.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script src="/theme-loader.js" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 min-h-screen flex flex-col font-sans transition-colors">
        <ThemeProvider>
          <CartProvider>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <CartToast />
            <CartDrawer />
            <TrackOrderBubbleModal />
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
