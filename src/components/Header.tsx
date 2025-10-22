'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b border-gold/30 bg-black/60 backdrop-blur-md sticky top-0 z-50">
      {/* Logo → link home (3x size) */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 transition-transform group-hover:scale-105">
          <Image
            src="/logo.png"
            alt="Base Gold"
            fill
            priority
            className="object-contain drop-shadow-[0_0_14px_rgba(212,175,55,0.5)]"
          />
        </div>
        <span className="text-gold font-bold text-2xl tracking-wide hidden sm:inline-block group-hover:text-gold-light transition-colors">
          STAKING VAULT
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-6 text-sm opacity-90">
  <Link href="/" className="hover:opacity-100">Home</Link>
  <Link href="/stake" className="hover:opacity-100">Stake</Link>
  <Link href="/claim" className="hover:opacity-100">Claim Dashboard</Link>
  <Link href="/docs" className="hover:opacity-100">Docs</Link>
  <Link href="/docs/how-it-works" className="hover:opacity-100">How It Works</Link>
  <Link href="/status" className="hover:opacity-100">Status</Link>
  <Link href="/terms" className="hover:opacity-100">Terms</Link>
</nav>


      <div className="flex items-center">
        <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
      </div>
    </header>
  );
}
