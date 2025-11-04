// src/components/StatusClient.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';

// ---------- ENV ----------
const env = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim().toLowerCase(),
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase(),
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'),
};

// ---------- Minimal ABIs (views only) ----------
const ERC20_ABI: any = [
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
];

const STAKING_ABI: any = [
  { type: 'function', name: 'bgldBalance', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'aprMinBps', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'aprMaxBps', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'withdrawFeeBps', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'compoundFeeBps', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'maxPrincipalFeeBps', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'compoundThrottle', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'autoCompoundInterval', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'aprForDays', stateMutability: 'view', inputs: [{ type: 'uint32' }], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'positionsOf', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256[]' }] },
];

// ---------- helpers ----------
function numFmt(n?: number, digits = 2) {
  if (!Number.isFinite(n!)) return '—';
  if (Math.abs(n!) >= 1) return n!.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n!).toPrecision(6);
}
function moneyFmt(n?: number, digits = 0) {
  if (!Number.isFinite(n!)) return '—';
  return n!.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: digits });
}
function fmtPct(bps?: number) {
  if (!Number.isFinite(bps!)) return '—';
  return (bps! / 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%';
}
function fmtBgld(v?: bigint, decimals = 18, digits = 2) {
  if (v == null) return '0';
  return numFmt(Number(formatUnits(v, decimals)), digits);
}
function secsToLabel(secs?: number) {
  if (!Number.isFinite(secs!)) return '—';
  const d = Math.floor((secs as number) / 86400);
  const h = Math.floor(((secs as number) % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

// ---------- UI subcomponents ----------
function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-amber-200 tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function MiniGauge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3">
      <svg width="42" height="42" viewBox="0 0 42 42" className="shrink-0">
        <circle cx="21" cy="21" r="18" fill="none" stroke="currentColor" opacity="0.15" strokeWidth="6" />
        <circle cx="21" cy="21" r="18" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="113" strokeDashoffset="20" />
      </svg>
      <div>
        <div className="text-xs text-white/60">{label}</div>
        <div className="text-sm font-semibold text-amber-200">{value}</div>
      </div>
    </div>
  );
}

// ---------- Main ----------
export default function StatusClient() {
  const { address } = useAccount();
  const enabled = Boolean(env.STAKING && env.BGLD);

  // price (Dexscreener via API route)
  const [priceUsd, setPriceUsd] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    (async () => {
      try {
        const res = await fetch('/api/bgld-price', { signal: controller.signal, cache: 'no-store' });
        clearTimeout(id);
        if (!res.ok) throw new Error('price http');
        const j = await res.json();
        if (mounted) setPriceUsd(j?.usd ?? null);
      } catch {
        clearTimeout(id);
        if (mounted) setPriceUsd(null);
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // reads
  const { data: reads } = useReadContracts({
    allowFailure: true,
    contracts: !enabled ? [] : [
      { abi: ERC20_ABI, address: env.BGLD as `0x${string}`, functionName: 'decimals' },
      { abi: ERC20_ABI, address: env.BGLD as `0x${string}`, functionName: 'totalSupply' },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'bgldBalance' },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'aprMinBps' },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'aprMaxBps' },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'withdrawFeeBps' },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'compoundFeeBps' },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'maxPrincipalFeeBps' },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'compoundThrottle' },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'autoCompoundInterval' },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'aprForDays', args: [7] },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'aprForDays', args: [14] },
      { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'aprForDays', args: [30] },
      address ? { abi: STAKING_ABI, address: env.STAKING as `0x${string}`, functionName: 'positionsOf', args: [address as `0x${string}`] } : undefined,
    ].filter(Boolean) as any[],
  });

  // unpack
  const bgldDecimals = (reads?.[0]?.result as number | undefined) ?? 18;
  const totalSupply  = (reads?.[1]?.result as bigint | undefined) ?? 0n;
  const tvlBgld      = (reads?.[2]?.result as bigint | undefined) ?? 0n;
  const aprMinBps    = (reads?.[3]?.result as number | undefined) ?? undefined;
  const aprMaxBps    = (reads?.[4]?.result as number | undefined) ?? undefined;
  const withdrawBps  = (reads?.[5]?.result as number | undefined) ?? undefined;
  const compoundBps  = (reads?.[6]?.result as number | undefined) ?? undefined;
  const maxExitBps   = (reads?.[7]?.result as number | undefined) ?? undefined;
  const throttleSec  = (reads?.[8]?.result as number | undefined) ?? undefined;
  const autoIntSec   = (reads?.[9]?.result as number | undefined) ?? undefined;
  const apr7         = (reads?.[10]?.result as number | undefined) ?? undefined;
  const apr14        = (reads?.[11]?.result as number | undefined) ?? undefined;
  const apr30        = (reads?.[12]?.result as number | undefined) ?? undefined;
  const userIds      = (reads?.[13]?.result as bigint[] | undefined) ?? [];

  // USD numbers (only if price present)
  const tvlUsd = useMemo(() => {
    if (!priceUsd) return undefined;
    try {
      const tvl = Number(formatUnits(tvlBgld, bgldDecimals));
      return tvl * priceUsd;
    } catch {
      return undefined;
    }
  }, [tvlBgld, bgldDecimals, priceUsd]);

  const mcapUsd = useMemo(() => {
    if (!priceUsd) return undefined;
    try {
      const supply = Number(formatUnits(totalSupply, bgldDecimals));
      return supply * priceUsd;
    } catch {
      return undefined;
    }
  }, [totalSupply, bgldDecimals, priceUsd]);

  const pctOfSupplyStaked = useMemo(() => {
    if (totalSupply === 0n) return undefined;
    try {
      const ratio = Number(tvlBgld) / Number(totalSupply);
      return (ratio * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%';
    } catch {
      return undefined;
    }
  }, [tvlBgld, totalSupply]);

  // Narrative (added “digital gold reserve” ethos)
  const blurb = (
    <>
      <span className="text-amber-300">BGLD is the digital gold reserve on Base</span>. Supply lives fully on-chain,
      issuance is transparent, and the vault mechanic rewards committed holders. As TVL grows, the reserve deepens:
      more BGLD sits in long-dated vaults, compounding into principal and reinforcing liquidity. Terms are short and
      flexible (1–30 days) with clear APRs, linear vesting, and an optional auto-compound that keeps your position
      working without micromanagement. Your wallet, your vault, your yield.
    </>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-black/40 to-black/20 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-amber-200">Protocol Status</h1>
            <p className="mt-2 text-white/70">{blurb}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>Base Chain</Pill>
              <Pill>Non-custodial</Pill>
              <Pill>Auto-Compound Optional</Pill>
              <Pill>1–30 Day Terms</Pill>
              {priceUsd ? <Pill>Price: {moneyFmt(priceUsd, priceUsd >= 1 ? 2 : 6)}</Pill> : null}
            </div>
          </div>

          {/* Infographic cluster */}
          <div className="grid grid-cols-2 gap-3 min-w-[260px]">
            <MiniGauge label="APR (7d)" value={fmtPct(apr7)} />
            <MiniGauge label="APR (14d)" value={fmtPct(apr14)} />
            <MiniGauge label="APR (30d)" value={fmtPct(apr30)} />
            <MiniGauge label="APR Range" value={`${fmtPct(aprMinBps)}–${fmtPct(aprMaxBps)}`} />
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Metric
          label="TVL (BGLD in Vaults)"
          value={`${fmtBgld(tvlBgld, bgldDecimals, 2)} BGLD`}
          sub={
            tvlUsd !== undefined
              ? `${moneyFmt(tvlUsd, tvlUsd >= 1 ? 0 : 2)} approx${pctOfSupplyStaked ? ` · ${pctOfSupplyStaked} of supply` : ''}`
              : pctOfSupplyStaked ? `${pctOfSupplyStaked} of supply` : undefined
          }
        />
        <Metric
          label="Market Cap (approx)"
          value={mcapUsd !== undefined ? moneyFmt(mcapUsd, mcapUsd >= 1 ? 0 : 2) : '—'}
          sub={mcapUsd !== undefined ? 'Supply × Price' : undefined}
        />
        <Metric label="Supply" value={`${fmtBgld(totalSupply, bgldDecimals, 0)} BGLD`} sub="Token totalSupply()" />
        <Metric label="Your Open Vaults" value={address ? userIds.length.toString() : '—'} sub={address ? 'Positions in your wallet' : 'Connect wallet to view'} />
        <Metric label="Withdraw Fee" value={fmtPct(withdrawBps)} sub="On principal + rewards at maturity" />
        <Metric label="Compound Fee" value={fmtPct(compoundBps)} sub="On vested rewards when compounding" />
        <Metric label="Max Early Exit Fee" value={fmtPct(maxExitBps)} sub="Decays linearly to 0% by maturity" />
        <Metric label="Manual Compound Cooldown" value={secsToLabel(throttleSec)} sub="Minimum time between compounds" />
        <Metric label="Auto-Compound Interval" value={secsToLabel(autoIntSec)} sub="Earliest auto compound time" />
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6">
        <div className="text-amber-200 font-semibold text-lg">Staking is live</div>
        <p className="mt-1 text-white/70">
          Choose your term, enable auto-compound if you like, and grow your position on-chain. Rewards vest linearly—exit early anytime with a decaying principal fee.
        </p>
        <div className="mt-4">
          <a
            href="/stake"
            className="inline-block rounded-xl border border-emerald-400 text-emerald-200 px-5 py-2 bg-black/40"
          >
            Go to Staking
          </a>
        </div>
      </div>
    </div>
  );
}
