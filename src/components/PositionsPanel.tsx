'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';

import { BGLD_DECIMALS, BGLD_SYMBOL, formatPct } from '@/lib/constants';
import ERC20_ABI from '@/lib/abis/ERC20';
import { STAKING_ABI } from '@/lib/abis/BaseGoldStaking';

const TOKEN   = (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').toLowerCase() as `0x${string}`;
const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').toLowerCase() as `0x${string}`;

type Pos = {
  id: bigint;
  owner: `0x${string}`;
  amount: bigint;
  start: bigint;          // seconds
  daysLocked: number;     // u32 -> number
  autoCompound: boolean;
  closed: boolean;
};

export default function PositionsPanel() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [ids, setIds] = useState<bigint[]>([]);
  const [positions, setPositions] = useState<Pos[]>([]);
  const [rewardsById, setRewardsById] = useState<Record<string, { vested: bigint; total: bigint }>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<bigint | null>(null);
  const [aprCache, setAprCache] = useState<Record<number, number>>({});
  const [balance, setBalance] = useState<bigint>(0n);

  const now = Math.floor(Date.now() / 1000);

  // Load wallet BGLD balance (to inform "Add to Vault" UX)
  useEffect(() => {
    if (!isConnected || !address || !TOKEN || !publicClient) return;
    (async () => {
      try {
        const bal = await publicClient.readContract({
          abi: ERC20_ABI as any,
          address: TOKEN,
          functionName: 'balanceOf',
          args: [address],
        });
        setBalance(bal as bigint);
      } catch (_) {}
    })();
  }, [isConnected, address, publicClient]);

  // Load position IDs
  useEffect(() => {
    if (!isConnected || !address || !publicClient || !STAKING) return;
    (async () => {
      try {
        const res = await publicClient.readContract({
          abi: STAKING_ABI as any,
          address: STAKING,
          functionName: 'positionsOf',
          args: [address],
        });
        setIds((res as bigint[]) ?? []);
      } catch (e: any) {
        setError(e?.shortMessage || e?.message || 'Failed to load vault IDs');
      }
    })();
  }, [isConnected, address, publicClient]);

  // Load position structs + rewards
  useEffect(() => {
    if (!publicClient || !STAKING || ids.length === 0) {
      setPositions([]);
      setRewardsById({});
      return;
    }
    (async () => {
      try {
        const pos = await Promise.all(ids.map(async (id) => {
          const p = await publicClient.readContract({
            abi: STAKING_ABI as any,
            address: STAKING,
            functionName: 'positions',
            args: [id],
          }) as any;

          // positions(uint256) returns:
          // (address owner, uint256 amount, uint64 start, uint32 daysLocked, bool autoCompound, bool closed)
          const obj: Pos = {
            id,
            owner: p[0],
            amount: BigInt(p[1]),
            start: BigInt(p[2]),
            daysLocked: Number(p[3]),
            autoCompound: Boolean(p[4]),
            closed: Boolean(p[5]),
          };
          return obj;
        }));

        const rewardsEntries = await Promise.all(ids.map(async (id) => {
          const r = await publicClient.readContract({
            abi: STAKING_ABI as any,
            address: STAKING,
            functionName: 'pendingRewards',
            args: [id],
          }) as any; // returns (vested, total)
          return [id.toString(), { vested: BigInt(r[0]), total: BigInt(r[1]) }] as const;
        }));

        const rewardsMap = Object.fromEntries(rewardsEntries);
        setRewardsById(rewardsMap);
        setPositions(pos.filter(p => !p.closed));
      } catch (e: any) {
        setError(e?.shortMessage || e?.message || 'Failed to load vaults');
      }
    })();
  }, [publicClient, ids]);

  // Cache APR per term (uint32)
  useEffect(() => {
    if (!publicClient || !STAKING || positions.length === 0) return;
    (async () => {
      const uniqueDays = Array.from(new Set(positions.map(p => p.daysLocked)));
      const entries = await Promise.all(uniqueDays.map(async (d) => {
        try {
          const apr = await publicClient.readContract({
            abi: STAKING_ABI as any,
            address: STAKING,
            functionName: 'aprForDays',
            args: [BigInt(d)],
          }) as bigint;
          // contract returns BPS or raw pct? From earlier, it looked like raw % (e.g., 78 for 14d).
          // If it's BPS, adjust here. For now assume raw % number.
          return [d, Number(apr)] as const;
        } catch {
          return [d, 0] as const;
        }
      }));
      const map: Record<number, number> = {};
      for (const [d, apr] of entries) map[d] = apr;
      setAprCache(map);
    })();
  }, [publicClient, positions]);

  const claimableTotal = useMemo(() => {
    return positions.reduce((acc, p) => {
      const r = rewardsById[p.id.toString()];
      return acc + (r?.vested ?? 0n);
    }, 0n);
  }, [positions, rewardsById]);

  const refreshAll = async () => {
    setStatus('Refreshing…');
    setError(null);
    try {
      // trigger both effects by bumping ids (re-read positionsOf)
      if (!publicClient || !address) return;
      const res = await publicClient.readContract({
        abi: STAKING_ABI as any,
        address: STAKING,
        functionName: 'positionsOf',
        args: [address],
      });
      setIds((res as bigint[]) ?? []);
      setStatus(null);
    } catch (e: any) {
      setStatus(null);
      setError(e?.shortMessage || e?.message || 'Refresh failed');
    }
  };

  // Actions
  const doCompound = async (id: bigint) => {
    await sendTx('Compounding…', { abi: STAKING_ABI as any, address: STAKING, functionName: 'compound', args: [id] });
  };
  const doWithdraw = async (id: bigint) => {
    await sendTx('Withdrawing…', { abi: STAKING_ABI as any, address: STAKING, functionName: 'withdraw', args: [id] });
  };
  const doEmergencyExit = async (id: bigint) => {
    await sendTx('Emergency exit…', { abi: STAKING_ABI as any, address: STAKING, functionName: 'emergencyExit', args: [id] });
  };
  const doAddToVault = async (id: bigint, amountUi: string) => {
    // If your contract exposes addStake(id, amount) – call that.
    // If it *doesn't*, users can create a new vault via /stake instead.
    // Here we only show an approve helper + note, to avoid calling a missing fn.

    // OPTIONAL approve helper (increase allowance for STAKING)
    const amountWei = safeParse(amountUi);
    if (amountWei <= 0n) throw new Error('Amount must be greater than 0');

    // Approve if needed
    const allowance = await publicClient!.readContract({
      abi: ERC20_ABI as any,
      address: TOKEN,
      functionName: 'allowance',
      args: [address!, STAKING],
    }) as bigint;

    if (allowance < amountWei) {
      await sendTx('Approving…', {
        abi: ERC20_ABI as any,
        address: TOKEN,
        functionName: 'approve',
        args: [STAKING, amountWei],
      }, false);
    }

    // If your on-chain contract has addStake(uint256 id, uint256 amount), uncomment below:
    // await sendTx('Adding to vault…', {
    //   abi: STAKING_ABI as any,
    //   address: STAKING,
    //   functionName: 'addStake',
    //   args: [id, amountWei],
    // });

    throw new Error('This prototype only approves; addStake() is not available on this staking contract.');
  };

  const sendTx = async (
    label: string,
    req: Parameters<typeof writeContractAsync>[0],
    setBusy: boolean = true,
  ) => {
    setStatus(label);
    setError(null);
    const id = (req.args?.[0] ?? null) as bigint | null;
    if (setBusy && typeof id === 'bigint') setBusyId(id);
    try {
      // pre-simulate for clear reverts
      const cleanReq = { ...req, account: address!, chain: undefined } as const;
      await publicClient!.simulateContract(cleanReq);
      const hash = await writeContractAsync(cleanReq);
      setStatus(`${label.replace(/…$/, '')} submitted: ${hash.slice(0, 10)}…`);
      await publicClient!.waitForTransactionReceipt({ hash });
      setStatus(null);
      await refreshAll();
    } catch (e: any) {
      const msg = e?.details || e?.metaMessages?.join('\n') || e?.shortMessage || e?.message || 'Transaction failed';
      setError(msg);
      setStatus(null);
      throw e;
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 relative overflow-hidden">
        <div
          className="absolute -inset-1 opacity-20 blur-2xl"
          style={{ background: 'radial-gradient(500px 160px at 50% -20%, rgba(212,175,55,.25), transparent)' }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Vaults</div>
            <div className="text-sm text-white/60">
              {isConnected
                ? <>Account: {address?.slice(0,6)}…{address?.slice(-4)} · Chain {chainId}</>
                : 'Connect wallet to view'}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-white/60">Claimable</div>
              <div className="text-base font-semibold text-gold">
                {formatUnits(claimableTotal, BGLD_DECIMALS)} {BGLD_SYMBOL}
              </div>
            </div>
            <button
              onClick={refreshAll}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm hover:bg-black/50"
            >
              Refresh
            </button>
          </div>
        </div>

        <p className="relative mt-3 text-sm text-white/70">
          Lock. Earn. Compound. Repeat. Each vault accrues rewards by the minute—and compounding
          can supercharge your yield over time. ⚡️
        </p>
      </div>

      {/* toasts */}
      {status && <div className="text-sm text-gold">{status}</div>}
      {error && <div className="text-sm text-red-400 whitespace-pre-wrap">{error}</div>}

      {/* empty state */}
      {positions.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-white/70">
          No active vaults yet. Create one from the <span className="text-gold font-semibold">Stake</span> page.
        </div>
      )}

      {/* list */}
      <div className="grid gap-4">
        {positions.map((p) => {
          const r = rewardsById[p.id.toString()];
          const claimable = r?.vested ?? 0n;
          const totalRwds = r?.total ?? 0n;

          const termSecs = p.daysLocked * 86400;
          const elapsedSecs = Math.max(0, now - Number(p.start));
          const pctElapsed = clamp01(elapsedSecs / termSecs);
          const remaining = Math.max(0, termSecs - elapsedSecs);
          const mature = remaining === 0;

          const apr = aprCache[p.daysLocked] ?? 0;

          const compoundedWithin24h = elapsedSecs <= 86400 ? 'New' : '>24h since start/last compound';

          return (
            <div key={p.id.toString()} className="rounded-2xl border border-white/10 bg-black/40 p-5">
              {/* Top row */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-white/60">Vault #{p.id.toString()}</div>
                  <div className="text-lg font-semibold">
                    {formatUnits(p.amount, BGLD_DECIMALS)} {BGLD_SYMBOL}
                  </div>
                  <div className="text-sm text-white/60">
                    Term:&nbsp;<span className="text-white/80 font-medium">{p.daysLocked}d</span>
                    &nbsp;• APR:&nbsp;<span className="text-gold font-semibold">{apr}%</span>
                    &nbsp;• Auto-compound:&nbsp;{p.autoCompound ? 'On' : 'Off'}
                  </div>
                </div>

                {/* metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-[280px]">
                  <Metric label="Status" value={mature ? 'Mature' : 'Locked'} />
                  <Metric label="Elapsed" value={`${Math.round(pctElapsed * 100)}%`} />
                  <Metric label="Time Left" value={fmtTime(remaining)} />
                  <Metric
                    label="Principal Fee (now)"
                    value={mature ? '0%' : '~' + estimatePrincipalFeePct(p.daysLocked, elapsedSecs)}
                  />
                </div>
              </div>

              {/* progress bar */}
              <div className="mt-4 h-2 w-full rounded bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gold"
                  style={{ width: `${Math.round(pctElapsed * 100)}%` }}
                />
              </div>

              {/* rewards row */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Metric label="Claimable" value={`${formatUnits(claimable, BGLD_DECIMALS)} ${BGLD_SYMBOL}`} />
                <Metric label="Total Rewards" value={`${formatUnits(totalRwds, BGLD_DECIMALS)} ${BGLD_SYMBOL}`} />
                <Metric label="24h Compound Hint" value={compoundedWithin24h} />
                <Metric label="Started" value={new Date(Number(p.start) * 1000).toLocaleString()} />
              </div>

              {/* actions */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ActionButton
                  disabled={busyId === p.id}
                  onClick={() => txWrap(p.id, () => doCompound(p.id))}
                >
                  Compound
                </ActionButton>

                <ActionButton
                  disabled={busyId === p.id}
                  onClick={async () => {
                    const maxUi = Number(formatUnits(balance, BGLD_DECIMALS));
                    const inp = prompt(`Add to this vault (available ${maxUi.toLocaleString()} ${BGLD_SYMBOL})`, '0');
                    if (!inp) return;
                    await txWrap(p.id, () => doAddToVault(p.id, inp));
                  }}
                >
                  Add to Vault
                </ActionButton>

                <ActionButton
                  disabled={!mature || busyId === p.id}
                  title={!mature ? 'Unavailable until maturity' : undefined}
                  onClick={() => txWrap(p.id, () => doWithdraw(p.id))}
                >
                  Withdraw
                </ActionButton>

                <ActionButton
                  variant="danger"
                  disabled={busyId === p.id}
                  onClick={async () => {
                    const sure = confirm(
                      'Emergency exit will forfeit unvested rewards and apply a principal fee per policy. Continue?'
                    );
                    if (!sure) return;
                    await txWrap(p.id, () => doEmergencyExit(p.id));
                  }}
                >
                  Emergency Exit
                </ActionButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  async function txWrap(id: bigint, fn: () => Promise<void>) {
    try { setBusyId(id); setError(null); await fn(); }
    catch (e) { /* error already surfaced */ }
    finally { setBusyId(null); }
  }
}

/* ==== UI bits ==== */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-center">
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="text-sm font-semibold text-gold break-words">{value}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  variant?: 'danger' | 'default';
  title?: string;
}) {
  const base = 'rounded-xl px-3 py-2 text-sm font-semibold border transition';
  const ok = 'border-gold/40 bg-black/30 hover:bg-black/50 text-gold';
  const danger = 'border-red-400/40 bg-black/30 hover:bg-black/50 text-red-300';
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variant === 'danger' ? danger : ok} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

/* ==== helpers ==== */
function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
function fmtTime(secs: number) {
  if (secs <= 0) return '0s';
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
function safeParse(ui: string) {
  const clean = ui.trim();
  if (!clean) return 0n;
  try { return parseUnits(clean, BGLD_DECIMALS); } catch { return 0n; }
}
// quick visual approximation based on earlier policy (5%→0% linearly)
function estimatePrincipalFeePct(daysLocked: number, elapsedSecs: number) {
  const total = daysLocked * 86400;
  const t = clamp01(elapsedSecs / total);
  const pct = (1 - t) * 5; // 5% → 0%
  return `${pct.toFixed(1)}%`;
}
