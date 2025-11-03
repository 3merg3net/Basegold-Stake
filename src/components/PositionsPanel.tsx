'use client';

import { useMemo, useState } from 'react';
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from 'wagmi';
import { formatUnits } from 'viem';
import STAKING_ABI from '@/lib/abis/BaseGoldStaking';
import ERC20_ABI from '@/lib/abis/ERC20';
import { aprForDays, BGLD_DECIMALS, BGLD_SYMBOL } from '@/lib/constants';

const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase() as
  | `0x${string}`
  | '';

const DEBUG = (process.env.NEXT_PUBLIC_DEBUG_METRICS || '0').trim() === '1';

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

  const canRead = Boolean(address && STAKING);

  // 1) fetch ids (never gate this behind feature flags)
  const idsRead = useReadContract({
    abi: STAKING_ABI,
    address: STAKING || undefined,
    functionName: 'positionsOf',
    args: address ? [address] : undefined,
    query: { enabled: canRead },
  });

  const ids = useMemo<bigint[]>(
    () => (Array.isArray(idsRead.data) ? (idsRead.data as bigint[]) : []),
    [idsRead.data],
  );

  // 2) batch fetch per id (allowFailure=true so one revert doesn't kill all)
  const reads = useMemo(() => {
    if (!ids.length || !STAKING) return [];
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

  const batch = useReadContracts({
    allowFailure: true,
    contracts: reads as any,
    query: { enabled: reads.length > 0 },
  });

  const rows = useMemo(() => {
    if (!ids.length) return [];
    const out: Array<{
      id: bigint;
      pos?: Position;
      vested?: bigint;
      totalRewards?: bigint;
      exitFeeBps?: bigint;
      ok: boolean;
    }> = [];

    let i = 0;
    for (const id of ids) {
      const posRes = batch.data?.[i++] || { status: 'failure' as const };
      const rewRes = batch.data?.[i++] || { status: 'failure' as const };
      const feeRes = batch.data?.[i++] || { status: 'failure' as const };

      const ok =
        posRes.status === 'success' &&
        rewRes.status === 'success' &&
        feeRes.status === 'success';

      let pos: Position | undefined;
      let vested: bigint | undefined;
      let totalRewards: bigint | undefined;
      let exitFeeBps: bigint | undefined;

      if (posRes.status === 'success') {
        const p: any = posRes.result;
        pos = {
          id,
          owner: (p?.[0] ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
          amount: p?.[1] ?? 0n,
          start: p?.[2] ?? 0n,
          daysLocked: Number(p?.[3] ?? 0),
          autoCompound: Boolean(p?.[4]),
          closed: Boolean(p?.[5]),
        };
      }
      if (rewRes.status === 'success') {
        const rr = rewRes.result as [bigint, bigint];
        vested = rr?.[0] ?? 0n;
        totalRewards = rr?.[1] ?? 0n;
      }
      if (feeRes.status === 'success') {
        exitFeeBps = (feeRes.result as bigint) ?? 0n;
      }

      out.push({ id, pos, vested, totalRewards, exitFeeBps, ok });
    }
    return out.sort((a, b) => Number(b.id - a.id));
  }, [ids, batch.data]);

  async function refetchAll() {
    await Promise.all([idsRead.refetch(), batch.refetch?.()]);
  }

  // actions (withdraw / emergencyExit / compound) — do not gate these with feature flags
  async function perform(id: bigint, fn: 'withdraw' | 'emergencyExit' | 'compound') {
    try {
      if (!address || !STAKING) throw new Error('Missing wallet or staking address');
      setBusyId(id);
      setStatus('');

      const base = {
        abi: STAKING_ABI,
        address: STAKING as `0x${string}`,
        functionName: fn,
        args: [id] as const,
      };

      await publicClient!.simulateContract({ ...base, account: address });
      const hash = await writeContractAsync(base);
      setStatus(`${fn} submitted: ${hash.slice(0, 10)}…`);
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchAll();
      setStatus(`${fn} confirmed ✓`);
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

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-white/70">
        Connect your wallet to view your vaults.
      </div>
    );
  }

  // simple load/error states
  const loading = idsRead.isLoading || batch.isLoading;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
      <div className="mb-3 text-sm font-semibold text-amber-300">Your Vaults</div>

      {loading && <div className="text-sm text-white/60">Loading…</div>}

      {!loading && rows.length === 0 && (
        <div className="text-sm text-white/60">
          {ids.length === 0
            ? 'No active vaults yet.'
            : 'Unable to load vault details (partial read failure).'}
        </div>
      )}

      <div className="space-y-4">
        {rows.map(({ id, pos, vested = 0n, totalRewards = 0n, exitFeeBps = 0n, ok }) => {
          if (!pos) {
            return (
              <div key={String(id)} className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm">
                Vault #{id.toString()} — read error (will retry on refresh).
              </div>
            );
          }

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
                      ${mature ? 'bg-gold text-black hover:bg-[#e6c964]' : 'bg-white/10 text-white/50 cursor-not-allowed'}`}
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
                {!ok && <span className="text-red-300"> (partial read)</span>}
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

      {DEBUG && (
        <pre className="mt-3 whitespace-pre-wrap text-xs text-white/70 bg-black/40 border border-white/10 rounded-lg p-3">
{`[PositionsPanel debug]
address: ${address}
STAKING: ${STAKING || '—'}
ids status: ${idsRead.status} · ids: ${Array.isArray(ids) ? ids.map(x=>x.toString()).join(',') : '—'}
batch status: ${batch.status} · len: ${batch.data?.length ?? 0}
`}
        </pre>
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
  } catch {
    return '0';
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