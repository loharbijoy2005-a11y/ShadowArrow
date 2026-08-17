import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import ThemeCustomizerModal from '@/components/ThemeCustomizerModal';

export const metadata: Metadata = {
  title: 'Ops Control Gateway | SHADOW ARROW Admin',
  description: 'Enterprise Fulfillment & Logistics Administration Console',
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
          {children}
          <ThemeCustomizerModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
