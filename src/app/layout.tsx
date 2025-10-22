import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { Metadata } from 'next';
import { Web3Provider } from '@/lib/wagmi';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = { title: 'Base Gold – Stake Your Claim' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Web3Provider>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 pb-24">{children}</main>
          <footer className="border-t border-white/10 py-8 text-center text-sm opacity-80">
            Back to{' '}
            <a href="https://www.basereserve.gold" className="underline">
              BaseReserve.Gold
            </a>
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}
