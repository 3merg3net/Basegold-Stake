// src/components/VaultsPanel.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';
import { formatUnits } from 'viem';

// --- ENV ---
const env = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim().toLowerCase(),
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase(),
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'),
};

// --- Minimal staking ABI for everything this panel needs ---
const STAKING_ABI: any = [
  // view getters
  {
    type: 'function',
    name: 'positionsOf',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
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
    name: 'aprForDays',
    stateMutability: 'view',
    inputs: [{ name: 'daysLocked', type: 'uint32' }],
    outputs: [{ name: '', type: 'uint32' }],
  },
  {
    type: 'function',
    name: 'termSeconds',
    stateMutability: 'pure',
    inputs: [{ name: 'daysLocked', type: 'uint32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'principalExitFeeBps',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint32' }],
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

// --- helpers (BigInt-safe) ---
function fmtNum(n?: number, digits = 2) {
  if (!Number.isFinite(n!)) return '—';
  if (Math.abs(n!) >= 1) return n!.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n!).toPrecision(6);
}
function fmtBgld(v: bigint | undefined, decimals = 18, digits = 4) {
  if (v == null) return '0';
  const num = Number(formatUnits(v, decimals));
  return fmtNum(num, digits);
}
function toNumber(bi?: bigint) {
  if (bi == null) return undefined;
  return Number(bi);
}
function secsToDHMS(secsNum: number) {
  if (!Number.isFinite(secsNum) || secsNum <= 0) return '0d 0h';
  const d = Math.floor(secsNum / 86400);
  const h = Math.floor((secsNum % 86400) / 3600);
  const m = Math.floor((secsNum % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`;
}

export default function VaultsPanel({ className }: { className?: string }) {
  const { address, chainId } = useAccount();
  const enabled = Boolean(address && env.STAKING);

  // 1) fetch IDs
  const { data: idsData, refetch: refetchIds } = useReadContracts({
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
    query: { enabled },
  });

  const idList = (idsData?.[0]?.result as bigint[] | undefined) ?? [];

  // 2) batch reads for each id
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
  }, [enabled, idList, env.STAKING]);

  const aprTermContracts = useMemo(() => {
    if (!enabled || idList.length === 0) return [];
    // fetch aprForDays & termSeconds for 1..30 (cheap) and index them
    const c: any[] = [];
    for (let d = 1; d <= 30; d++) {
      c.push({
        abi: STAKING_ABI,
        address: env.STAKING as `0x${string}`,
        functionName: 'aprForDays',
        args: [d],
      });
      c.push({
        abi: STAKING_ABI,
        address: env.STAKING as `0x${string}`,
        functionName: 'termSeconds',
        args: [d],
      });
    }
    return c;
  }, [enabled, idList.length, env.STAKING]);

  const { data: posReads, refetch: refetchPos } = useReadContracts({
    allowFailure: true,
    contracts: posContracts,
    query: { enabled: enabled && posContracts.length > 0 },
  });

  const { data: aprTermReads } = useReadContracts({
    allowFailure: true,
    contracts: aprTermContracts,
    query: { enabled: enabled && aprTermContracts.length > 0 },
  });

  // Build quick lookup for apr/term by days
  const aprByDays = useMemo(() => {
    const map = new Map<number, number>();
    if (!aprTermReads) return map;
    for (let d = 1; d <= 30; d++) {
      const aprIdx = (d - 1) * 2; // aprForDays first of each pair
      const aprVal = aprTermReads?.[aprIdx]?.result as number | undefined;
      if (typeof aprVal === 'number') map.set(d, aprVal);
    }
    return map;
  }, [aprTermReads]);

  const termByDays = useMemo(() => {
    const map = new Map<number, bigint>();
    if (!aprTermReads) return map;
    for (let d = 1; d <= 30; d++) {
      const termIdx = (d - 1) * 2 + 1; // termSeconds second of each pair
      const termVal = aprTermReads?.[termIdx]?.result as bigint | undefined;
      if (typeof termVal === 'bigint') map.set(d, termVal);
    }
    return map;
  }, [aprTermReads]);

  // Unpack positions into rows
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
    // posReads groups: for each ID we requested (positions, pendingRewards, principalExitFeeBps)
    for (let i = 0; i < idList.length; i++) {
      const id = idList[i];

      const posTuple = posReads[i * 3]?.result as
        | [string, bigint, bigint, bigint, number, boolean, boolean]
        | undefined;

      const prTuple = posReads[i * 3 + 1]?.result as [bigint, bigint] | undefined;

      const feeBps = posReads[i * 3 + 2]?.result as number | undefined;

      if (!posTuple) continue;

      const owner = posTuple[0];
      const amount = posTuple[1];
      const start = posTuple[2]; // uint64 -> bigint
      // const lastCompoundAt = posTuple[3]; // not used for now
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
    // newest first
    return out.sort((a, b) => Number(b.id - a.id));
  }, [posReads, idList]);

  // ✅ NEW: filter out closed or zero-amount vaults (keeps your UI/logic intact)
  const visibleRows = useMemo(() => {
    return rows.filter((r) => {
      try {
        const amt = (r as any).amount ?? 0n;
        const closed = Boolean((r as any).closed);
        return !closed && amt > 0n;
      } catch {
        return false;
      }
    });
  }, [rows]);

  // actions
  const { writeContractAsync } = useWriteContract();

  async function doAction(fn: 'compound' | 'withdraw' | 'emergencyExit', id: bigint) {
    const tx = await writeContractAsync({
      abi: STAKING_ABI,
      address: env.STAKING as `0x${string}`,
      functionName: fn,
      args: [id],
      chainId: env.CHAIN_ID,
    });
    // light refresh
    setTimeout(() => {
      refetchPos();
      refetchIds();
    }, 1500);
    return tx;
  }
  async function toggleAuto(id: bigint, enabled: boolean) {
    const tx = await writeContractAsync({
      abi: STAKING_ABI,
      address: env.STAKING as `0x${string}`,
      functionName: 'setAutoCompound',
      args: [id, enabled],
      chainId: env.CHAIN_ID,
    });
    setTimeout(() => {
      refetchPos();
    }, 1500);
    return tx;
  }

  // UI
  if (!enabled) {
    return (
      <div className={className}>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-white/70">
          Connect wallet to view your vaults.
        </div>
      </div>
    );
  }

  if (idList.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-white/70">
          No vaults yet. Stake BGLD to open your first vault.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {visibleRows.map((r) => {
          const aprBps = aprByDays.get(r.daysLocked) ?? 0; // uint32 bps
          const termSec = termByDays.get(r.daysLocked) ?? 0n;

          // remaining calculations (all BigInt-safe)
          const now = BigInt(Math.floor(Date.now() / 1000));
          const end = r.start + termSec;
          const remainingSec = end > now ? Number(end - now) : 0;

          return (
            <div
              key={String(r.id)}
              className="rounded-2xl border border-white/10 bg-black/50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-white/60">Vault #{String(r.id)}</div>
                <div className="text-xs text-white/50">
                  Term: {r.daysLocked}d · APR:{' '}
                  {(aprBps / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Metric label="Principal" value={`${fmtBgld(r.amount, 18, 4)} BGLD`} />
                <Metric label="Vested Rewards" value={`${fmtBgld(r.vested, 18, 4)} BGLD`} />
                <Metric label="Total Rewards" value={`${fmtBgld(r.total, 18, 4)} BGLD`} />
                <Metric label="Exit Fee (now)" value={`${(r.exitFeeBps / 100).toFixed(2)}%`} />
                <Metric label="Started" value={new Date(Number(r.start) * 1000).toLocaleString()} />
                <Metric label="Ends" value={new Date(Number(end) * 1000).toLocaleString()} />
                <Metric label="Remaining" value={secsToDHMS(remainingSec)} />
                <Metric label="Status" value={r.closed ? 'Closed' : 'Active'} />
              </div>

              {!r.closed && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => doAction('compound', r.id)}
                    className="rounded-xl px-3 py-2 border border-amber-400 text-amber-200 bg-black/40"
                  >
                    Compound
                  </button>
                  <button
                    onClick={() => doAction('withdraw', r.id)}
                    className="rounded-xl px-3 py-2 border border-emerald-400 text-emerald-200 bg-black/40"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => doAction('emergencyExit', r.id)}
                    className="rounded-xl px-3 py-2 border border-red-400 text-red-200 bg-black/40"
                  >
                    Emergency Exit
                  </button>

                  <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={r.autoCompound}
                      onChange={(e) => toggleAuto(r.id, e.target.checked)}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="text-[11px] uppercase tracking-wider text-white/60 truncate">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-amber-200 tabular-nums truncate">{value}</div>
    </div>
  );
}
