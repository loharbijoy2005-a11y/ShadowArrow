import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ops Control Gateway',
  description: 'Enterprise Fulfillment & Logistics Administration Console',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-ops-900 text-gray-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
