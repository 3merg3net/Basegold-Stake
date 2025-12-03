'use client';

import { useMemo } from 'react';
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';
import { formatUnits } from 'viem';
import { useBgldPrice } from '@/hooks/useBgldPrice';

/* ───────── ENV ───────── */
const env = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim().toLowerCase(),
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase(),
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'),
};

/* ───────── Minimal staking ABI ───────── */
const STAKING_ABI: any = [
  // views
  {
    type: 'function',
    name: 'positionsOf',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'positions',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'start', type: 'uint64' },
      { name: 'lastCompoundAt', type: 'uint64' },
      { name: 'daysLocked', type: 'uint32' },
      { name: 'autoCompound', type: 'bool' },
      { name: 'closed', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'pendingRewards',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [
      { name: 'vested', type: 'uint256' },
      { name: 'total', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'principalExitFeeBps',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ type: 'uint32' }],
  },

  // actions
  {
    type: 'function',
    name: 'compound',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'emergencyExit',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'setAutoCompound',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'id', type: 'uint256' },
      { name: 'enabled', type: 'bool' },
    ],
    outputs: [],
  },
];

/* ───────── Local APR / term helpers (mirror V1 contract logic) ───────── */
// V1 defaults: 10% → 1200% in basis points
const APR_MIN_BPS = 10 * 100;
const APR_MAX_BPS = 1200 * 100;

function aprForDaysLocal(daysLocked: number): number {
  if (daysLocked <= 1) return APR_MIN_BPS;
  if (daysLocked >= 30) return APR_MAX_BPS;
  const minApr = APR_MIN_BPS;
  const maxApr = APR_MAX_BPS;
  const apr =
    minApr + ((maxApr - minApr) * (daysLocked - 1)) / (30 - 1);
  return Math.round(apr);
}

function termSecondsForDaysLocal(daysLocked: number): number {
  const d = Math.max(1, Math.min(30, Math.floor(daysLocked)));
  return d * 86400;
}

/* ───────── helpers ───────── */
function fmtNum(n?: number, digits = 2) {
  if (!Number.isFinite(n!)) return '—';
  if (Math.abs(n!) >= 1) {
    return n!.toLocaleString(undefined, {
      maximumFractionDigits: digits,
    });
  }
  return Number(n!).toPrecision(6);
}

function fmtBgld(v: bigint | undefined, decimals = 18, digits = 4) {
  if (v == null) return '0';
  const num = Number(formatUnits(v, decimals));
  return fmtNum(num, digits);
}

function moneyFmt(n?: number, digits = 2) {
  if (!Number.isFinite(n!)) return '—';
  return n!.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  });
}

function secsToDHMS(secsNum: number) {
  if (!Number.isFinite(secsNum) || secsNum <= 0) return '0d 0h';
  const d = Math.floor(secsNum / 86400);
  const h = Math.floor((secsNum % 86400) / 3600);
  const m = Math.floor((secsNum % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`;
}

/* ───────── Component ───────── */
export default function VaultsPanel({ className }: { className?: string }) {
  const { address } = useAccount();
  const enabled = Boolean(address && env.STAKING);
  const priceUsd = useBgldPrice();

  const toUsd = (bgld: bigint, decimals = 18) => {
    if (!priceUsd) return undefined;
    const num = Number(formatUnits(bgld, decimals));
    return num * priceUsd;
  };

  // 1) IDs
  const {
    data: idsData,
    refetch: refetchIds,
    isLoading: idsLoading,
    isFetching: idsFetching,
  } = useReadContracts({
    allowFailure: true,
    contracts: enabled
      ? [
          {
            abi: STAKING_ABI,
            address: env.STAKING as `0x${string}`,
            functionName: 'positionsOf',
            args: [address as `0x${string}`],
          },
        ]
      : [],
    query: {
      enabled,
      refetchInterval: 15000,
      staleTime: 10000,
    },
  });

  const idList = (idsData?.[0]?.result as bigint[] | undefined) ?? [];

  // 2) reads for each id (positions + pendingRewards + fee)
  const posContracts = useMemo(() => {
    if (!enabled || idList.length === 0) return [];
    const c: any[] = [];
    for (const id of idList) {
      c.push({
        abi: STAKING_ABI,
        address: env.STAKING as `0x${string}`,
        functionName: 'positions',
        args: [id],
      });
      c.push({
        abi: STAKING_ABI,
        address: env.STAKING as `0x${string}`,
        functionName: 'pendingRewards',
        args: [id],
      });
      c.push({
        abi: STAKING_ABI,
        address: env.STAKING as `0x${string}`,
        functionName: 'principalExitFeeBps',
        args: [id],
      });
    }
    return c;
  }, [enabled, idList]);

  const {
    data: posReads,
    refetch: refetchPos,
    isLoading: posLoading,
    isFetching: posFetching,
  } = useReadContracts({
    allowFailure: true,
    contracts: posContracts,
    query: {
      enabled: enabled && posContracts.length > 0,
      refetchInterval: 15000,
      staleTime: 10000,
    },
  });

  // Rows
  type Row = {
    id: bigint;
    amount: bigint;
    start: bigint;
    daysLocked: number;
    autoCompound: boolean;
    closed: boolean;
    vested: bigint;
    total: bigint;
    exitFeeBps: number;
  };

  const rows: Row[] = useMemo(() => {
    if (!posReads || idList.length === 0) return [];
    const out: Row[] = [];
    for (let i = 0; i < idList.length; i++) {
      const id = idList[i];
      const posTuple = posReads[i * 3]?.result as
        | [string, bigint, bigint, bigint, number, boolean, boolean]
        | undefined;
      const prTuple = posReads[i * 3 + 1]?.result as
        | [bigint, bigint]
        | undefined;
      const feeBps = posReads[i * 3 + 2]?.result as number | undefined;
      if (!posTuple) continue;

      const amount = posTuple[1];
      const start = posTuple[2];
      const daysLocked = posTuple[4];
      const autoCompound = posTuple[5];
      const closed = posTuple[6];

      const vested = prTuple?.[0] ?? 0n;
      const total = prTuple?.[1] ?? 0n;

      out.push({
        id,
        amount,
        start,
        daysLocked,
        autoCompound,
        closed,
        vested,
        total,
        exitFeeBps: typeof feeBps === 'number' ? feeBps : 0,
      });
    }
    return out.sort((a, b) => Number(b.id - a.id));
  }, [posReads, idList]);

  // hide closed/empty
  const visibleRows = useMemo(
    () => rows.filter((r) => !r.closed && r.amount > 0n),
    [rows],
  );

  // Totals for header
  const totals = useMemo(() => {
    if (!visibleRows.length) {
      return {
        count: 0,
        principalBgld: 0n,
        vestedBgld: 0n,
        totalBgld: 0n,
        principalUsd: null as number | null,
        totalUsd: null as number | null,
      };
    }

    let principalBgld = 0n;
    let vestedBgld = 0n;
    let totalBgld = 0n;

    for (const r of visibleRows) {
      principalBgld += r.amount;
      vestedBgld += r.vested;
      totalBgld += r.total;
    }

    let principalUsd: number | null = null;
    let totalUsd: number | null = null;

    if (priceUsd) {
      principalUsd = Number(formatUnits(principalBgld, 18)) * priceUsd;
      totalUsd = Number(formatUnits(totalBgld, 18)) * priceUsd;
    }

    return {
      count: visibleRows.length,
      principalBgld,
      vestedBgld,
      totalBgld,
      principalUsd,
      totalUsd,
    };
  }, [visibleRows, priceUsd]);

  const { writeContractAsync } = useWriteContract();

  async function doAction(
    fn: 'compound' | 'withdraw' | 'emergencyExit',
    id: bigint,
  ) {
    const tx = await writeContractAsync({
      abi: STAKING_ABI,
      address: env.STAKING as `0x${string}`,
      functionName: fn,
      args: [id],
      chainId: env.CHAIN_ID,
    });
    setTimeout(() => {
      refetchPos();
      refetchIds();
    }, 1500);
    return tx;
  }

  async function toggleAuto(id: bigint, enabledFlag: boolean) {
    const tx = await writeContractAsync({
      abi: STAKING_ABI,
      address: env.STAKING as `0x${string}`,
      functionName: 'setAutoCompound',
      args: [id, enabledFlag],
      chainId: env.CHAIN_ID,
    });
    setTimeout(() => {
      refetchPos();
    }, 1500);
    return tx;
  }

  const loading = enabled && (idsLoading || idsFetching || posLoading || posFetching);

  /* ───────── Empty / loading states ───────── */
  if (!enabled) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-white/12 bg-black/50 p-5 text-white/70">
          Connect wallet to view your vaults.
        </div>
      </div>
    );
  }

  if (loading && !visibleRows.length) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-white/12 bg-black/50 p-5 text-white/70 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-amber-200">
              Scanning Base for your vaults…
            </div>
            <div className="text-xs text-white/50 mt-1">
              Reading positions directly from the staking contract. This may take a few seconds if you have many vaults.
            </div>
          </div>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!loading && idList.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-white/12 bg-black/50 p-5 text-white/70">
          No vaults yet. Stake BGLD to open your first vault.
        </div>
      </div>
    );
  }

  /* ───────── Cards ───────── */
  return (
    <div className={className}>
      {/* My Vault Totals header */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-amber-300/30 bg-black/50 px-3 py-3">
          <div className="text-[11px] uppercase tracking-wider text-white/60">
            Open Vaults
          </div>
          <div className="mt-0.5 text-lg font-semibold text-amber-200 tabular-nums">
            {totals.count}
          </div>
        </div>

        <div className="rounded-xl border border-amber-300/30 bg-black/50 px-3 py-3">
          <div className="text-[11px] uppercase tracking-wider text-white/60">
            Principal Staked
          </div>
          <div className="mt-0.5 text-sm font-semibold text-amber-200 tabular-nums">
            {fmtBgld(totals.principalBgld, 18, 2)} BGLD
          </div>
          <div className="text-[11px] text-white/50">
            {totals.principalUsd != null ? moneyFmt(totals.principalUsd, 0) : '—'}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-300/30 bg-black/50 px-3 py-3">
          <div className="text-[11px] uppercase tracking-wider text-white/60">
            Vested Rewards
          </div>
          <div className="mt-0.5 text-sm font-semibold text-emerald-200 tabular-nums">
            {fmtBgld(totals.vestedBgld, 18, 2)} BGLD
          </div>
        </div>

        <div className="hidden md:block rounded-xl border border-white/15 bg-black/50 px-3 py-3">
          <div className="text-[11px] uppercase tracking-wider text-white/60">
            Data Refresh
          </div>
          <div className="mt-0.5 text-sm font-semibold text-white/80">
            Live from Base
          </div>
          <div className="text-[11px] text-white/45">
            Updates ~ every 15s
          </div>
        </div>
      </div>

      {/* Vault cards */}
      <div className="space-y-5">
        {visibleRows.map((r) => {
          const aprBps = aprForDaysLocal(r.daysLocked);
          const termSec = BigInt(termSecondsForDaysLocal(r.daysLocked));

          const now = BigInt(Math.floor(Date.now() / 1000));
          const end = r.start + termSec;
          const remainingSec = end > now ? Number(end - now) : 0;
          const termSecNum = Number(termSec);
          const elapsed = Math.max(0, termSecNum - remainingSec);
          const progress =
            termSecNum > 0
              ? Math.min(100, Math.floor((elapsed / termSecNum) * 100))
              : 0;

          return (
            <div
              key={String(r.id)}
              className="rounded-2xl border border-white/12 bg-black/50 p-5 shadow-[0_0_24px_rgba(212,175,55,0.05)]"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-white/70">
                  <span className="text-white/90">
                    Vault #{String(r.id)}
                  </span>
                  <span className="mx-2 text-white/40">•</span>
                  <span className="text-white/60">
                    Lock {r.daysLocked}d
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
                    APR{' '}
                    {(aprBps / 100).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                    %
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${
                      r.autoCompound
                        ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                        : 'border-white/15 bg-white/5 text-white/70'
                    }`}
                  >
                    {r.autoCompound ? 'Auto-Compound ON' : 'Auto-Compound OFF'}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background:
                      'linear-gradient(90deg, rgba(212,175,55,0.25), rgba(212,175,55,0.8))',
                  }}
                />
              </div>
              <div className="mt-1 flex flex-col sm:flex-row sm:justify-between text-[11px] text-white/50 gap-1">
                <span>
                  Started:{' '}
                  {new Date(Number(r.start) * 1000).toLocaleString()}
                </span>
                <span>
                  Ends:{' '}
                  {new Date(Number(end) * 1000).toLocaleString()}
                </span>
              </div>

              {/* Metrics grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Metric
                  label="Principal"
                  value={`${fmtBgld(r.amount, 18, 4)} BGLD${
                    priceUsd ? ` · ${moneyFmt(toUsd(r.amount)!, 2)}` : ''
                  }`}
                />
                <Metric
                  label="Vested Rewards"
                  value={`${fmtBgld(r.vested, 18, 4)} BGLD${
                    priceUsd ? ` · ${moneyFmt(toUsd(r.vested)!, 2)}` : ''
                  }`}
                />
                <Metric
                  label="Total Rewards"
                  value={`${fmtBgld(r.total, 18, 4)} BGLD${
                    priceUsd ? ` · ${moneyFmt(toUsd(r.total)!, 2)}` : ''
                  }`}
                />
                <Metric
                  label="Exit Fee (now)"
                  value={`${(r.exitFeeBps / 100).toFixed(2)}%`}
                />
                <Metric
                  label="Remaining"
                  value={secsToDHMS(remainingSec)}
                />
                <Metric
                  label="Status"
                  value={r.closed ? 'Closed' : 'Active'}
                />

                {/* Inline disclaimer (fills the blank area on the right) */}
                <div className="col-span-2 sm:col-span-2 rounded-xl border border-white/10 bg-black/40 p-3">
                  <p className="text-[11px] leading-relaxed text-white/55">
                    <span className="text-white/70 font-semibold">
                      Reminder:
                    </span>{' '}
                    Early exit applies a decaying penalty from
                    <span className="text-amber-200"> 10%</span> down to{' '}
                    <span className="text-amber-200">1%</span> as maturity
                    approaches. Withdrawals at maturity incur a{' '}
                    <span className="text-amber-200">2%</span> fee on
                    principal + vested rewards. Manual compound (every
                    24h) and Auto-Compound (every 48h) each incur a{' '}
                    <span className="text-amber-200">1%</span> protocol fee
                    and restart the lock.
                  </p>
                </div>
              </div>

              {/* Actions */}
              {!r.closed && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => doAction('compound', r.id)}
                    className="rounded-xl px-3 py-2 border border-amber-400 text-amber-200 bg-black/40 hover:bg-amber-300/10"
                  >
                    Compound
                  </button>
                  <button
                    onClick={() => doAction('withdraw', r.id)}
                    className="rounded-xl px-3 py-2 border border-emerald-400 text-emerald-200 bg-black/40 hover:bg-emerald-400/10"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => doAction('emergencyExit', r.id)}
                    className="rounded-xl px-3 py-2 border border-red-400 text-red-200 bg-black/40 hover:bg-red-400/10"
                  >
                    Emergency Exit
                  </button>

                  <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={r.autoCompound}
                      onChange={(e) =>
                        toggleAuto(r.id, e.target.checked)
                      }
                    />
                    <span className="text-white/80">Auto-Compound</span>
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── Small metric pill ───────── */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/12 bg-black/40 p-3">
      <div className="text-[11px] uppercase tracking-wider text-white/60 truncate">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-amber-200 tabular-nums truncate">
        {value}
      </div>
    </div>
  );
}
