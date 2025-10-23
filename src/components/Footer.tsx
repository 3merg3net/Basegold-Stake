'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gold/20 bg-black/80 backdrop-blur-md py-10 text-center relative overflow-hidden">
      {/* Gold glow at bottom center */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 opacity-25 blur-3xl"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(400px 120px at 50% 100%, rgba(212,175,55,0.25), transparent 70%)',
        }}
      />

      <div className="relative flex flex-col items-center justify-center space-y-4">
        <Link href="/" className="group relative w-16 h-16 sm:w-20 sm:h-20">
          <Image
            src="/logo.png"
            alt="Base Gold"
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
          />
        </Link>

        <div className="text-sm text-gray-400 leading-relaxed">
          <p>
            © {new Date().getFullYear()}{' '}
            <span className="text-gold font-semibold">BaseReserve.Gold</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Built on Base • Powered by ETH • Staked in Gold
          </p>
        </div>

        <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
          <Link href="https://basescan.org/" target="_blank" className="hover:text-gold transition-colors">
            View on BaseScan
          </Link>
          <Link href="https://x.com/BaseReserveGold" target="_blank" className="hover:text-gold transition-colors">
            Follow on X
          </Link>
          <Link href="/docs" className="hover:text-gold transition-colors">
            Docs
          </Link>
        </div>
      </div>
    </footer>
  );
}
