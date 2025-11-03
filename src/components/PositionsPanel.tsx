'use client';

import { useMemo } from 'react';
import { useAccount, useChainId, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import STAKING_ABI from '@/lib/abis/BaseGoldStaking';
import ERC20_ABI from '@/lib/abis/ERC20';
import { env, onBase } from '@/lib/env';

// Small helpers
function fmtNum(n?: number, digits = 2) {
  if (!Number.isFinite(n!)) return '—';
  if (Math.abs(n!) >= 1) return n!.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n!).toPrecision(6);
}
function fmtToken(v?: bigint, decimals = 18, digits = 4) {
  if (v == null) return '0';
  try {
    const s = formatUnits(v, decimals);
    const n = Number(s);
    return fmtNum(n, digits);
  } catch { return '0'; }
}

export default function PositionsPanel() {
  const { address } = useAccount();
  const chainId = useChainId();

  const staking = env.STAKING as `0x${string}`;
  const bgld = env.BGLD as `0x${string}`;

  const networkOkay = onBase(chainId);
  const canQuery = Boolean(address && staking && networkOkay);

  // --- read decimals once (for formatting) + user BGLD (optional)
  const { data: decReads } = useReadContracts({
    allowFailure: true,
    contracts: [
      { abi: ERC20_ABI as any, address: bgld, functionName: 'decimals' },
      ...(address ? [{ abi: ERC20_ABI as any, address: bgld, functionName: 'balanceOf', args: [address] as const }] : []),
    ],
    query: { enabled: Boolean(bgld) },
  });

  const bgldDecimals = (decReads?.[0]?.result as number | undefined) ?? 18;
  const userBgld = decReads?.[1]?.result as bigint | undefined;

  // --- Step 1: ids for this user
  const { data: idsRead } = useReadContracts({
    allowFailure: true,
    contracts: canQuery ? [
      { abi: STAKING_ABI as any, address: staking, functionName: 'positionsOf', args: [address!] as const },
    ] : [],
    query: { enabled: canQuery },
  });

  const ids = (idsRead?.[0]?.result as bigint[] | undefined) ?? [];

  // --- Step 2: fetch each position + pending rewards
  const positionCalls = useMemo(() => {
    if (!canQuery || !ids.length) return [];
    const arr: any[] = [];
    for (const id of ids) {
      arr.push({ abi: STAKING_ABI as any, address: staking, functionName: 'positions', args: [id] as const });
      arr.push({ abi: STAKING_ABI as any, address: staking, functionName: 'pendingRewards', args: [id] as const });
      arr.push({ abi: STAKING_ABI as any, address: staking, functionName: 'principalExitFeeBps', args: [id] as const });
    }
    return arr;
  }, [canQuery, ids, staking]);

  const { data: posReads } = useReadContracts({
    allowFailure: true,
    contracts: positionCalls,
    query: { enabled: positionCalls.length > 0 },
  });

  // --- Map into rows
  const rows = useMemo(() => {
    if (!ids.length || !posReads?.length) return [];
    const out: {
      id: bigint;
      amount: bigint;
      daysLocked: number;
      start: number;
      rewardsVested: bigint;
      rewardsTotal: bigint;
      exitFeeBps: number;
      closed: boolean;
      autoCompound: boolean;
    }[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const pIdx = i * 3;
      const rIdx = i * 3 + 1;
      const fIdx = i * 3 + 2;

      const p = posReads[pIdx]?.result as any | undefined;
      const r = posReads[rIdx]?.result as any | undefined;
      const f = posReads[fIdx]?.result as any | undefined;

      if (!p) continue;

      out.push({
        id,
        amount: (p.amount as bigint) ?? 0n,
        daysLocked: Number(p.daysLocked ?? 0),
        start: Number(p.start ?? 0),
        autoCompound: Boolean(p.autoCompound),
        closed: Boolean(p.closed),
        rewardsVested: (r?.[0] as bigint) ?? 0n,
        rewardsTotal: (r?.[1] as bigint) ?? 0n,
        exitFeeBps: Number(f ?? 0),
      });
    }
    return out;
  }, [ids, posReads]);

  // Simple empty / wrong-chain states
  if (!networkOkay) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-sm">
        Please switch wallet to Base (chainId {env.CHAIN_ID}) to view vault positions.
      </div>
    );
  }

  if (!address) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm">
        Connect your wallet to see your BGLD vault positions.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-white/70">Your Wallet</div>
        <div className="text-sm font-semibold text-amber-200">
          Balance: {fmtToken(userBgld, bgldDecimals, 4)} BGLD
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-white/60">No active vault positions.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-white/60">
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Principal</th>
                <th className="px-3 py-2 text-left">Rewards (vested / total)</th>
                <th className="px-3 py-2 text-left">Days</th>
                <th className="px-3 py-2 text-left">Auto-Comp</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.id)} className="border-t border-white/10">
                  <td className="px-3 py-2">{String(r.id)}</td>
                  <td className="px-3 py-2">{fmtToken(r.amount, bgldDecimals, 4)} BGLD</td>
                  <td className="px-3 py-2">
                    {fmtToken(r.rewardsVested, bgldDecimals, 4)} / {fmtToken(r.rewardsTotal, bgldDecimals, 4)}
                  </td>
                  <td className="px-3 py-2">{r.daysLocked}</td>
                  <td className="px-3 py-2">{r.autoCompound ? 'On' : 'Off'}</td>
                  <td className="px-3 py-2">{r.closed ? 'Closed' : 'Active'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SAFE debug: avoid BigInt stringify */}
      <details className="mt-3 text-xs text-white/70">
        <summary>Debug</summary>
        <pre className="whitespace-pre-wrap">
{`addr: ${address}
chainId: ${chainId} (expect ${env.CHAIN_ID})
ids: ${ids.map(String).join(', ') || '—'}`}
        </pre>
      </details>
    </div>
  );
}
