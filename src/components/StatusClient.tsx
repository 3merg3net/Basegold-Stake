// src/components/StatusClient.tsx
'use client';

import { useEffect, useState } from 'react';
import GoldCalculator from '@/components/GoldCalculator';
import Link from 'next/link';
import MetricsStrip from '@/components/MetricsStrip';
import VaultStats from '@/components/VaultStats';

const SUPPLY = Number(process.env.NEXT_PUBLIC_BGLD_SUPPLY || '1000000000'); // for MC calc
const BGLD_CA =
  process.env.NEXT_PUBLIC_BGLD_CA ||
  process.env.NEXT_PUBLIC_BGLD_ADDRESS ||
  '0x...';
const STAKING_CA = process.env.NEXT_PUBLIC_STAKING_ADDRESS || '0x...';

export default function StatusClient() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-6xl mx-auto text-white">
      {/* ===== Hero ===== */}
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-amber-300">
          Base Gold — Protocol Status
        </h1>
        <p className="mt-3 text-white/75 max-w-3xl mx-auto leading-relaxed">
          Live health of the <span className="text-amber-300 font-semibold">Reserve Vault</span> on Base.
          Main Base Gold Vault Contract Status
        </p>
      </header>
      <MetricsStrip/>
      <VaultStats/>

      {/* ===== New Status Grid (replaces MetricsStrip) ===== */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-amber-300 mb-2 text-center">Protocol Health Snapshot</h2>
        <p className="text-white/60 text-center mb-4 text-sm">
          BGLD Staking Vault Stats
        </p>
        <StatusStats />
      </section>

      {/* ===== Reserve Pulse (compact calculator) ===== */}
      <section className="max-w-md mx-auto mb-12">
        <div className="rounded-2xl border border-amber-300/30 bg-black/50 px-5 py-5 backdrop-blur shadow-[0_0_24px_rgba(212,175,55,0.08)]">
          <h3 className="text-lg font-semibold text-amber-300 mb-2 text-center">Base Reserve Vault Pulse Simulator</h3>
          <p className="text-white/70 text-center mb-4 text-sm">
            Watch simulated Estimate potential rewards using current Dexscreener pricing.
          </p>
          <GoldCalculator mode="compact" />
          <div className="mt-3 text-center text-xs text-white/50">
            Pricing via Dexscreener · Estimates only
          </div>
        </div>
      </section>

      {/* ===== Protocol Settings (static, no extra APIs) ===== */}
      <section className="grid gap-6 md:grid-cols-2 mb-12">
        <ProtocolSettingsCard />
        <AddressesCard bgld={BGLD_CA} staking={STAKING_CA} />
      </section>

      {/* ===== Closing Confidence Block ===== */}
      <section className="rounded-2xl border border-amber-300/25 bg-black/50 px-6 py-6 shadow-[0_0_24px_rgba(212,175,55,0.08)] text-center">
        <h3 className="text-lg font-semibold text-amber-300 mb-2">Reserve Outlook</h3>
        <p className="text-white/75">
          Staking your BGLD continuously reinforce the vault. Protocol-Owned Liquidity aligns Base Gold
          with long-term stakers — when markets get loud, the Reserve keeps adding weight.
        </p>
      </section>
    </main>
  );
}

/* ------------ Status grid (no new endpoints) ------------ */

function StatusStats() {
  const [data, setData] = useState<{
    priceUsd: number | null;
    change24h: number;
    liquidityUsd: number;
    volume24h: number;
    fdv: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        // Same endpoint MetricsStrip uses
        const res = await fetch('/api/bgld-dex', { signal: ctrl.signal, cache: 'no-store' });
        const j = await res.json();
        if (mounted && j?.ok) setData(j);
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      ctrl.abort();
    };
  }, []);

  const price = data?.priceUsd ?? null;
  const change = data?.change24h ?? 0;
  const liq = data?.liquidityUsd ?? 0;
  const vol = data?.volume24h ?? 0;
  const fdv = data?.fdv ?? 0;

  // Market cap from supply * price (preferred), falls back to FDV if no supply/price
  const mc =
    price != null && SUPPLY > 0 ? price * SUPPLY : fdv || null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <StatCard label="Market Cap" value={money(mc, 0)} />
      <StatCard label="Price" value={price == null ? '—' : money(price, 6)} />
      <StatCard label="Liquidity" value={money(liq, 0)} />
      <StatCard
        label="24h Change"
        value={`${pct(change)}%`}
        className={
          change >= 0
            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 font-bold'
            : 'border-red-400/30 bg-red-400/10 text-red-300 font-bold'
        }
      />
      <StatCard label="24h Volume" value={money(vol, 0)} />
      <StatCard label="FDV" value={money(fdv, 0)} />
      {loading && (
        <div className="col-span-2 md:col-span-3 text-center text-white/50 text-sm py-2">
          Loading live stats…
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black/40 px-4 py-3 ${className}`}>
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-amber-200 tabular-nums">{value}</div>
    </div>
  );
}

/* ------------ Static cards ------------ */

function ProtocolSettingsCard() {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
      <h3 className="text-lg font-semibold text-amber-300 mb-2">Protocol Settings</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <KV label="Compound Fee">1%</KV>
        <KV label="Withdraw Fee (at maturity)">2%</KV>
        <KV label="Manual Compound">Every 24h (restarts lock)</KV>
        <KV label="Auto-Compound">Every 48h (restarts lock)</KV>
        <KV label="APR Range">~10% → 1200%</KV>
        <KV label="Chain">Base (8453)</KV>
      </div>
      <div className="mt-3 text-sm">
        <Link href="/mechanics" className="underline text-amber-300">Full Whitepaper</Link>{' '}
        <span className="text-white/50">·</span>{' '}
        <Link href="/terms" className="underline text-amber-300">Terms</Link>
      </div>
    </div>
  );
}

function AddressesCard({ bgld, staking }: { bgld: string; staking: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
      <h3 className="text-lg font-semibold text-amber-300 mb-2">Contract References</h3>
      <div className="grid gap-3 sm:grid-cols-1">
        <KV label="Token (BGLD)">
          <code className="text-amber-100 break-all">{bgld}</code>
        </KV>
        <KV label="Staking Vault">
          <code className="text-amber-100 break-all">{staking}</code>
        </KV>
      </div>
    </div>
  );
}

/* ------------ small helpers ------------ */

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-amber-200 text-lg font-semibold mt-1">{children}</div>
    </div>
  );
}

function money(n: number | null, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: digits });
}
function pct(n?: number, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}
