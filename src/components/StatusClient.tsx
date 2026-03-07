'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MetricsStrip from '@/components/MetricsStrip';
import VaultStats from '@/components/VaultStats';

const SUPPLY = Number(process.env.NEXT_PUBLIC_BGLD_SUPPLY || '1000000000');
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
          Current protocol status, live market references, and migration updates for the
          <span className="text-amber-300 font-semibold"> Base Gold Reserve</span>.
        </p>
      </header>

      {/* ===== Migration status banner ===== */}
      <section className="mb-8">
        <div className="rounded-2xl border border-amber-300/30 bg-black/60 px-5 py-5 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
          <div className="text-xs uppercase tracking-wider text-amber-200 font-semibold">
            Current Protocol Notice
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold text-amber-300">
            V1 Vault Interactions Are Temporarily Paused
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/75 leading-relaxed">
            The Base Gold Reserve is transitioning from the original V1 vault system to a more
            sustainable V2 architecture. Existing V1 balances remain recorded onchain while the
            protocol completes its migration planning and publishes the next steps.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <NoticePill
              title="V1 Status"
              value="Paused in UI"
              tone="amber"
            />
            <NoticePill
              title="Balances"
              value="Visible Onchain"
              tone="blue"
            />
            <NoticePill
              title="Next Phase"
              value="V2 Migration"
              tone="emerald"
            />
          </div>
        </div>
      </section>

      {/* ===== Live refs ===== */}
      <section className="mb-8">
        <div className="mb-3 text-xs sm:text-sm text-white/60 text-center">
          Live market references and visible vault data from Base Gold contracts.
        </div>
        <MetricsStrip />
        <div className="mt-6">
          <VaultStats />
        </div>
      </section>

      {/* ===== Status Grid ===== */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-amber-300 mb-2 text-center">
          Protocol Health Snapshot
        </h2>
        <p className="text-white/60 text-center mb-4 text-sm">
          Current market references and general protocol indicators
        </p>
        <StatusStats />
      </section>

      {/* ===== Migration / protocol cards ===== */}
      <section className="grid gap-6 md:grid-cols-2 mb-12">
        <MigrationStatusCard />
        <AddressesCard bgld={BGLD_CA} staking={STAKING_CA} />
      </section>

      {/* ===== Static protocol references ===== */}
      <section className="grid gap-6 md:grid-cols-2 mb-12">
        <ProtocolSettingsCard />
        <ResourcesCard />
      </section>

      {/* ===== Closing block ===== */}
      <section className="rounded-2xl border border-amber-300/25 bg-black/50 px-6 py-6 shadow-[0_0_24px_rgba(212,175,55,0.08)] text-center">
        <h3 className="text-lg font-semibold text-amber-300 mb-2">
          Reserve Outlook
        </h3>
        <p className="text-white/75 leading-relaxed">
          The current focus is to complete the V1 transition responsibly and prepare a healthier
          long-term reserve structure through V2. Updates will continue to be published here as the
          migration path is finalized.
        </p>
      </section>
    </main>
  );
}

/* ------------ Status grid ------------ */

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
        const res = await fetch('/api/bgld-dex', {
          signal: ctrl.signal,
          cache: 'no-store',
        });
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

  const mc = price != null && SUPPLY > 0 ? price * SUPPLY : fdv || null;

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

/* ------------ Migration / status cards ------------ */

function MigrationStatusCard() {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
      <h3 className="text-lg font-semibold text-amber-300 mb-2">Migration Status</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <KV label="V1 Interface Status">Paused</KV>
        <KV label="V1 Balances">Visible Onchain</KV>
        <KV label="Current Focus">Liquidity Review</KV>
        <KV label="Next Phase">V2 Vault Migration</KV>
      </div>
      <div className="mt-3 text-sm text-white/70 leading-relaxed">
        Existing V1 positions remain visible through the Vaults page while the protocol finalizes
        migration mechanics, updated reserve design, and rollout details.
      </div>
    </div>
  );
}

function ProtocolSettingsCard() {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
      <h3 className="text-lg font-semibold text-amber-300 mb-2">Protocol References</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <KV label="Vault Generation">Legacy V1</KV>
        <KV label="Target Upgrade">V2 In Progress</KV>
        <KV label="Chain">Base (8453)</KV>
        <KV label="Market Tracking">Live</KV>
      </div>
      <div className="mt-3 text-sm text-white/70 leading-relaxed">
        Status messaging reflects the current migration phase rather than active V1 participation.
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
        <KV label="Staking Vault (V1)">
          <code className="text-amber-100 break-all">{staking}</code>
        </KV>
      </div>
    </div>
  );
}

function ResourcesCard() {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
      <h3 className="text-lg font-semibold text-amber-300 mb-2">Resources</h3>
      <div className="space-y-2 text-sm">
        <Link href="/positions" className="block underline text-amber-300">
          View Existing Vaults
        </Link>
        <Link href="/how-it-works" className="block underline text-amber-300">
          Mechanics / Whitepaper
        </Link>
        <Link href="/terms" className="block underline text-amber-300">
          Terms
        </Link>
        <Link href="/" className="block underline text-amber-300">
          Return Home
        </Link>
      </div>
    </div>
  );
}

function NoticePill({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: 'amber' | 'blue' | 'emerald';
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-300/30 bg-amber-300/10 text-amber-200'
      : tone === 'blue'
      ? 'border-blue-400/30 bg-blue-400/10 text-blue-200'
      : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';

  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClass}`}>
      <div className="text-[11px] uppercase tracking-wider opacity-75">{title}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
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
  return n.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  });
}

function pct(n?: number, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}