'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu as MenuIcon, X as CloseIcon } from 'lucide-react';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/stake', label: 'Stake' },
  { href: '/claim', label: 'Claim Dashboard' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/how-to', label: 'How to' },
  { href: '/status', label: 'Status' },
  { href: '/terms', label: 'Terms' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="mx-auto mt-4 max-w-6xl px-4">
      <div className="headerGlass rounded-2xl px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Make logo larger (≈3x your old 36px → ~96px height on desktop) */}
            <img
              src="/logo.png"
              alt="Base Gold"
              className="h-10 w-auto md:h-16 transition-transform group-hover:scale-[1.02]"
            />
            <span className="hidden md:block font-bold tracking-wide text-base md:text-lg">
              BASE GOLD
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm opacity-90">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-100">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Connect */}
        <div className="hidden md:block">
          <ConnectButton />
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
          className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/15 bg-black/30 p-2"
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu (drawer) */}
      {open && (
        <div className="md:hidden mt-2 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md">
          <div className="px-4 py-3">
            {/* Connect on mobile */}
            <div className="mb-3">
              <ConnectButton />
            </div>

            <nav className="flex flex-col divide-y divide-white/10">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
