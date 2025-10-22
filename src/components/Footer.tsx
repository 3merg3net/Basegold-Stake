'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gold/20 bg-black/80 backdrop-blur-md py-10 text-center relative overflow-hidden">
      <div
        className="absolute -inset-1 opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(400px 200px at 50% 0%, rgba(212,175,55,0.2), transparent)' }}
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
          <p className="mt-1 text-xs text-gray-500">Built on Base • Powered by ETH • Staked in Gold</p>
        </div>

        <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
          <Link href="https://basescan.org/" target="_blank" className="hover:text-gold transition-colors">
            View on Basescan
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
