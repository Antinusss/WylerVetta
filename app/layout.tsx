import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portale Monte-Ore',
  description: 'Portale di rendicontazione ore a monte-ore',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
