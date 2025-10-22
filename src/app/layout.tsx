import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { Metadata } from 'next';

import { Web3Provider } from '@/lib/wagmi';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Base Gold – Stake Your Claim',
  description: 'Stake your claim in the Base Gold Rush. Auto-compound ETH → BGLD and grow your vault share.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-black via-darkbg to-black text-white">
        <Web3Provider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 pb-24">{children}</main>
          <Footer />
        </Web3Provider>
      </body>
    </html>
  );
}
