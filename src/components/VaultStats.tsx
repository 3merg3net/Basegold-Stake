'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { Coins, TrendingUp, Layers, FileStack, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

/* ---------------- ENV ---------------- */
const BGLD =
  (process.env.NEXT_PUBLIC_BGLD_ADDRESS ||
    process.env.NEXT_PUBLIC_BGLD_CA ||
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    ''
  ).trim().toLowerCase();

const STAKING =
  (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase();

const RPC =
  (process.env.NEXT_PUBLIC_RPC_URL ||
    process.env.NEXT_PUBLIC_BASE_RPC ||
    'https://mainnet.base.org').trim();

const client = createPublicClient({ transport: http(RPC) });

/* --------------- ABIs (read-only) --------------- */
const ERC20_ABI = [
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

const STAKING_ABI = [
  { type: 'function', name: 'bgldBalance', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

const POSITION_COUNT_CANDIDATES = [
  'nextId',
  'positionId',
  'positionsCount',
  'totalPositions',
] as const;

/* ---------------- helpers ---------------- */
function money(n?: number | null, digits = 0) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: digits });
}
function fmtToken(bi?: bigint | null, decimals = 18, digits = 2) {
  if (bi == null) return '—';
  const n = Number(formatUnits(bi, decimals));
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
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
        {sub ? <div className="text-xs text-white/60 mt-1">{sub}</div> : null}
      </div>
    </div>
  </motion.div>
);

/* --------------- Component --------------- */
export default function VaultStats() {
  const [decimals, setDecimals] = useState<number>(18);
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
  const [tvlBgld, setTvlBgld] = useState<bigint | null>(null);
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [totalPositions, setTotalPositions] = useState<bigint | null>(null);

  // price via existing endpoint
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch('/api/bgld-dex', { cache: 'no-store' });
        const j = await r.json();
        if (alive) setPriceUsd(j?.priceUsd ?? null);
      } catch {
        if (alive) setPriceUsd(null);
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // ERC20 reads
  useEffect(() => {
    let alive = true;
    if (!BGLD) return;
    (async () => {
      try {
        const [dec, supply] = await Promise.all([
          client.readContract({ address: BGLD as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' }),
          client.readContract({ address: BGLD as `0x${string}`, abi: ERC20_ABI, functionName: 'totalSupply' }),
        ]);
        if (alive) {
          setDecimals(Number(dec as number));
          setTotalSupply(supply as bigint);
        }
      } catch {
        if (alive) {
          setDecimals(18);
          setTotalSupply(null);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  // staking TVL + total positions
  useEffect(() => {
    let alive = true;
    if (!STAKING) return;
    (async () => {
      try {
        let tvl: bigint | null = null;
        try {
          const res = await client.readContract({
            address: STAKING as `0x${string}`,
            abi: STAKING_ABI,
            functionName: 'bgldBalance',
          });
          tvl = res as bigint;
        } catch { tvl = null; }

        // Probe total positions
        let pos: bigint | null = null;
        for (const name of POSITION_COUNT_CANDIDATES) {
          try {
            const probeAbi = [{ type: 'function', name, stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }] as const;
            const val = await client.readContract({
              address: STAKING as `0x${string}`,
              abi: probeAbi,
              functionName: name as any,
            });
            if (typeof val === 'bigint') { pos = val; break; }
            if (typeof val === 'number') { pos = BigInt(val); break; }
          } catch {}
        }

        if (alive) {
          setTvlBgld(tvl);
          setTotalPositions(pos);
        }
      } catch {
        if (alive) {
          setTvlBgld(null);
          setTotalPositions(null);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  // derived
  const mcUsd = useMemo(() => {
    if (!priceUsd || totalSupply == null) return null;
    const supply = Number(formatUnits(totalSupply, decimals));
    return supply * priceUsd;
  }, [totalSupply, decimals, priceUsd]);

  const tvlUsd = useMemo(() => {
    if (!priceUsd || tvlBgld == null) return null;
    const tvl = Number(formatUnits(tvlBgld, decimals));
    return tvl * priceUsd;
  }, [tvlBgld, decimals, priceUsd]);

  const circSupply = useMemo(() => {
    if (totalSupply == null || tvlBgld == null) return null;
    const diff = totalSupply - tvlBgld;
    return diff < 0n ? 0n : diff;
  }, [totalSupply, tvlBgld]);

  // approximate protocol fee pool (2% of vault TVL)
  const feePoolUsd = useMemo(() => {
    return tvlUsd ? tvlUsd * 0.02 : null;
  }, [tvlUsd]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      {/* Top row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card
          title="Vault TVL"
          value={tvlBgld != null ? `${fmtToken(tvlBgld, decimals, 2)} BGLD` : '—'}
          sub={tvlUsd != null ? `${money(tvlUsd, tvlUsd >= 1 ? 0 : 2)} est.` : '—'}
          icon={<Coins size={18} />}
        />
        <Card
          title="Market Cap"
          value={mcUsd != null ? money(mcUsd, mcUsd >= 1 ? 0 : 2) : '—'}
          sub="Supply × Price"
          icon={<TrendingUp size={18} />}
        />
        <Card
          title="Total Supply"
          value={totalSupply != null ? `${fmtToken(totalSupply, decimals, 0)} BGLD` : '—'}
          sub="ERC-20 totalSupply()"
          icon={<Layers size={18} />}
        />
      </div>

      {/* Second row — populated extras */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card
          title="Circulating (approx)"
          value={circSupply != null ? `${fmtToken(circSupply, decimals, 0)} BGLD` : '—'}
          sub={circSupply != null && priceUsd != null
            ? money(Number(formatUnits(circSupply, decimals)) * priceUsd, 0) + ' est.'
            : '—'}
          icon={<Layers size={18} />}
        />
        <Card
          title="Total Stakes (positions)"
          value={totalPositions != null ? num(Number(totalPositions), 0) : '—'}
          sub="Active vault positions"
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
