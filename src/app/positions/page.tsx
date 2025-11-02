'use client';

import { useMemo } from 'react';
import { useAccount, usePublicClient, useReadContract, useReadContracts } from 'wagmi';
import STAKING_ABI from '@/lib/abis/BaseGoldStaking';
import ERC20_ABI from '@/lib/abis/ERC20';
import UNIV3_POOL_ABI from '@/lib/abis/UniswapV3Pool'; // ensure you have a minimal ABI: slot0(), token0(), token1()
import CHAINLINK_AGG_ABI from '@/lib/abis/ChainlinkAggregatorV3';
import { formatUnits } from 'viem';
import { aprForDays, BGLD_DECIMALS, BGLD_SYMBOL } from '@/lib/constants';
import CompactMetricsRibbon from '@/components/CompactMetricsRibbon';

const TOKEN    = (process.env.NEXT_PUBLIC_BGLD_ADDRESS    || '').toLowerCase() as `0x${string}`;
const STAKING  = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').toLowerCase() as `0x${string}`;
const POOL     = (process.env.NEXT_PUBLIC_UNIV3_POOL      || '').toLowerCase() as `0x${string}`;
const FEED     = (process.env.NEXT_PUBLIC_CHAINLINK_FEED  || '').toLowerCase() as `0x${string}`;

type Position = {
  id: bigint;
  owner: `0x${string}`;
  amount: bigint;
  start: bigint;
  daysLocked: number;
  autoCompound: boolean;
  closed: boolean;
};

function unwrap<T = unknown>(x: any): T | undefined {
  if (x && typeof x === 'object' && 'result' in x) return x.result as T;
  return x as T;
}

function toLower(addr?: unknown): `0x${string}` | undefined {
  return typeof addr === 'string' ? (addr.toLowerCase() as `0x${string}`) : undefined;
}

function fmt(bi?: bigint, decimals = 18, maxFrac = 2) {
  if (bi == null) return '-';
  try {
    const s = formatUnits(bi, decimals);
    const [i, f = ''] = s.split('.');
    const frac = f.slice(0, maxFrac);
    const int = Number(i);
    const intStr = Number.isFinite(int) ? int.toLocaleString() : i;
    return frac ? `${intStr}.${frac}` : intStr;
  } catch {
    return '-';
  }
}

function formatDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function VaultsPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  // IDs owned by user
  const { data: idsData } = useReadContract({
    abi: STAKING_ABI,
    address: STAKING,
    functionName: 'positionsOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!STAKING },
  });
  const ids = useMemo<bigint[]>(() => (Array.isArray(idsData) ? (idsData as bigint[]) : []), [idsData]);

  // Batch: pool + feed reads (slot0, token0, token1, latestRoundData, decimals)
  const { data: poolAndFeed } = useReadContracts({
    allowFailure: true,
    contracts: [
      POOL ? { abi: UNIV3_POOL_ABI, address: POOL, functionName: 'slot0' } : undefined,
      POOL ? { abi: UNIV3_POOL_ABI, address: POOL, functionName: 'token0' } : undefined,
      POOL ? { abi: UNIV3_POOL_ABI, address: POOL, functionName: 'token1' } : undefined,
      FEED ? { abi: CHAINLINK_AGG_ABI, address: FEED, functionName: 'latestRoundData' } : undefined,
      FEED ? { abi: CHAINLINK_AGG_ABI, address: FEED, functionName: 'decimals' } : undefined,
    ].filter(Boolean) as any,
    query: { enabled: !!POOL || !!FEED },
  });

  // Safely unwrap
  const slot0        = unwrap<any>(poolAndFeed?.[0]);
  const token0Addr   = toLower(unwrap<string>(poolAndFeed?.[1]));
  const token1Addr   = toLower(unwrap<string>(poolAndFeed?.[2]));
  const roundData    = unwrap<any>(poolAndFeed?.[3]); // { answer, updatedAt, ... }
  const feedDecimals = (unwrap<number>(poolAndFeed?.[4]) ?? 8);

  // Vault TVL (BGLD held by staking contract)
  const { data: tvlBgld = 0n } = useReadContract({
    abi: ERC20_ABI,
    address: TOKEN,
    functionName: 'balanceOf',
    args: STAKING ? [STAKING] : undefined,
    query: { enabled: !!TOKEN && !!STAKING },
  });

  // Positions details
  const reads = useMemo(() => {
    if (!ids.length) return [];
    const calls: any[] = [];
    for (const id of ids) {
      calls.push(
        { abi: STAKING_ABI, address: STAKING, functionName: 'positions', args: [id] },
        { abi: STAKING_ABI, address: STAKING, functionName: 'pendingRewards', args: [id] },
        { abi: STAKING_ABI, address: STAKING, functionName: 'principalExitFeeBps', args: [id] },
      );
    }
    return calls;
  }, [ids]);

  const { data: batchData } = useReadContracts({
    allowFailure: false,
    contracts: reads as any,
    query: { enabled: reads.length > 0 },
  });

  const rows = useMemo(() => {
    if (!ids.length) return [];
    const out: Array<{
      id: bigint;
      pos: Position;
      vested: bigint;
      totalRewards: bigint;
      exitFeeBps: bigint;
    }> = [];
    let i = 0;
    for (const id of ids) {
      const posRaw = unwrap<any>(batchData?.[i++]);
      const rewRaw = unwrap<[bigint, bigint]>(batchData?.[i++]);
      const feeRaw = unwrap<bigint>(batchData?.[i++]);

      const pos: Position = {
        id,
        owner: posRaw?.[0],
        amount: posRaw?.[1] ?? 0n,
        start: posRaw?.[2] ?? 0n,
        daysLocked: Number(posRaw?.[3] ?? 0),
        autoCompound: Boolean(posRaw?.[4]),
        closed: Boolean(posRaw?.[5]),
      };

      const vested = rewRaw?.[0] ?? 0n;
      const totalRewards = rewRaw?.[1] ?? 0n;
      const exitFeeBps = feeRaw ?? 0n;

      out.push({ id, pos, vested, totalRewards, exitFeeBps });
    }
    return out.sort((a, b) => Number(b.id - a.id));
  }, [ids, batchData]);

  // Derive a human price if both pool + feed are wired (optional; we still render values even if price = "-")
  const priceInfo = useMemo(() => {
    const priceStr = (() => {
      const answer = roundData?.answer as bigint | undefined;
      if (!answer) return '-';
      try {
        // chainlink feed typically answers in 8 decimals
        const num = Number(formatUnits(answer, feedDecimals));
        if (!isFinite(num) || num <= 0) return '-';
        return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      } catch { return '-'; }
    })();
    return { token0Addr, token1Addr, priceStr };
  }, [roundData, feedDecimals, token0Addr, token1Addr]);

  return (
    <div className="space-y-6">
      {/* Metrics strip for the page */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="Vault BGLD" value={`${fmt(tvlBgld, BGLD_DECIMALS, 2)} ${BGLD_SYMBOL}`} />
          <Metric label="Pool token0" value={token0Addr || '-'} />
          <Metric label="Pool token1" value={token1Addr || '-'} />
          <Metric label="ETH Price" value={priceInfo.priceStr} />
        </div>
      </div>
       <CompactMetricsRibbon />

      {/* User vaults */}
      {!address ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-white/70">
          Connect your wallet to view your vaults.
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
          <div className="mb-3 text-sm font-semibold text-amber-300">Your Vaults</div>

          {rows.length === 0 && <div className="text-sm text-white/60">No active vaults yet.</div>}

          <div className="space-y-4">
            {rows.map(({ id, pos, vested, totalRewards, exitFeeBps }) => {
              const now = Math.floor(Date.now() / 1000);
              const elapsed = Math.max(0, now - Number(pos.start));
              const termSecs = pos.daysLocked * 86400;
              const mature = elapsed >= termSecs;
              const apr = aprForDays(pos.daysLocked);

              return (
                <div key={String(id)} className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-widest text-white/60">Vault ID</div>
                      <div className="text-lg font-semibold text-amber-300">#{id.toString()}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* action buttons are in your other component; keep this page metrics-only if you prefer */}
                      <span className="text-xs text-white/50">
                        {pos.closed ? 'Closed' : 'Open'} • {mature ? 'Mature' : `Matures in ${formatDuration(termSecs - elapsed)}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Metric label="Principal" value={`${fmt(pos.amount, BGLD_DECIMALS, 2)} ${BGLD_SYMBOL}`} />
                    <Metric label="Term" value={`${pos.daysLocked}d`} />
                    <Metric label="APR" value={`${apr}%`} />
                    <Metric label="Vested Now" value={`${fmt(vested, BGLD_DECIMALS, 2)} ${BGLD_SYMBOL}`} />
                    <Metric label="Rewards @ Maturity" value={`${fmt(totalRewards, BGLD_DECIMALS, 2)} ${BGLD_SYMBOL}`} />
                    <Metric label="Exit Fee Now" value={`${(Number(exitFeeBps) / 100).toFixed(2)}%`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/40 p-3">
      <div className="text-[11px] uppercase tracking-wider text-white/60 truncate">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-amber-200 tabular-nums truncate">{value}</div>
    </div>
  );
}
