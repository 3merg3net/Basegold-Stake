'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from 'wagmi';
import { formatUnits } from 'viem';

import STAKING_ABI from '@/lib/abis/BaseGoldStaking';
import ERC20_ABI from '@/lib/abis/ERC20'; // (unused here but fine to keep if you want to show token labels elsewhere)
import { BGLD_DECIMALS, BGLD_SYMBOL, aprForDays } from '@/lib/constants';

const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').toLowerCase() as `0x${string}`;

type Position = {
  id: bigint;
  owner: `0x${string}`;
  amount: bigint;
  start: bigint;
  daysLocked: number;
  autoCompound: boolean;
  closed: boolean;
};

function abiHasSetAutoCompound(abi: unknown) {
  try {
    const arr = abi as ReadonlyArray<any>;
    return !!arr.find(
      (f) =>
        f?.type === 'function' &&
        f?.name === 'setAutoCompound' &&
        Array.isArray(f?.inputs) &&
        f.inputs.length === 2 &&
        f.inputs[0]?.type?.startsWith('uint') &&
        f.inputs[1]?.type === 'bool'
    );
  } catch {
    return false;
  }
}
const HAS_SET_AUTOCOMPOUND = abiHasSetAutoCompound(STAKING_ABI);

export default function PositionsPanel() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [status, setStatus] = useState<string>('');
  const [busyId, setBusyId] = useState<bigint | null>(null);
  const [togglingId, setTogglingId] = useState<bigint | null>(null);

  // 1) ids for this user
  const { data: idsData, refetch: refetchIds } = useReadContract({
    abi: STAKING_ABI,
    address: STAKING,
    functionName: 'positionsOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!STAKING },
  });

  const ids = useMemo<bigint[]>(
    () => (Array.isArray(idsData) ? (idsData as bigint[]) : []),
    [idsData]
  );

  // 2) batch read positions, pending rewards, exit fee
  const reads = useMemo(() => {
    if (!ids.length) return [];
    const calls: any[] = [];
    for (const id of ids) {
      calls.push(
        { abi: STAKING_ABI, address: STAKING, functionName: 'positions', args: [id] as const },
        { abi: STAKING_ABI, address: STAKING, functionName: 'pendingRewards', args: [id] as const },
        { abi: STAKING_ABI, address: STAKING, functionName: 'principalExitFeeBps', args: [id] as const },
      );
    }
    return calls;
  }, [ids]);

  const { data: batchData, refetch: refetchBatch } = useReadContracts({
    allowFailure: false,
    contracts: reads as any,
    query: { enabled: reads.length > 0 },
  });

  const rows = useMemo(() => {
    if (!ids.length) return [];
    const result: Array<{
      id: bigint;
      pos: Position;
      vested: bigint;
      totalRewards: bigint;
      exitFeeBps: bigint;
    }> = [];

    let i = 0;
    for (const id of ids) {
      const posRaw = batchData?.[i++] as any;
      const rewRaw = batchData?.[i++] as [bigint, bigint] | undefined;
      const feeRaw = batchData?.[i++] as bigint | undefined;

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

      result.push({ id, pos, vested, totalRewards, exitFeeBps });
    }

    // newest first
    return result.sort((a, b) => Number(b.id - a.id));
  }, [ids, batchData]);

  const refetchAll = async () => {
    await Promise.all([refetchIds(), refetchBatch()]);
  };

  // --- core actions ---
  async function perform(
    id: bigint,
    req: { fn: 'withdraw' | 'emergencyExit' | 'compound' }
  ) {
    try {
      setBusyId(id);
      setStatus('');
      const base = {
        abi: STAKING_ABI as unknown as readonly unknown[],
        address: STAKING,
        functionName: req.fn,
        args: [id] as const,
      };

      await publicClient!.simulateContract({ ...base, account: address! });
      const hash = await writeContractAsync({ ...base });
      setStatus(`${req.fn} submitted: ${hash.slice(0, 10)}…`);
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchAll();
      setStatus(`${req.fn} confirmed ✓`);
    } catch (e: any) {
      const msg =
        e?.reason ||
        e?.metaMessages?.join('\n') ||
        e?.shortMessage ||
        e?.message ||
        'Transaction failed';
      setStatus(msg);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleAutoCompound(id: bigint, next: boolean) {
    if (!HAS_SET_AUTOCOMPOUND) return;
    try {
      setTogglingId(id);
      setStatus('');

      const base = {
        abi: STAKING_ABI as unknown as readonly unknown[],
        address: STAKING,
        functionName: 'setAutoCompound',
        args: [id, next] as const,
      };

      await publicClient!.simulateContract({ ...base, account: address! });
      const hash = await writeContractAsync({ ...base });
      setStatus(`setAutoCompound submitted: ${hash.slice(0, 10)}…`);
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchAll();
      setStatus(`Auto-compound ${next ? 'enabled' : 'disabled'} ✓`);
    } catch (e: any) {
      const msg =
        e?.reason ||
        e?.metaMessages?.join('\n') ||
        e?.shortMessage ||
        e?.message ||
        'setAutoCompound failed';
      setStatus(msg);
    } finally {
      setTogglingId(null);
    }
  }

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-white/70">
        Connect your wallet to view your vaults.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
      <div className="mb-3 text-sm font-semibold text-amber-300">Your Vaults</div>

      {rows.length === 0 && (
        <div className="text-sm text-white/60">No active vaults yet.</div>
      )}

      <div className="space-y-4">
        {rows.map(({ id, pos, vested, totalRewards, exitFeeBps }) => {
          const now = Math.floor(Date.now() / 1000);
          const elapsed = Math.max(0, now - Number(pos.start));
          const termSecs = pos.daysLocked * 86400;
          const mature = elapsed >= termSecs;

          const apr = aprForDays(pos.daysLocked);
          const principal = pos.amount;
          const vestedFmt = fmtToken(vested, BGLD_DECIMALS, 2);
          const rewardsFmt = fmtToken(totalRewards, BGLD_DECIMALS, 2);
          const principalFmt = fmtToken(principal, BGLD_DECIMALS, 2);

          const exitFee = (Number(exitFeeBps) / 100).toFixed(2) + '%';
          const maturedIn =
            mature ? 'Mature' : formatDuration(termSecs - elapsed);

          return (
            <div key={String(id)} className="rounded-xl border border-white/10 bg-black/30 p-4">
              {/* Top row: ID + actions (no bleeding) */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-white/60">Vault ID</div>
                  <div className="text-lg font-semibold text-amber-300">#{id.toString()}</div>
                  <div className="mt-1 text-xs text-white/50">
                    {pos.autoCompound ? 'Auto-compound: ON' : 'Auto-compound: OFF'}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {HAS_SET_AUTOCOMPOUND && (
                    <button
                      onClick={() => toggleAutoCompound(id, !pos.autoCompound)}
                      disabled={togglingId === id}
                      className="min-w-[9.5rem] rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 whitespace-nowrap"
                    >
                      {togglingId === id
                        ? 'Updating…'
                        : pos.autoCompound
                        ? 'Disable Auto-Compound'
                        : 'Enable Auto-Compound'}
                    </button>
                  )}

                  <button
                    onClick={() => perform(id, { fn: 'compound' })}
                    disabled={busyId === id}
                    className="min-w-[8.75rem] rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-black hover:bg-[#e6c964] whitespace-nowrap"
                  >
                    {busyId === id ? 'Working…' : 'Compound'}
                  </button>

                  <button
                    onClick={() => perform(id, { fn: 'withdraw' })}
                    disabled={!mature || busyId === id}
                    className={`min-w-[8.75rem] rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap
                      ${mature ? 'bg-gold text-black hover:bg-[#e6c964]' : 'bg-white/10 text-white/50 cursor-not-allowed'}`}
                  >
                    Withdraw
                  </button>

                  <button
                    onClick={() => perform(id, { fn: 'emergencyExit' })}
                    disabled={busyId === id}
                    className="min-w-[9.25rem] rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20 whitespace-nowrap"
                  >
                    Emergency Exit
                  </button>
                </div>
              </div>

              {/* Metrics grid (tight, non-bleeding) */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <KV label="Principal" value={`${principalFmt} ${BGLD_SYMBOL}`} />
                <KV label="Term" value={`${pos.daysLocked}d`} />
                <KV label="APR" value={`${apr}%`} />
                <KV label="Maturity" value={maturedIn} />
                <KV label="Vested Now" value={`${vestedFmt} ${BGLD_SYMBOL}`} />
                <KV label="Rewards @ Maturity" value={`${rewardsFmt} ${BGLD_SYMBOL}`} />
              </div>

              {/* Footer line */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60">
                <span className="whitespace-nowrap">
                  Exit fee now: <span className="text-amber-300">{exitFee}</span>
                </span>
                <span className="hidden sm:inline text-white/30">|</span>
                <span className="whitespace-nowrap">{pos.closed ? 'Closed' : 'Open'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {!!status && (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/80 whitespace-pre-wrap">
          {status}
        </div>
      )}
    </div>
  );
}

/* ---------- UI helpers ---------- */
function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/40 p-3">
      <div className="text-[11px] uppercase tracking-wider text-white/60 truncate">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-amber-200 tabular-nums truncate">{value}</div>
    </div>
  );
}

/* ---------- format helpers ---------- */
function fmtToken(v: bigint, decimals = 18, maxFrac = 2) {
  try {
    const s = formatUnits(v, decimals);
    const [i, f = ''] = s.split('.');
    const frac = f.slice(0, maxFrac);
    const int = Number(i);
    const intStr = Number.isFinite(int) ? int.toLocaleString() : i;
    return frac ? `${intStr}.${frac}` : intStr;
  } catch { return '0'; }
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
