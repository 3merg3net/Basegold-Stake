'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';

const EXPECTED_CHAIN_ID =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453); // default: Base Mainnet

const CHAIN_MAP: Record<
  number,
  { name: string; explorerTx: string; explorerAddr: string }
> = {
  8453: {
    name: 'Base Mainnet',
    explorerTx: 'https://basescan.org/tx',
    explorerAddr: 'https://basescan.org/address',
  },
  84532: {
    name: 'Base Sepolia',
    explorerTx: 'https://sepolia.basescan.org/tx',
    explorerAddr: 'https://sepolia.basescan.org/address',
  },
};

const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '') as `0x${string}` | '';

function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
        ok
          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
          : 'bg-rose-500/15 text-rose-300 border border-rose-400/30',
      ].join(' ')}
    >
      <span className={['h-2 w-2 rounded-full', ok ? 'bg-emerald-400' : 'bg-rose-400'].join(' ')} />
      {children}
    </span>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const connectedChainId = useChainId();
  const { isConnected } = useAccount();

  const chainMeta = CHAIN_MAP[connectedChainId] || {
    name: `Chain ${connectedChainId || '—'}`,
    explorerTx: '#',
    explorerAddr: '#',
  };
  const expectedMeta = CHAIN_MAP[EXPECTED_CHAIN_ID] || CHAIN_MAP[8453];
  const onExpected = connectedChainId === EXPECTED_CHAIN_ID;

  const stakingShort = useMemo(
    () => (STAKING ? `${STAKING.slice(0, 6)}…${STAKING.slice(-4)}` : '—'),
    []
  );

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className="hover:text-amber-300 transition-colors duration-200"
      onClick={() => setOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      {/* Subtle gold line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[1px] h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.7), transparent)' }}
      />

      {/* Main bar */}
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="relative block h-12 w-12 md:h-14 md:w-14">
            <Image src="/logo.png" alt="Base Gold" fill className="object-contain" priority />
          </span>
          <span className="hidden sm:inline font-semibold tracking-wide text-lg">
            <span className="text-[#0AA0FF]">BASE</span> <span className="text-amber-300">GOLD</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/90">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/stake">Stake Claim</NavLink>
          <NavLink href="/positions">Vaults</NavLink>
          <NavLink href="/claim">Claim</NavLink>
          <NavLink href="/status">Status</NavLink>
          <NavLink href="/how-to">How-to</NavLink>
          <NavLink href="/how-it-works">Mechanics</NavLink>
          <NavLink href="/terms">Terms</NavLink>
        </nav>

        {/* Desktop connect */}
        <div className="hidden md:block">
          <ConnectButton />
        </div>

        {/* Mobile menu toggle */}
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 hover:bg-white/15"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Live Chain Status strip */}
      <div className="border-t border-white/10 bg-black/70">
        <div className="mx-auto max-w-6xl px-4 py-2 text-xs text-white/80 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Pill ok={onExpected}>
              {onExpected ? `Connected: ${chainMeta.name}` : `Wrong Network: ${chainMeta.name}`}
            </Pill>
            {!onExpected && (
              <span className="text-rose-300/90">
                Switch to <strong>{expectedMeta.name}</strong> to stake.
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-white/60">
              Expected: <strong className="text-white/90">{expectedMeta.name}</strong>
            </span>
            <span className="text-white/60">
              Staking:{' '}
              {STAKING ? (
                <Link
                  href={`${expectedMeta.explorerAddr}/${STAKING}`}
                  target="_blank"
                  className="text-amber-300 underline decoration-amber-300/40 hover:text-amber-200"
                >
                  {stakingShort}
                </Link>
              ) : (
                '—'
              )}
            </span>
            <span className="text-white/60">
              Wallet: <strong className="text-white/90">{isConnected ? 'Connected' : 'Disconnected'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (hidden on desktop) */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 z-50 w-72 transform transition-transform duration-300 border-l border-white/10 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } bg-[#0a0a0a]/95 backdrop-blur-md`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="relative block h-10 w-10">
              <Image src="/logo.png" alt="BGLD" fill sizes="40px" className="object-contain" />
            </span>
            <span className="font-semibold text-amber-300">BASE GOLD</span>
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 hover:bg-white/15"
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
            ['/positions', 'Vaults'],
            ['/claim', 'Claim'],
            ['/status', 'Status'],
            ['/how-to', 'How-to'],
            ['/how-it-works', 'Mechanics'],
            ['/terms', 'Terms'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="py-3 border-b border-white/10 hover:text-amber-300 transition-colors"
            >
              {label}
            </Link>
          ))}

          <div className="px-1 pt-4">
            <ConnectButton />
          </div>
        </nav>
      </div>

      {/* Backdrop for drawer (hidden on desktop) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}
