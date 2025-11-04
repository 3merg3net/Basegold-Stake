'use client';

import { useEffect, useState } from 'react';

function money(n?: number, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: digits });
}
function num(n?: number, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n).toPrecision(6);
}

export default function MetricsStrip({ className = '' }: { className?: string }) {
  const [data, setData] = useState<{
    priceUsd: number | null;
    change24h: number;
    liquidityUsd: number;
    volume24h: number;
    fdv: number;
  } | null>(null);

  const supply = Number(process.env.NEXT_PUBLIC_BGLD_SUPPLY || '0') || 0;

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/bgld-dex', { signal: controller.signal, cache: 'no-store' });
        const j = await res.json();
        if (mounted && j?.ok) setData(j);
      } catch {
        /* noop */
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const price = data?.priceUsd ?? null;
  const change = data?.change24h ?? 0;
  const liquidity = data?.liquidityUsd ?? 0;

  // Market cap from supply * price (preferred), falls back to FDV if no supply set
  const mc =
    price != null && supply > 0
      ? price * supply 
      : (data?.fdv ?? 0) || null;

  const chip = (label: string, value: string, extraClass = '') => (
    <div className={`rounded-2xl border border-white/10 bg-black/40 px-4 py-3 ${extraClass}`}>
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-amber-200 tabular-nums">{value}</div>
    </div>
  );

  return (
  <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
    {/* Market Cap first */}
    {chip('Market Cap', mc == null ? '—' : money(mc, 0))}

    {/* Price second */}
    {chip('Price', price == null ? '—' : money(price, 6))}

    {/* Liquidity third */}
    {chip('Liquidity', money(liquidity, 0))}

    {/* 24H Change last — color-coded */}
    {chip(
      '24H Change',
      `${num(change, 2)}%`,
      change >= 0 ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 font-bold text-lg' : 'border-red-400/30 bg-red-400/10 text-red-300 font-bold text-lg'
    )}
  </div>
);

}
  