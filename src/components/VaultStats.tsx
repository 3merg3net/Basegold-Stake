'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { TrendingUp, FileStack, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

/* ---------------- ENV ---------------- */

const STAKING =
  (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase();

const RPC =
  (process.env.NEXT_PUBLIC_RPC_URL ||
    process.env.NEXT_PUBLIC_BASE_RPC ||
    'https://mainnet.base.org').trim();

const client = createPublicClient({ transport: http(RPC) });

/* --------------- ABI --------------- */

const POSITION_COUNT_CANDIDATES = [
  'nextId',
  'positionId',
  'positionsCount',
  'totalPositions',
] as const;

/* ---------------- helpers ---------------- */

function money(n?: number | null, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  });
}

function num(n?: number | null, digits = 0) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

/* --------------- Card --------------- */

const Card = ({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="relative rounded-2xl border border-amber-300/25 bg-black/40 backdrop-blur-md p-5 overflow-hidden"
  >
    <div
      className="absolute -inset-1 opacity-20 blur-2xl pointer-events-none"
      style={{
        background:
          'radial-gradient(400px 120px at 50% -10%, rgba(212,175,55,.25), transparent)',
      }}
      aria-hidden
    />

    <div className="relative flex items-start gap-3">
      <div className="p-2 rounded-xl border border-amber-300/30 text-amber-300">
        {icon}
      </div>

      <div className="flex-1">
        <div className="text-sm text-white/70">{title}</div>
        <div className="text-2xl font-semibold text-amber-300">{value}</div>
        {sub && <div className="text-xs text-white/60 mt-1">{sub}</div>}
      </div>
    </div>
  </motion.div>
);

/* --------------- Component --------------- */

export default function VaultStats() {
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [marketCap, setMarketCap] = useState<number | null>(null);
  const [totalPositions, setTotalPositions] = useState<bigint | null>(null);

  /* -------- price / market cap -------- */

  useEffect(() => {
    let alive = true;

    const tick = async () => {
      try {
        const r = await fetch('/api/bgld-dex', { cache: 'no-store' });
        const j = await r.json();

        if (!alive) return;

        setPriceUsd(j?.priceUsd ?? null);
        setMarketCap(j?.fdv ?? null); // using fdv from Dexscreener
      } catch {
        if (alive) {
          setPriceUsd(null);
          setMarketCap(null);
        }
      }
    };

    tick();
    const id = setInterval(tick, 30000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  /* -------- positions -------- */

  useEffect(() => {
    let alive = true;
    if (!STAKING) return;

    (async () => {
      try {
        let pos: bigint | null = null;

        for (const name of POSITION_COUNT_CANDIDATES) {
          try {
            const probeAbi = [
              {
                type: 'function',
                name,
                stateMutability: 'view',
                inputs: [],
                outputs: [{ type: 'uint256' }],
              },
            ] as const;

            const val = await client.readContract({
              address: STAKING as `0x${string}`,
              abi: probeAbi,
              functionName: name as any,
            });

            if (typeof val === 'bigint') {
              pos = val;
              break;
            }

            if (typeof val === 'number') {
              pos = BigInt(val);
              break;
            }
          } catch {}
        }

        if (alive) setTotalPositions(pos);
      } catch {
        if (alive) setTotalPositions(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        <Card
          title="Market Cap"
          value={marketCap != null ? money(marketCap, 0) : '—'}
          sub="via Dexscreener"
          icon={<TrendingUp size={18} />}
        />

        <Card
          title="Total Vault Positions"
          value={totalPositions != null ? num(Number(totalPositions), 0) : '—'}
          sub="Recorded vault entries"
          icon={<FileStack size={18} />}
        />

        <Card
          title="BGLD Price (USD)"
          value={priceUsd != null ? money(priceUsd, 6) : '—'}
          sub="via Dexscreener"
          icon={<DollarSign size={18} />}
        />

      </div>
    </section>
  );
}