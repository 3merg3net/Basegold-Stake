// src/components/PositionsPanel.tsx
'use client';

import { useAccount, useReadContracts, usePublicClient, useWriteContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import STAKING_ABI from '@/lib/abis/BaseGoldStaking'; // <-- the ABI you pasted
import ERC20_ABI from '@/lib/abis/ERC20';

const env = {
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase(),
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim().toLowerCase(),
  DEBUG: (process.env.NEXT_PUBLIC_DEBUG_POS || '0') === '1',
};

function fmtNum(n?: number, d = 2) {
  if (!Number.isFinite(n!)) return '—';
  return n!.toLocaleString(undefined, { maximumFractionDigits: d });
}

function fmtAmt(v?: bigint, decimals = 18, d = 2) {
  if (v == null) return '0';
  try { return fmtNum(Number(formatUnits(v, decimals)), d); } catch { return '0'; }
}

export default function PositionsPanel() {
  const { address } = useAccount();
  const enabled = Boolean(address && env.STAKING && env.BGLD);
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  // 1) Read token decimals once (for display)
  const { data: decReads } = useReadContracts({
    allowFailure: true,
    contracts: enabled ? [
      { abi: ERC20_ABI as any, address: env.BGLD as `0x${string}`, functionName: 'decimals' },
    ] : [],
    query: { enabled },
  });
  const bgldDecimals = (decReads?.[0]?.result as number | undefined) ?? 18;

  // 2) Get the user’s position IDs
  const { data: idsRead } = useReadContracts({
    allowFailure: true,
    contracts: enabled ? [
      { abi: STAKING_ABI as any, address: env.STAKING as `0x${string}`, functionName: 'positionsOf', args: [address as `0x${string}`] },
    ] : [],
    query: { enabled, refetchInterval: 12_000 },
  });

  const ids = (idsRead?.[0]?.result as bigint[] | undefined) ?? [];

  // 3) Batch read each position + helpers
  const posContracts = ids.flatMap((id) => ([
    { abi: STAKING_ABI as any, address: env.STAKING as `0x${string}`, functionName: 'positions', args: [id] as const },
    { abi: STAKING_ABI as any, address: env.STAKING as `0x${string}`, functionName: 'pendingRewards', args: [id] as const },
    { abi: STAKING_ABI as any, address: env.STAKING as `0x${string}`, functionName: 'principalExitFeeBps', args: [id] as const },
    { abi: STAKING_ABI as any, address: env.STAKING as `0x${string}`, functionName: 'elapsed', args: [id] as const },
  ]));

  const { data: posReads, refetch: refetchPositions } = useReadContracts({
    allowFailure: true,
    contracts: enabled && posContracts.length ? posContracts : [],
    query: { enabled, refetchInterval: 12_000 },
  });

  // 4) Shape rows
  type Row = {
    id: bigint;
    amount: bigint;
    start: bigint;           // secs
    lastCompoundAt: bigint;  // secs
    daysLocked: number;
    autoCompound: boolean;
    closed: boolean;
    rewardsVested: bigint;
    rewardsTotal: bigint;
    principalExitFeeBps: number;
    elapsedSecs: bigint;
  };

  const rows: Row[] = [];
  for (let i = 0; i < ids.length; i++) {
    const base = i * 4;
    const id = ids[i];

    const p = (posReads?.[base]?.result as any) || {};
    const pend = (posReads?.[base + 1]?.result as any) || {};
    const feeBps = (posReads?.[base + 2]?.result as number | undefined) ?? 0;
    const elapsed = (posReads?.[base + 3]?.result as bigint | undefined) ?? 0n;

    rows.push({
      id,
      amount: (p.amount as bigint) ?? 0n,
      start: BigInt((p.start as bigint) ?? 0n),
      lastCompoundAt: BigInt((p.lastCompoundAt as bigint) ?? 0n),
      daysLocked: Number(p.daysLocked ?? 0),
      autoCompound: Boolean(p.autoCompound),
      closed: Boolean(p.closed),
      rewardsVested: (pend.vested as bigint) ?? 0n,
      rewardsTotal: (pend.total as bigint) ?? 0n,
      principalExitFeeBps: feeBps,
      elapsedSecs: elapsed,
    });
  }

  async function onWithdraw(id: bigint) {
    if (!address) return;
    const base = {
      abi: STAKING_ABI as any,
      address: env.STAKING as `0x${string}`,
      functionName: 'withdraw' as const,
      args: [id] as const,
    };

    // simulate first (good errors)
    await publicClient!.simulateContract({ ...base, account: address });
    const tx = await writeContractAsync(base);
    if (env.DEBUG) console.log('withdraw tx', tx);
    await refetchPositions();
  }

  async function onCompound(id: bigint) {
    if (!address) return;
    const base = {
      abi: STAKING_ABI as any,
      address: env.STAKING as `0x${string}`,
      functionName: 'compound' as const,
      args: [id] as const,
    };
    await publicClient!.simulateContract({ ...base, account: address });
    const tx = await writeContractAsync(base);
    if (env.DEBUG) console.log('compound tx', tx);
    await refetchPositions();
  }

  async function onEmergencyExit(id: bigint) {
    if (!address) return;
    const base = {
      abi: STAKING_ABI as any,
      address: env.STAKING as `0x${string}`,
      functionName: 'emergencyExit' as const,
      args: [id] as const,
    };
    await publicClient!.simulateContract({ ...base, account: address });
    const tx = await writeContractAsync(base);
    if (env.DEBUG) console.log('emergencyExit tx', tx);
    await refetchPositions();
  }

  if (!enabled) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
        Connect wallet to view your vault positions.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Your Vault Positions</div>
        <button
          className="text-xs rounded-lg border border-white/15 px-2 py-1 hover:bg-white/5"
          onClick={() => refetchPositions()}
        >
          Refresh
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-white/60">No active positions.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr className="text-left">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Amount (BGLD)</th>
                <th className="py-2 pr-3">Rewards (vested / total)</th>
                <th className="py-2 pr-3">Days Locked</th>
                <th className="py-2 pr-3">Exit Fee (bps)</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const status = r.closed ? 'Closed' : 'Active';
                return (
                  <tr key={String(r.id)} className="border-t border-white/10">
                    <td className="py-2 pr-3 tabular-nums">{String(r.id)}</td>
                    <td className="py-2 pr-3 tabular-nums">{fmtAmt(r.amount, bgldDecimals, 2)}</td>
                    <td className="py-2 pr-3 tabular-nums">
                      {fmtAmt(r.rewardsVested, bgldDecimals, 2)} / {fmtAmt(r.rewardsTotal, bgldDecimals, 2)}
                    </td>
                    <td className="py-2 pr-3">{r.daysLocked}</td>
                    <td className="py-2 pr-3">{r.principalExitFeeBps}</td>
                    <td className="py-2 pr-3">{status}</td>
                    <td className="py-2 pr-3">
                      {!r.closed && (
                        <div className="flex gap-2">
                          <button className="rounded-md border border-white/15 px-2 py-1 hover:bg-white/5"
                                  onClick={() => onCompound(r.id)}>
                            Compound
                          </button>
                          <button className="rounded-md border border-white/15 px-2 py-1 hover:bg-white/5"
                                  onClick={() => onWithdraw(r.id)}>
                            Withdraw
                          </button>
                          <button className="rounded-md border border-red-500/40 text-red-300 px-2 py-1 hover:bg-red-500/10"
                                  onClick={() => onEmergencyExit(r.id)}>
                            Emergency Exit
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {env.DEBUG && (
        <pre className="mt-3 whitespace-pre-wrap text-xs text-white/70 bg-black/50 border border-white/10 rounded p-3">
{`[PositionsPanel debug]
addr: ${address}
ids: ${JSON.stringify(ids.map(String))}
`}
        </pre>
      )}
    </div>
  );
}
