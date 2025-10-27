// @ts-nocheck

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { usePublicClient } from 'wagmi';

import {
  BGLD_DECIMALS,
  BGLD_SYMBOL,
  aprForDays,
  emergencyExitPenaltyPercent,
  vestedRewardsPercent,
  unvestedRewardsPercent,
  formatPct,
} from '@/lib/constants';

// IMPORTANT: TS exports (not JSON)
import ERC20_ABI from '@/lib/abis/ERC20';
import STAKING_ABI from '@/lib/abis/BaseGoldStaking';

const TOKEN   = (process.env.NEXT_PUBLIC_BGLD_ADDRESS    || '').toLowerCase() as `0x${string}`;
const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').toLowerCase() as `0x${string>`;

/** Identify stake() variant from ABI */
function detectStakeVariant(abi: any) {
  try {
    const stake = (abi as any[])?.find((f) => f?.type === 'function' && f?.name === 'stake');
    const types = stake?.inputs?.map((i: any) => i?.type) || [];
    const sig = types.join(',');

    if (sig === 'uint256,uint32,bool') return { ok: true, kind: 'v3_uint32_bool' as const, types, sig };
    if (sig === 'uint256,uint256,bool') return { ok: true, kind: 'v3_uint256_bool' as const, types, sig };
    if (sig === 'uint256,uint8')        return { ok: true, kind: 'v2_uint8'       as const, types, sig };
    if (sig === 'uint256,uint256')      return { ok: true, kind: 'v2_uint256'     as const, types, sig };

    return { ok: false, kind: 'unknown' as const, types, sig };
  } catch {
    return { ok: false, kind: 'unknown' as const, types: [], sig: '' };
  }
}

export default function StakeForm({ initialLockDays = 14 }: { initialLockDays?: number }) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  // ---- UI state ----
  const [amount, setAmount] = useState<string>('');
  const [lockDays, setLockDays] = useState<number>(clampLock(initialLockDays));
  const [approvedUI, setApprovedUI] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exitElapsed, setExitElapsed] = useState<number>(0);

  useEffect(() => setLockDays(clampLock(initialLockDays)), [initialLockDays]);

  const apr = useMemo(() => aprForDays(lockDays), [lockDays]);
  const amountNum = useMemo(() => Number(amount || 0), [amount]);

  const amountWei = useMemo(() => {
    try { return parseUnits((amount || '0').trim(), BGLD_DECIMALS); }
    catch { return 0n; }
  }, [amount]);

  // ---- On-chain reads (typed) ----
  const balanceRead = useReadContract({
    abi: ERC20_ABI,
    address: TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  }) as { data?: bigint };

  const allowanceRead = useReadContract({
    abi: ERC20_ABI,
    address: TOKEN,
    functionName: 'allowance',
    args: address ? [address, STAKING] : undefined,
  }) as { data?: bigint; refetch?: () => Promise<any> };

  const balance   = balanceRead.data   ?? 0n;
  const allowance = allowanceRead.data ?? 0n;

  const needsApprove = allowance < amountWei;
  const canApprove  = isConnected && !busy && amountWei > 0n && needsApprove;
  const canStake    = isConnected && !busy && amountWei > 0n && !needsApprove;

  const onMax = () => setAmount(formatUnits(balance, BGLD_DECIMALS));

  // Detect stake signature (route args properly)
  const stakeVariant = useMemo(() => detectStakeVariant(STAKING_ABI), []);

  // ---- Approve → Stake flow ----
  const onApprove = async () => {
    try {
      setError(null); setTxHash(null); setBusy(true);
      if (!address) throw new Error('Connect wallet');
      if (!TOKEN || !STAKING) throw new Error('Missing contract addresses in env');

      const hash = await writeContractAsync({
        abi: ERC20_ABI as any,
        address: TOKEN,
        functionName: 'approve',
        args: [STAKING, amountWei],
      });

      setTxHash(hash);
      await publicClient!.waitForTransactionReceipt({ hash });
      await allowanceRead.refetch?.();
      setApprovedUI(true);
    } catch (e: any) {
      console.error(e);
      setError(e?.shortMessage || e?.message || 'Approve failed');
    } finally {
      setBusy(false);
    }
  };

  const onStake = async () => {
    try {
      setError(null); setTxHash(null); setBusy(true);
      if (!address) throw new Error('Connect wallet');
      if (!STAKING) throw new Error('Missing staking address in env');

      // prepare args based on detected signature
      let args: any[] = [];
      if (stakeVariant.ok && stakeVariant.kind === 'v3_uint32_bool') {
        args = [amountWei, Number(lockDays), false];
      } else if (stakeVariant.ok && stakeVariant.kind === 'v3_uint256_bool') {
        args = [amountWei, BigInt(lockDays), false];
      } else if (stakeVariant.ok && stakeVariant.kind === 'v2_uint8') {
        args = [amountWei, Number(lockDays)];
      } else if (stakeVariant.ok && stakeVariant.kind === 'v2_uint256') {
        args = [amountWei, BigInt(lockDays)];
      } else {
        throw new Error(
          `Unsupported stake() inputs in ABI: ${JSON.stringify(
            (STAKING_ABI as any[]).find((f: any) => f?.name === 'stake')?.inputs || []
          )}`
        );
      }

      // 1) simulate — if this fails, surface the reason (don’t open wallet)
      try {
        await publicClient!.simulateContract({
          abi: STAKING_ABI as any,
          address: STAKING,
          functionName: 'stake',
          args,
          account: address,
        });
      } catch (e: any) {
        console.error('simulateContract(stake) reverted:', e);
        const msg =
          e?.reason ||
          e?.metaMessages?.join('\n') ||
          e?.shortMessage ||
          e?.message ||
          'Stake simulation failed';
        throw new Error(msg);
      }

      // 2) send tx → wallet confirm
      const hash = await writeContractAsync({
        abi: STAKING_ABI as any,
        address: STAKING,
        functionName: 'stake',
        args,
      });

      setTxHash(hash);
      await publicClient!.waitForTransactionReceipt({ hash });

      setAmount('');
      setApprovedUI(false);
      await allowanceRead.refetch?.();
    } catch (e: any) {
      console.error('Stake failed:', e);
      setError(e?.message || e?.shortMessage || 'Stake failed');
    } finally {
      setBusy(false);
    }
  };

  const estUsd = formatDemoUSD(amountNum);

  // Emergency exit preview numbers (UI only)
  const principalPenalty = emergencyExitPenaltyPercent(lockDays, exitElapsed);
  const vestedPct = vestedRewardsPercent(lockDays, exitElapsed);
  const unvestedPct = unvestedRewardsPercent(lockDays, exitElapsed);

  return (
    <div className="relative rounded-2xl border border-gold/30 bg-black/40 backdrop-blur-md p-6 overflow-hidden">
      <div
        className="absolute -inset-1 opacity-20 blur-2xl"
        style={{ background: 'radial-gradient(500px 150px at 50% -10%, rgba(212,175,55,.25), transparent)' }}
      />
      <div className="relative space-y-6">
        {/* Balance / Net / Acct */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/70">Wallet Balance</div>
          <div className="text-xs text-white/40">
            net: {chainId ?? '—'} · acct: {address ? `${address.slice(0,6)}…${address.slice(-4)}` : '—'}
          </div>
          <div className="text-sm text-gold font-semibold">
            {formatUnits(balance, BGLD_DECIMALS)} {BGLD_SYMBOL}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm text-white/80 mb-2">Amount to Stake</label>
          <div className="flex items-center gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(sanitizeNumber(e.target.value))}
              placeholder={`0.0 ${BGLD_SYMBOL}`}
              inputMode="decimal"
              className="flex-1 rounded-xl bg-black/50 border border-white/15 px-4 py-3 outline-none focus:border-gold/60"
            />
            <button
              onClick={onMax}
              className="rounded-xl px-3 py-2 border border-gold/30 bg-black/30 hover:bg-black/50 text-gold text-sm"
            >
              MAX
            </button>
          </div>
          <div className="text-xs text-white/50 mt-2">Est. USD (hint): ${estUsd}</div>
        </div>

        {/* Lock controls */}
        <div className="space-y-3">
          <label className="block text-sm text-white/80">Lock Duration</label>

          <div className="grid grid-cols-6 gap-2">
            {[1,7,10,14,21,30].map((d) => (
              <button
                key={d}
                onClick={() => setLockDays(d)}
                className={`rounded-xl px-3 py-3 border transition text-center
                  ${lockDays === d
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-white/15 bg-black/30 hover:bg-black/50 text-white/80'}`}
              >
                <div className="text-base font-semibold">{d}d</div>
                <div className="text-[10px] opacity-70">{aprForDays(d)}% APR</div>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1">
              <span>1 day</span>
              <span>Lock: <span className="text-gold font-semibold">{lockDays}d</span></span>
              <span>30 days</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={lockDays}
              onChange={(e) => setLockDays(Number(e.target.value))}
              className="w-full accent-[var(--gold)]"
            />
          </div>

          <div className="text-sm">
            Current APR:&nbsp;
            <span className="text-gold font-semibold">{apr}%</span>
            <span className="text-white/60"> &nbsp;(10% at 1d → 1200% at 30d)</span>
          </div>
        </div>

        {/* Approve / Stake */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onApprove}
            disabled={!canApprove}
            className={`rounded-xl px-4 py-3 font-semibold
              ${canApprove
                ? 'bg-gold text-black hover:bg-[#e6c964]'
                : 'bg-white/10 text-white/60 cursor-not-allowed'}`}
          >
            {approvedUI || !needsApprove ? 'Approved ✓' : (busy ? 'Approving…' : 'Approve')}
          </button>

          <button
            onClick={onStake}
            disabled={!canStake}
            className={`rounded-xl px-4 py-3 font-semibold
              ${canStake
                ? 'bg-gold text-black hover:bg-[#e6c964]'
                : 'bg-white/10 text-white/60 cursor-not-allowed'}`}
          >
            {busy ? 'Staking…' : 'Stake'}
          </button>
        </div>

        {/* Status */}
        {txHash && (
          <div className="text-sm">
            Tx:&nbsp;
            <a className="underline" href={`${explorerTxBaseUrl(chainId)}/${txHash}`} target="_blank" rel="noreferrer">
              view on Basescan
            </a>
          </div>
        )}
        {error && <div className="text-sm text-red-400 whitespace-pre-wrap">{error}</div>}

        {/* Policy Copy */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed">
          <div className="font-semibold text-gold mb-1">Reward Vesting & Early Exit</div>
          <ul className="list-disc ml-5 space-y-1 text-white/80">
            <li>{`Rewards vest linearly across ${lockDays} days. Exiting early forfeits unvested rewards.`}</li>
            <li>
              <span className="font-semibold">Emergency Exit</span>: Available anytime, but a small principal penalty applies
              that <em>starts at 5%</em> on day 0 and decays to <em>0%</em> at maturity.
            </li>
          </ul>

          {/* Emergency Exit Estimator */}
          <div className="mt-4">
            <div className="text-sm font-semibold text-gold mb-2">Emergency Exit Preview</div>

            <div className="flex items-center justify-between text-xs text-white/60 mb-1">
              <span>Exit at day 0</span>
              <span>
                Exit at:&nbsp;<span className="text-gold font-semibold">{exitElapsed} / {lockDays}d</span>
              </span>
              <span>Exit at day {lockDays}</span>
            </div>
            <input
              type="range"
              min={0}
              max={lockDays}
              value={exitElapsed}
              onChange={(e) => setExitElapsed(Number(e.target.value))}
              className="w-full accent-[var(--gold)]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-center">
                <div className="text-[11px] uppercase tracking-wider text-white/60">Principal Penalty</div>
                <div className="text-lg font-semibold text-gold">{formatPct(principalPenalty)}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-center">
                <div className="text-[11px] uppercase tracking-wider text-white/60">Vested Rewards</div>
                <div className="text-lg font-semibold text-gold">{formatPct(vestedPct)}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-center">
                <div className="text-[11px] uppercase tracking-wider text-white/60">Unvested Forfeited</div>
                <div className="text-lg font-semibold text-gold">{formatPct(unvestedPct)}</div>
              </div>
            </div>

            <div className="text-xs text-white/60 mt-2">
              Preview only. Exact amounts calculate on-chain at exit time.
            </div>
          </div>
        </div>

        {/* Debug */}
        <div className="rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-white/70 space-y-1">
          <div className="font-semibold text-gold">Debug</div>
          <div>TOKEN: {TOKEN}</div>
          <div>STAKING: {STAKING}</div>
          <div>chainId: {chainId}</div>
          <div>account: {address}</div>
          <div>amountWei: {amountWei.toString()}</div>
          <div>allowance: {allowance.toString()}</div>
          <div>needsApprove: {String(needsApprove)}</div>
          <div>ERC20_ABI ok: {String(!!(ERC20_ABI as any)?.length)}</div>
          <div>STAKING_ABI ok: {String(!!(STAKING_ABI as any)?.length)}</div>
          <div>
            stake inputs seen:&nbsp;
            {JSON.stringify(
              (STAKING_ABI as any[]).find((f: any) => f?.type === 'function' && f?.name === 'stake')?.inputs?.map((i: any) => i?.type) || []
            )}
          </div>
          <div>
            inferred signature:&nbsp;
            {stakeVariant.ok
              ? (stakeVariant.kind === 'v3_uint32_bool'   ? 'stake(uint256,uint32,bool)'
                : stakeVariant.kind === 'v3_uint256_bool' ? 'stake(uint256,uint256,bool)'
                : stakeVariant.kind === 'v2_uint8'        ? 'stake(uint256,uint8)'
                : stakeVariant.kind === 'v2_uint256'      ? 'stake(uint256,uint256)'
                : 'unknown')
              : 'unknown'}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Utils ===== */
function sanitizeNumber(s: string) {
  return s.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d*).*$/, '$1');
}
function formatDemoUSD(v: number) {
  if (!v || Number.isNaN(v)) return '0.00';
  const price = 0.0005; // visual hint only
  const usd = v * price;
  return usd < 1000 ? usd.toFixed(2) : Math.round(usd).toLocaleString();
}
function clampLock(n?: number) {
  const x = Number(n || 14);
  return Math.max(1, Math.min(30, Math.round(x)));
}
function explorerTxBaseUrl(chainId?: number) {
  if (chainId === 84532) return 'https://sepolia.basescan.org/tx';
  if (chainId === 8453)  return 'https://basescan.org/tx';
  return 'https://basescan.org/tx';
}
