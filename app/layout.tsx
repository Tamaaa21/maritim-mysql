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
    title: 'BMKG – Stasiun Meteorologi Maritim Tegal',
    description: 'Portal informasi cuaca maritim Stasiun Meteorologi Maritim Tegal – BMKG.',
    siteName: 'BMKG Maritim Tegal',
    type: 'website',
    images: [
      {
        url: '/bmkg-logo.png',
        width: 512,
        height: 512,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BMKG – Stasiun Meteorologi Maritim Tegal',
    description: 'Portal informasi cuaca maritim Stasiun Meteorologi Maritim Tegal – BMKG.',
    images: [
      {
        url: '/bmkg-logo.png',
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
