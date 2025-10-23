import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Web3Provider } from '@/lib/wagmi';

export const metadata: Metadata = {
  title: 'Base Gold – Stake Your Claim',
  description: 'Stake BGLD on Base. Simple locks, high APR, compounding.',
  applicationName: 'Base Gold',
  manifest: '/manifest.webmanifest',
  themeColor: '#0b0b0f',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'Base Gold – Stake Your Claim',
    description: 'Stake BGLD on Base. Simple locks, high APR, compounding.',
    url: 'https://stake.basereserve.gold',
    siteName: 'Base Gold',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Base Gold' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base Gold – Stake Your Claim',
    description: 'Stake BGLD on Base. Simple locks, high APR, compounding.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* iOS meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen flex flex-col bg-black text-white selection:bg-amber-400/25 selection:text-amber-200">
        <Web3Provider>
          {/* Subtle top gold glow under header */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-0 h-24 opacity-20 blur-3xl"
            style={{
              background:
                'radial-gradient(600px 180px at 50% 0%, rgba(212,175,55,0.25), transparent 60%)',
            }}
          />
          <Header />

          <main className="flex-1 mx-auto w-full max-w-6xl px-4 pb-24 pt-4 relative z-10">
            {children}
          </main>

          <Footer />
        </Web3Provider>
      </body>
    </html>
  );
}
