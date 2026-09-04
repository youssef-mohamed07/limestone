import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LIMESTONE — Invoice & Export Management',
  description: 'Professional invoice, payment, and shipment management for LIMESTONE Egyptian Natural Stone Exporter.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
