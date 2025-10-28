'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/80 backdrop-blur-md py-10 text-center relative overflow-hidden">
      {/* Gold ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-25 blur-3xl"
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

        <div className="text-sm text-white/60 leading-relaxed">
          <p>
            © {new Date().getFullYear()}{' '}
            <span className="text-amber-300 font-semibold">BaseReserve.Gold</span>
          </p>
          <p className="mt-1 text-xs text-white/40">
            Built on Base • Powered by ETH • Secured by the Vault
          </p>
        </div>

        <div className="flex items-center gap-6 mt-3 text-xs text-white/50">
          <Link
            href="https://basescan.org/"
            target="_blank"
            className="hover:text-amber-300 transition-colors"
          >
            BaseScan
          </Link>
          <Link
            href="https://x.com/BaseReserveGold"
            target="_blank"
            className="hover:text-amber-300 transition-colors"
          >
            X (Twitter)
          </Link>
          <Link
            href="/terms"
            className="hover:text-amber-300 transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/how-it-works"
            className="hover:text-amber-300 transition-colors"
          >
            Mechanics
          </Link>
        </div>
      </div>
    </footer>
  );
}
