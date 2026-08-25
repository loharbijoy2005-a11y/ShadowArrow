import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import CartToast from '@/components/CartToast';
import Footer from '@/components/Footer';
import TrackOrderBubbleModal from '@/components/TrackOrderBubbleModal';
import ThemeProvider from '@/components/ThemeProvider';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shadowarrow.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SHADOW ARROW | Prime Marketplace Streetwear & Techwear',
    template: '%s | SHADOW ARROW',
  },
  description: 'Official online store for SHADOW ARROW. Heavyweight 280-450 GSM French Terry cotton t-shirts, hoodies, cargo pants, and cyber footwear.',
  keywords: ['streetwear', 'techwear', 'oversized t-shirts', 'heavyweight cotton', 'cargo pants', 'cyber footwear', 'street fashion', 'baggy fits'],
  authors: [{ name: 'SHADOW ARROW' }],
  creator: 'SHADOW ARROW',
  publisher: 'SHADOW ARROW',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SHADOW ARROW | Prime Marketplace Streetwear & Techwear',
    description: 'Official online store for SHADOW ARROW. Heavyweight 280-450 GSM French Terry cotton t-shirts, hoodies, cargo pants, and cyber footwear.',
    url: SITE_URL,
    siteName: 'SHADOW ARROW',
    images: [
      {
        url: '/icon.jpg', // Using our brand logo as the default sharing image
        width: 800,
        height: 800,
        alt: 'SHADOW ARROW Brand Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SHADOW ARROW | Streetwear & Techwear',
    description: 'Official online store for SHADOW ARROW. Heavyweight 280-450 GSM French Terry cotton t-shirts, hoodies, cargo pants, and cyber footwear.',
    images: ['/icon.jpg'],
  },
  icons: {
    icon: '/icon.jpg',
    apple: '/icon.jpg',
  },
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
