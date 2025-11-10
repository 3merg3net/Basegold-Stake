'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, DollarSign, Droplets, TrendingUp } from 'lucide-react';

/* ---------- helpers ---------- */
function money(n?: number, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  });
}
function num(n?: number, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n).toPrecision(digits + 2);
}

/* ---------- reusable metric card ---------- */
const MetricCard = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: 'up' | 'down' | 'neutral';
}) => {
  const accentRing =
    accent === 'up'
      ? 'ring-emerald-400/50'
      : accent === 'down'
      ? 'ring-red-400/50'
      : 'ring-amber-300/40';

  const accentBg =
    accent === 'up'
      ? 'border-emerald-400/30 bg-emerald-400/10'
      : accent === 'down'
      ? 'border-red-400/30 bg-red-400/10'
      : 'border-amber-300/30 bg-black/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`relative rounded-2xl border ${accentBg} px-6 py-5 overflow-hidden backdrop-blur-md ring-1 ${accentRing}`}
    >
      {/* gold glow wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 opacity-25 blur-2xl"
        style={{
          background:
            'radial-gradient(420px 140px at 50% -10%, rgba(212,175,55,.28), transparent)',
        }}
      />
      <div className="relative flex items-start gap-4">
        {/* icon medallion */}
        <div className="shrink-0 grid place-items-center h-12 w-12 rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-300/15 to-amber-300/5 text-amber-300 shadow-[inset_0_0_12px_rgba(212,175,55,0.15)]">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.12em] text-white/70">
            {label}
          </div>
          <div className="mt-1 text-2xl md:text-3xl font-extrabold text-amber-200 tabular-nums leading-none">
            {value}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ---------- main component ---------- */
export default function MetricsStrip({ className = '' }: { className?: string }) {
  const [data, setData] = useState<{
    ok?: boolean;
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
        if (mounted && j) setData(j);
      } catch {/* noop */}
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const price = data?.priceUsd ?? null;
  const change = data?.change24h ?? 0;
  const liquidity = data?.liquidityUsd ?? 0;
  const volume24h = data?.volume24h ?? 0;

  // Market cap from supply * price (fallback to FDV if supply not set)
  const mc =
    price != null && supply > 0 ? price * supply : (data?.fdv ?? null);

  return (
    <section className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <MetricCard
        label="$BGLD Market Cap"
        value={mc == null ? '—' : money(mc, 0)}
        icon={<Coins size={22} />}
      />
      <MetricCard
        label="$BGLD Price"
        value={price == null ? '—' : money(price, 6)}
        icon={<DollarSign size={22} />}
      />
      <MetricCard
        label="$BGLD Liquidity"
        value={money(liquidity, 0)}
        icon={<Droplets size={22} />}
      />
      <MetricCard
        label="$BGLD 24H Change"
        value={`${num(change, 2)}%`}
        icon={<TrendingUp size={22} />}
        accent={change >= 0 ? 'up' : 'down'}
      />
    </section>
  );
}
