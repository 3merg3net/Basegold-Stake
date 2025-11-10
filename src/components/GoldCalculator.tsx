// src/components/GoldCalculator.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  mode?: 'compact' | 'full';
  /** Demo presets for compact mode (BGLD amounts). Default: [1M, 5M, 10M, 20M] */
  demoPresets?: number[];
  /** Autoplay interval ms for compact mode. Default: 6000ms */
  autoCycleMs?: number;
  className?: string;
};

function money(n?: number, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: digits });
}
function num(n?: number, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n).toPrecision(6);
}

export default function GoldCalculator({
  mode = 'full',
  demoPresets,
  autoCycleMs,
}: Props) {
  // Pull live price via the same endpoint your Metrics use: /api/bgld-dex
  const [priceUsd, setPriceUsd] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();
    const load = async () => {
      try {
        const r = await fetch('/api/bgld-dex', { signal: ctrl.signal, cache: 'no-store' });
        const j = await r.json();
        if (!alive) return;
        if (j?.ok) setPriceUsd(j.priceUsd ?? null);
      } catch {
        if (alive) setPriceUsd(null);
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      alive = false;
      ctrl.abort();
      clearInterval(id);
    };
  }, []);

  // Inputs
  const [amountBgld, setAmountBgld] = useState<string>('1000000'); // 1M default
  const [days, setDays] = useState<number>(7); // default lock
  const [apr, setApr] = useState<number>(250); // default mid APR

  // Compact demo cycling for big-stacker vibe
  const presets = demoPresets ?? [1_000_000, 5_000_000, 10_000_000, 20_000_000];
  const cycleMs = Math.max(3000, autoCycleMs ?? 6000);
  const idxRef = useRef(0);

  useEffect(() => {
    if (mode !== 'compact') return;
    const id = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % presets.length;
      setAmountBgld(String(presets[idxRef.current]));
    }, cycleMs);
    return () => clearInterval(id);
  }, [mode, cycleMs, presets]);

  // Calcs
  const amount = Number(amountBgld) || 0;
  const aprPct = Math.max(0, apr);
  const dailyRate = aprPct / 100 / 365;

  const estRewardsBgld = useMemo(() => {
    // simple linear vest for preview (not compounding)
    return amount * dailyRate * days;
  }, [amount, dailyRate, days]);

  const worthNowUsd =
    priceUsd != null ? amount * priceUsd : undefined;
  const rewardsUsd =
    priceUsd != null ? estRewardsBgld * priceUsd : undefined;

  // UI
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={mode === 'compact'
      ? 'rounded-2xl border border-amber-300/30 bg-black/60 p-4'
      : 'rounded-2xl border border-amber-300/30 bg-black/50 p-5 md:p-6'}>
      {children}
    </div>
  );

  return (
    <Wrapper>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-white/70">
          <span className="font-semibold text-amber-300">BGLD Reward Vault Simulator</span>{' '}
          <span className="text-white/50">· live price via Dexscreener</span>
        </div>
        {priceUsd != null && (
          <div className="text-xs text-white/60">
            Live BGLD Price:{' '}
            <span className="text-amber-200 font-semibold">
              ${priceUsd.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 8 })}
            </span>
          </div>
        )}
      </div>

      {/* Inputs */}
      <div className={mode === 'compact' ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-2 md:grid-cols-3 gap-3'}>
        <Field label="Amount (BGLD)">
          <input
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-amber-100"
            inputMode="numeric"
            value={amountBgld}
            onChange={(e) => setAmountBgld(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="1,000,000"
          />
          {worthNowUsd != null && (
            <div className="mt-1 text-[11px] text-white/50">≈ {money(worthNowUsd, 2)}</div>
          )}
        </Field>

        <Field label="Lock (days)">
          <input
            type="range"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 text-[11px] text-white/50">Selected: {days} day(s)</div>
        </Field>

        <Field label="APR (%)">
          <input
            type="number"
            min={1}
            max={1200}
            step={1}
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-amber-100"
            placeholder="e.g. 250"
          />
          <div className="mt-1 text-[11px] text-white/50">Range ~10% → 1200%</div>
        </Field>
      </div>

      {/* Output */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label="Est. Rewards (BGLD)" value={num(estRewardsBgld, 2)} highlight />
        <Stat label="Est. Rewards (USD)" value={money(rewardsUsd, 2)} />
        <Stat label="Daily Rate" value={`${num(dailyRate * 100, 4)}%`} />
      </div>

      <div className="mt-3 text-[11px] text-white/50">
        Estimates only. Manual compound (24h) and Auto-Compound (48h) each incur a 1% protocol fee; compounding restarts the lock.
      </div>
    </Wrapper>
  );
}

/* ───────── small UI helpers ───────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="text-[11px] uppercase tracking-wider text-white/60 mb-1">{label}</div>
      {children}
    </div>
  );
}
function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? 'border-amber-300/40 bg-amber-300/10' : 'border-white/10 bg-black/40'}`}>
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-amber-200 tabular-nums">{value}</div>
    </div>
  );
}
