import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import EnvProbe from '@/components/EnvProbe';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Web3Provider } from '@/providers/Web3Provider';


export const metadata: Metadata = {
  title: 'Base Gold – Stake Your Claim',
  description: 'Stake BGLD on Base. Simple locks, high APR, compounding.',
  applicationName: 'Base Gold',
  manifest: '/manifest.webmanifest',
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

export const viewport: Viewport = {
  themeColor: '#0b0b0f',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen flex flex-col bg-black text-white selection:bg-amber-400/25 selection:text-amber-200">
        <Web3Provider>
           <EnvProbe />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-0 h-24 opacity-20 blur-3xl"
            style={{
              background:
                'radial-gradient(600px 180px at 50% 0%, rgba(212,175,55,0.25), transparent 60%)',
            }}
          />

          {/* ===== GLOBAL V2 ANNOUNCEMENT BANNER ===== */}
<div className="w-full bg-gradient-to-r from-amber-300/10 via-amber-300/20 to-amber-300/10 border-b border-amber-300/30 backdrop-blur-md py-3 px-4 text-center">
  <p className="text-[13px] md:text-sm text-amber-200 leading-snug font-medium">
    <span className="font-bold text-amber-300">BASE GOLD RESERVE UPDATE:</span>
    &nbsp;Vault parameters have been refined to strengthen long-term sustainability as we prepare
    the next evolution of the Base Gold Reserve.
    <br className="hidden sm:block" />
    <span className="text-amber-300 font-semibold">V2 Vaults</span> will introduce longer lock options,
    enhanced reward structures, and integrated casino incentives —
    designed to reward long-term conviction.
    <br className="hidden sm:block" />
    <span className="text-white/80">
      Staking remains live. Existing vaults continue normally.
      More details on V2 will be announced ahead of launch.
    </span>
  </p>
</div>


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
