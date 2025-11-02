'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, usePublicClient, useReadContract, useReadContracts, useWriteContract } from 'wagmi';
import { formatUnits } from 'viem';

import STAKING_ABI from '@/lib/abis/BaseGoldStaking';
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

export default function PositionsPanel() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [status, setStatus] = useState<string>('');
  const [busyId, setBusyId] = useState<bigint | null>(null);

  // ids of this user
  const { data: idsData, refetch: refetchIds, isFetching: fetchingIds } = useReadContract({
    abi: STAKING_ABI as any,
    address: STAKING || undefined,
    functionName: 'positionsOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && STAKING) },
  });

  const ids = useMemo<bigint[]>(
    () => (Array.isArray(idsData) ? (idsData as bigint[]) : []),
    [idsData]
  );

  // batch reads per id: positions, pendingRewards, principalExitFeeBps
  const reads = useMemo(() => {
    if (!ids.length) return [];
    const calls: any[] = [];
    for (const id of ids) {
      calls.push(
        { abi: STAKING_ABI as any, address: STAKING, functionName: 'positions', args: [id] },
        { abi: STAKING_ABI as any, address: STAKING, functionName: 'pendingRewards', args: [id] },
        { abi: STAKING_ABI as any, address: STAKING, functionName: 'principalExitFeeBps', args: [id] },
      );
    }
    return calls;
  }, [ids]);

  const { data: batchData, refetch: refetchBatch, isFetching: fetchingBatch } = useReadContracts({
    allowFailure: true,
    contracts: reads as any,
    query: { enabled: reads.length > 0 },
  });

  const rows = useMemo(() => {
    if (!ids.length || !batchData) return [];
    const out: Array<{
      id: bigint;
      pos: Position;
      vested: bigint;
      totalRewards: bigint;
      exitFeeBps: bigint;
    }> = [];

    let i = 0;
    for (const id of ids) {
      const posRaw = batchData[i++]?.result as any;
      const rewRaw = batchData[i++]?.result as [bigint, bigint] | undefined;
      const feeRaw = batchData[i++]?.result as bigint | undefined;

      if (!posRaw) continue;

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

  const refetchAll = async () => { await Promise.all([refetchIds(), refetchBatch()]); };

  async function perform(id: bigint, fn: 'withdraw' | 'emergencyExit' | 'compound') {
    try {
      if (!address || !publicClient) return;
      setBusyId(id); setStatus('');

      const args = { abi: STAKING_ABI as any, address: STAKING, functionName: fn as any, args: [id] as const };

      // simulate (helps surface revert reasons)
      await publicClient.simulateContract({ ...args, account: address });

      const hash = await writeContractAsync(args as any);
      setStatus(`${fn} submitted: ${hash.slice(0, 10)}…`);
      await publicClient.waitForTransactionReceipt({ hash });
      await refetchAll();
      setStatus(`${fn} confirmed ✓`);
    } catch (e: any) {
      const msg = e?.reason || e?.shortMessage || e?.message || 'Transaction failed';
      setStatus(msg);
    } finally { setBusyId(null); }
  }

  if (!address) {
    return <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-white/70">
      Connect your wallet to view your vaults.
    </div>;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
      <div className="mb-3 text-sm font-semibold text-amber-300">Your Vaults</div>

      {(fetchingIds || fetchingBatch) && rows.length === 0 && (
        <div className="text-sm text-white/60">Loading your vaults…</div>
      )}

      {rows.length === 0 && !fetchingIds && !fetchingBatch && (
        <div className="text-sm text-white/60">No active vaults yet.</div>
      )}

      <div className="space-y-4">
        {rows.map(({ id, pos, vested, totalRewards, exitFeeBps }) => {
          const now = Math.floor(Date.now() / 1000);
          const elapsed = Math.max(0, now - Number(pos.start));
          const termSecs = pos.daysLocked * 86400;
          const mature = elapsed >= termSecs;

          const apr = aprForDays(pos.daysLocked);
          const principalFmt = fmtToken(pos.amount, BGLD_DECIMALS, 2);
          const vestedFmt = fmtToken(vested, BGLD_DECIMALS, 2);
          const rewardsFmt = fmtToken(totalRewards, BGLD_DECIMALS, 2);
          const exitFee = (Number(exitFeeBps) / 100).toFixed(2) + '%';
          const maturedIn = mature ? 'Mature' : formatDuration(termSecs - elapsed);

          return (
            <div key={String(id)} className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-white/60">Vault ID</div>
                  <div className="text-lg font-semibold text-amber-300">#{id.toString()}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => perform(id, 'compound')}
                    disabled={busyId === id}
                    className="min-w-[8.5rem] rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-black hover:bg-[#e6c964] whitespace-nowrap"
                  >
                    {busyId === id ? 'Working…' : 'Compound'}
                  </button>
                  <button
                    onClick={() => perform(id, 'withdraw')}
                    disabled={!mature || busyId === id}
                    className={`min-w-[8.5rem] rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap
                      ${mature ? 'bg-gold text-black hover:bg-[#e6c964]' : 'bg-white/10 text-white/50 cursor-not-allowed'}
                    `}
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => perform(id, 'emergencyExit')}
                    disabled={busyId === id}
                    className="min-w-[8.5rem] rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20 whitespace-nowrap"
                  >
                    Emergency Exit
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <KV label="Principal" value={`${principalFmt} ${BGLD_SYMBOL}`} />
                <KV label="Term" value={`${pos.daysLocked}d`} />
                <KV label="APR" value={`${apr}%`} />
                <KV label="Maturity" value={maturedIn} />
                <KV label="Vested Now" value={`${vestedFmt} ${BGLD_SYMBOL}`} />
                <KV label="Rewards @ Maturity" value={`${rewardsFmt} ${BGLD_SYMBOL}`} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60">
                <span className="whitespace-nowrap">Exit fee now: <span className="text-amber-300">{exitFee}</span></span>
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

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/40 p-3">
      <div className="text-[11px] uppercase tracking-wider text-white/60 truncate">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-amber-200 tabular-nums truncate">{value}</div>
    </div>
  );
}

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
