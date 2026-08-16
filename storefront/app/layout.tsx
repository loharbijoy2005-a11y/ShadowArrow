import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import TrackOrderBubbleModal from '@/components/TrackOrderBubbleModal';

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
      <body className="bg-slate-50 min-h-screen flex flex-col font-sans transition-colors">
        <CartProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <CartDrawer />
          <TrackOrderBubbleModal />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
