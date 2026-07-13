import type { Metadata } from 'next';
import { Fraunces, Inter_Tight, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight' });
const splineMono = Spline_Sans_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-spline-mono' });

export const metadata: Metadata = {
  title: 'Portale Monte-Ore',
  description: 'Portale di rendicontazione ore a monte-ore',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fraunces.variable} ${interTight.variable} ${splineMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
