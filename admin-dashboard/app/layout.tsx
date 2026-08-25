import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import ThemeCustomizerModal from '@/components/ThemeCustomizerModal';

export const metadata: Metadata = {
  title: 'Admin Dashboard | SHADOW ARROW',
  description: 'Store Fulfillment & Logistics Management Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-ops-900 text-gray-100 antialiased font-sans transition-colors duration-300">
        <ThemeProvider>
          <div className="animate-in fade-in zoom-in-95 duration-300 min-h-screen">
            {children}
          </div>
          <ThemeCustomizerModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
