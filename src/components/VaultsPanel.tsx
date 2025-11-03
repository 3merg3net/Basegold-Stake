// src/components/VaultsPanel.tsx
'use client';

import { useMemo } from 'react';
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';
import { formatUnits } from 'viem';
import ERC20_ABI_RAW from '@/lib/abis/ERC20';
import STAKING_ABI_RAW from '@/lib/abis/BaseGoldStaking';

// ---------- helpers ----------
function normalizeAbi(mod: any) {
  const m = (mod && (mod.default ?? mod)) as any;
  if (Array.isArray(m)) return m;
  if (Array.isArray(m?.abi)) return m.abi;
  return m;
}
const ERC20_ABI = normalizeAbi(ERC20_ABI_RAW);
const STAKING_ABI = normalizeAbi(STAKING_ABI_RAW);

const env = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim().toLowerCase(),
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase(),
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'),
  DEBUG: (process.env.NEXT_PUBLIC_DEBUG_VAULTS || '0') === '1',
};

function secondsNow() { return Math.floor(Date.now() / 1000); }
function fmt(n?: number, digits = 2) {
  if (!Number.isFinite(n!)) return '—';
  if (Math.abs(n!) >= 1) return n!.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n!).toPrecision(6);
}
function fmtTokenAmt(v?: bigint, decimals = 18, digits = 2) {
  if (v == null) return '0';
  try { return fmt(Number(formatUnits(v, decimals)), digits); } catch { return '0'; }
}
function aprTextFromBps(bps?: number) {
  if (!Number.isFinite(bps!)) return '—';
  return `${(bps! / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}
function remainingLabel(startSec: bigint, termSec?: bigint) {
  if (!termSec || termSec === 0n) return '—';
  const end = Number(startSec) + Number(termSec);
  const rem = Math.max(0, end - secondsNow());
  if (rem === 0) return 'Mature';
  const d = Math.floor(rem / 86400);
  const h = Math.floor((rem % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

// ---------- component ----------
export default function VaultsPanel({ className }: { className?: string }) {
  const { address, chainId } = useAccount();
  const connected = Boolean(address);
  const enabledReads = Boolean(env.STAKING && env.BGLD);

  // A) shared: token decimals (for formatting)
  const { data: decimalsResp } = useReadContracts({
    allowFailure: true,
    contracts: enabledReads
      ? [{ abi: ERC20_ABI as any, address: env.BGLD as `0x${string}`, functionName: 'decimals' }]
      : [],
    query: { enabled: enabledReads, refetchInterval: 5000 },
  });
  const bgldDecimals = (decimalsResp?.[0]?.result as number | undefined) ?? 18;

  // B) fast path: positionsOf(user)
  const { data: idsResp } = useReadContracts({
    allowFailure: true,
    contracts: enabledReads && connected
      ? [{
          abi: STAKING_ABI as any,
          address: env.STAKING as `0x${string}`,
          functionName: 'positionsOf',
          args: [address as `0x${string}`],
        }]
      : [],
    query: { enabled: enabledReads && connected, refetchInterval: 5000 },
  });
  const posIdsFast: bigint[] =
    ((idsResp?.[0]?.result as readonly bigint[] | undefined) ?? []).map((x) => BigInt(x));

  // C) fallback probe: scan last N positions if fast path empty
  const SCAN_WINDOW = 200n; // last ~200 IDs
  const needFallback = enabledReads && connected && posIdsFast.length === 0;

  const { data: nextIdResp } = useReadContracts({
    allowFailure: true,
    contracts: needFallback
      ? [{ abi: STAKING_ABI as any, address: env.STAKING as `0x${string}`, functionName: 'nextId' }]
      : [],
    query: { enabled: needFallback, refetchInterval: 10000 },
  });
  const nextId = (nextIdResp?.[0]?.result as bigint | undefined) ?? 0n;

  // Build fallback ID list: [max(1, nextId - SCAN_WINDOW) ... nextId-1]
  const fallbackIds: bigint[] = useMemo(() => {
    if (!needFallback || nextId <= 1n) return [];
    const from = nextId > SCAN_WINDOW ? (nextId - SCAN_WINDOW) : 1n;
    const ids: bigint[] = [];
    for (let i = from; i < nextId; i++) ids.push(i);
    return ids.reverse(); // newest first
  }, [needFallback, nextId]);

  // D) fetch positions for whichever id list we have
  const targetIds: bigint[] = posIdsFast.length ? posIdsFast : fallbackIds;

  const { data: posBatch } = useReadContracts({
    allowFailure: true,
    contracts: enabledReads && targetIds.length
      ? targetIds.map((id) => ({
          abi: STAKING_ABI as any,
          address: env.STAKING as `0x${string}`,
          functionName: 'positions',
          args: [id],
        }))
      : [],
    query: { enabled: enabledReads && targetIds.length > 0, refetchInterval: 5000 },
  });

  type Row = {
    id: bigint;
    owner: `0x${string}`;
    amount: bigint;
    start: bigint;
    lastCompoundAt: bigint;
    daysLocked: number;
    autoCompound: boolean;
    closed: boolean;
  };

  // Map raw -> rows and (for fallback) filter by owner == address
  const rowsRaw: Row[] = useMemo(() => {
    if (!posBatch || !targetIds.length) return [];
    const out: Row[] = [];
    for (let i = 0; i < targetIds.length; i++) {
      const r: any = posBatch[i]?.result;
      if (!r) continue;
      out.push({
        id: targetIds[i],
        owner: ((r.owner as `0x${string}`) ?? ('0x' + '0'.repeat(40)) as `0x${string}`),
        amount: (r.amount as bigint) ?? 0n,
        start: (r.start as bigint) ?? 0n,
        lastCompoundAt: (r.lastCompoundAt as bigint) ?? 0n,
        daysLocked: Number(r.daysLocked ?? 0),
        autoCompound: Boolean(r.autoCompound),
        closed: Boolean(r.closed),
      });
    }
    return out;
  }, [posBatch, targetIds]);

  const rows: Row[] = useMemo(() => {
    if (!connected) return [];
    const me = (address || '').toLowerCase();
    // if we used fast ids, they are already owned by the user; otherwise filter
    const base = posIdsFast.length ? rowsRaw : rowsRaw.filter((r) => r.owner?.toLowerCase() === me);
    return base.sort((a, b) => Number(b.id - a.id));
  }, [rowsRaw, posIdsFast, connected, address]);

  // E) for each row, fetch: pendingRewards(id), aprForDays(days), termSeconds(days)
  const { data: moreReads } = useReadContracts({
    allowFailure: true,
    contracts:
      enabledReads && rows.length
        ? [
            ...rows.map((r) => ({
              abi: STAKING_ABI as any,
              address: env.STAKING as `0x${string}`,
              functionName: 'pendingRewards',
              args: [r.id],
            })),
            ...rows.map((r) => ({
              abi: STAKING_ABI as any,
              address: env.STAKING as `0x${string}`,
              functionName: 'aprForDays',
              args: [BigInt(r.daysLocked)],
            })),
            ...rows.map((r) => ({
              abi: STAKING_ABI as any,
              address: env.STAKING as `0x${string}`,
              functionName: 'termSeconds',
              args: [BigInt(r.daysLocked)],
            })),
          ]
        : [],
    query: { enabled: enabledReads && rows.length > 0, refetchInterval: 5000 },
  });

  const byId = useMemo(() => {
    const m: Record<string, { vested?: bigint; total?: bigint; aprBps?: number; termSec?: bigint }> = {};
    if (!moreReads || !rows.length) return m;

    const n = rows.length;
    for (let i = 0; i < n; i++) {
      const pair = moreReads[i]?.result as any;
      const id = rows[i].id.toString();
      m[id] = m[id] || {};
      if (pair) {
        m[id].vested = (pair.vested as bigint) ?? 0n;
        m[id].total  = (pair.total  as bigint) ?? 0n;
      } else {
        m[id].vested = 0n; m[id].total = 0n;
      }
    }
    for (let i = 0; i < n; i++) {
      const id = rows[i].id.toString();
      const v = moreReads[n + i]?.result as any;
      m[id] = m[id] || {};
      m[id].aprBps = Number(v ?? 0);
    }
    for (let i = 0; i < n; i++) {
      const id = rows[i].id.toString();
      const v = moreReads[n + n + i]?.result as any;
      m[id] = m[id] || {};
      m[id].termSec = (v as bigint) ?? 0n;
    }
    return m;
  }, [moreReads, rows]);

  const { writeContractAsync } = useWriteContract();

  async function doAction(
    fn: 'compound' | 'withdraw' | 'emergencyExit' | 'setAutoCompound',
    id: bigint,
    argBool?: boolean
  ) {
    if (!address) throw new Error('Connect wallet');
    if (chainId && chainId !== env.CHAIN_ID) throw new Error('Wrong network');
    const base = { abi: STAKING_ABI as any, address: env.STAKING as `0x${string}`, chainId: env.CHAIN_ID };
    const args = fn === 'setAutoCompound' ? [id, Boolean(argBool)] : [id];
    await writeContractAsync({ ...base, functionName: fn, args: args as any[] });
  }

  if (!connected) {
    return (
      <div className={className}>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-white/70">
          Connect your wallet to view your vaults.
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className={className}>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-white/70">
          No active vaults yet.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-4">
        {rows.map((r) => {
          const extra = byId[r.id.toString()] || {};
          const aprText = aprTextFromBps(extra.aprBps);
          const remains = remainingLabel(r.start, extra.termSec);
          const rewards = extra.vested ?? 0n;

          return (
            <div key={r.id.toString()} className="rounded-2xl border border-white/10 bg-black/50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/60">
                    Vault #{r.id.toString()}
                  </div>
                  <div className="mt-0.5 text-amber-200 font-semibold">
                    {fmtTokenAmt(r.amount, bgldDecimals, 2)} BGLD
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <Metric label="Lock" value={`${r.daysLocked}d`} />
                  <Metric label="APR" value={aprText} />
                  <Metric label="Matures In" value={remains} />
                  <Metric label="Rewards (vested)" value={`${fmtTokenAmt(rewards, bgldDecimals, 4)} BGLD`} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => doAction('compound', r.id)}
                  disabled={r.closed}
                  className="rounded-xl px-4 py-2 border border-blue-400 text-blue-200 bg-black/40 disabled:opacity-50"
                >
                  Compound
                </button>
                <button
                  onClick={() => doAction('withdraw', r.id)}
                  disabled={r.closed}
                  className="rounded-xl px-4 py-2 border border-emerald-400 text-emerald-200 bg-black/40 disabled:opacity-50"
                >
                  Withdraw
                </button>
                <button
                  onClick={() => doAction('emergencyExit', r.id)}
                  disabled={r.closed}
                  className="rounded-xl px-4 py-2 border border-rose-400 text-rose-200 bg-black/40 disabled:opacity-50"
                >
                  Emergency Exit
                </button>
                <button
                  onClick={() => doAction('setAutoCompound', r.id, !r.autoCompound)}
                  disabled={r.closed}
                  className="rounded-xl px-4 py-2 border border-amber-400 text-amber-200 bg-black/40 disabled:opacity-50"
                >
                  {r.autoCompound ? 'Auto-Compound: ON' : 'Auto-Compound: OFF'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wider text-white/60 truncate">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-amber-200 tabular-nums truncate">{value}</div>
    </div>
  );
}
