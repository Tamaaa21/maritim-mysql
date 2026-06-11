import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import WhatsAppFloating from '../components/WhatsAppFloating';
import DisableDevTools from '../components/DisableDevTools';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BMKG – Stasiun Meteorologi Maritim Tegal',
  description: 'Portal informasi cuaca maritim Stasiun Meteorologi Maritim Tegal – BMKG.',
  icons: {
    icon: '/bmkg-logo.png',
  },
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <DisableDevTools />
        {children}
        <WhatsAppFloating />
      </body>
    </html>
  );
}
