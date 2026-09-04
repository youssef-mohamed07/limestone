import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import { requireChatGPTUser } from './chatgpt-auth';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'LIMESTONE — Invoice & Export Management',
  description: 'Professional invoice, payment, and shipment management for LIMESTONE Egyptian Natural Stone Exporter.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireChatGPTUser('/');
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${cormorant.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
