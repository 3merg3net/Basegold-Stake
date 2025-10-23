'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
  const [open, setOpen] = useState(false);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="hover:text-amber-300 transition-colors">
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
      {/* Gold glow line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[1px] h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(212,175,55,0.7), transparent)',
        }}
      />

      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo -> home */}
        <Link href="/" className="flex items-center gap-3">
          <span className="relative block h-9 w-9">
            <Image src="/logo.png" alt="Base Gold" fill className="object-contain" priority />
          </span>
          <span className="hidden sm:inline font-semibold tracking-wide">
            <span className="text-[#0AA0FF]">BASE</span>{' '}
            <span className="text-amber-300">GOLD</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/90">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/stake">Stake</NavLink>
          <NavLink href="/claim">Claim Dashboard</NavLink>
          <NavLink href="/how-to">How-to</NavLink>
          <NavLink href="/how-it-works">How It Works</NavLink>
          <NavLink href="/terms">Terms</NavLink>
        </nav>

        {/* Connect (desktop) */}
        <div className="hidden md:block">
          <ConnectButton />
        </div>

        {/* Mobile menu button */}
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 z-50 w-72 transform bg-[#0B0F14]/98 backdrop-blur-md border-l border-white/10 transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-4 py-3 text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="relative block h-7 w-7">
              <Image src="/logo.png" alt="BGLD" fill className="object-contain" />
            </span>
            <span className="font-semibold text-amber-300">BASE GOLD</span>
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6l-12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-4 py-3 text-white">
          {[
            ['/', 'Home'],
            ['/stake', 'Stake'],
            ['/claim', 'Claim Dashboard'],
            ['/how-to', 'How-to'],
            ['/how-it-works', 'How It Works'],
            ['/terms', 'Terms'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="py-3 border-b border-white/10 hover:text-amber-300"
            >
              {label}
            </Link>
          ))}

          <div className="px-1 pt-4">
            <ConnectButton />
          </div>
        </nav>
      </div>

      {/* Backdrop for drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}
