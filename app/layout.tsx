import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import WhatsAppFloating from '../components/WhatsAppFloating';
import DisableDevTools from '../components/DisableDevTools';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: {
    template: '%s | BMKG – Stasiun Meteorologi Maritim Tegal',
    default: 'BMKG – Stasiun Meteorologi Maritim Tegal',
  },
  description: 'Portal informasi cuaca maritim Stasiun Meteorologi Maritim Tegal – BMKG.',
  keywords: ['BMKG', 'Maritim', 'Tegal', 'Cuaca', 'Prakiraan Cuaca', 'Meteorologi', 'Jawa Tengah'],
  robots: { index: true, follow: true },
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
