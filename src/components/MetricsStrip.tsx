'use client';

import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import ERC20_ABI from '@/lib/abis/ERC20';
import STAKING_ABI from '@/lib/abis/BaseGoldStaking';
import { BGLD_DECIMALS, BGLD_SYMBOL, aprForDays } from '@/lib/constants';

const TOKEN   = (process.env.NEXT_PUBLIC_BGLD_ADDRESS    || '').toLowerCase() as `0x${string}`;
const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').toLowerCase() as `0x${string}`;

function fmtToken(v: bigint | undefined, decimals = 18, maxFrac = 2) {
  try {
    if (v === undefined) return '—';
    const s = formatUnits(v, decimals);
    const [i, f = ''] = s.split('.');
    const frac = f.slice(0, maxFrac);
    const int = Number(i);
    const intStr = Number.isFinite(int) ? int.toLocaleString() : i;
    return frac ? `${intStr}.${frac}` : intStr;
  } catch { return '—'; }
}

function fmtBps(bps?: bigint | number) {
  if (bps === undefined) return '—';
  const n = typeof bps === 'bigint' ? Number(bps) : bps;
  return (n / 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%';
}

export default function MetricsStrip({
  className = '',
  showYourCount = false,
}: {
  className?: string;
  showYourCount?: boolean;
}) {
  const { address } = useAccount();

  const { data: tvl = 0n } = useReadContract({
    abi: ERC20_ABI,
    address: TOKEN,
    functionName: 'balanceOf',
    args: STAKING ? [STAKING] : undefined,
    query: { enabled: !!TOKEN && !!STAKING },
  });

  const batchReads = useReadContracts({
    allowFailure: true,
    contracts: [
      { abi: STAKING_ABI as any, address: STAKING, functionName: 'nextId' },
      { abi: STAKING_ABI as any, address: STAKING, functionName: 'aprMinBps' },
      { abi: STAKING_ABI as any, address: STAKING, functionName: 'aprMaxBps' },
      ...(address && showYourCount
        ? [{ abi: STAKING_ABI as any, address: STAKING, functionName: 'positionsOf', args: [address] }]
        : []),
    ],
    query: { enabled: !!STAKING },
  });

  const { totalPositions, minBps, maxBps, userCount } = useMemo(() => {
    const rows = batchReads.data || [];
    let i = 0;

    const nextId = rows[i++]?.result as bigint | undefined;
    const min    = rows[i++]?.result as bigint | undefined;
    const max    = rows[i++]?.result as bigint | undefined;

    let myCount: number | undefined;
    if (address && showYourCount) {
      const ids = rows[i++]?.result as bigint[] | undefined;
      myCount = ids ? ids.length : 0;
    }

    return {
      totalPositions: nextId ? (nextId > 0n ? nextId - 1n : 0n) : 0n,
      minBps: min,
      maxBps: max,
      userCount: myCount,
    };
  }, [batchReads.data, address, showYourCount]);

  const aprMinLabel = minBps ? fmtBps(minBps) : `${aprForDays(1)}%`;
  const aprMaxLabel = maxBps ? fmtBps(maxBps) : `${aprForDays(30)}%`;

  return (
    <div className={`rounded-2xl border border-white/10 bg-black/40 p-4 ${className}`}>
      <div className="mb-3 text-sm font-semibold text-amber-300">Vault Metrics</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <KV label="Vault Balance (TVL)" value={`${fmtToken(tvl, BGLD_DECIMALS, 2)} ${BGLD_SYMBOL}`} />
        <KV label="APR Range" value={`${aprMinLabel} → ${aprMaxLabel}`} />
        <KV label="Total Positions" value={Number(totalPositions).toLocaleString()} />
        {showYourCount && <KV label="Your Active Vaults" value={userCount !== undefined ? String(userCount) : '—'} />}
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-[11px] uppercase tracking-wider text-white/60 truncate">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-amber-200 tabular-nums truncate">{value}</div>
    </div>
  );
}
