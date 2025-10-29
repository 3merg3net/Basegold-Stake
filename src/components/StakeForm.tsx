'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  usePublicClient,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

import {
  BGLD_DECIMALS,
  BGLD_SYMBOL,
  aprForDays,
  emergencyExitPenaltyPercent,
  vestedRewardsPercent,
  unvestedRewardsPercent,
  formatPct,
} from '@/lib/constants';

// TS ABIs (no JSON imports)
import ERC20_ABI from '@/lib/abis/ERC20';
import STAKING_ABI from '@/lib/abis/BaseGoldStaking';

const TOKEN   = (process.env.NEXT_PUBLIC_BGLD_ADDRESS    || '').toLowerCase() as `0x${string}`;
const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').toLowerCase() as `0x${string}`;

// Gate for public staking (set to '1' to enable on prod)
const PUBLIC_ENABLED = process.env.NEXT_PUBLIC_PUBLIC_STAKING_ENABLED === '1';

/** Detect which stake() the contract exposes so we pass the right arg types */
function detectStakeVariant(abi: unknown) {
  try {
    const arr = abi as ReadonlyArray<any>;
    const stake = arr.find((f) => f?.type === 'function' && f?.name === 'stake');
    const types: string[] = stake?.inputs?.map((i: any) => i?.type) || [];
    const sig = types.join(',');
    if (sig === 'uint256,uint32,bool') return { ok: true, kind: 'v3_uint32_bool' as const };
    if (sig === 'uint256,uint256,bool') return { ok: true, kind: 'v3_uint256_bool' as const };
    if (sig === 'uint256,uint8')        return { ok: true, kind: 'v2_uint8'       as const };
    if (sig === 'uint256,uint256')      return { ok: true, kind: 'v2_uint256'     as const };
    return { ok: false, kind: 'unknown' as const };
  } catch {
    return { ok: false, kind: 'unknown' as const };
  }
}

export default function StakeForm({ initialLockDays = 14 }: { initialLockDays?: number }) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  // UI state
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

  // Reads
  const { data: balance = 0n } = useReadContract({
    abi: ERC20_ABI,
    address: TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && !!TOKEN },
  });

  const { data: allowance = 0n, refetch: refetchAllowance } = useReadContract({
    abi: ERC20_ABI,
    address: TOKEN,
    functionName: 'allowance',
    args: address ? [address, STAKING] : undefined,
    query: { enabled: isConnected && !!address && !!STAKING && !!TOKEN },
  });

  const needsApprove = allowance < amountWei;
  const canApprove  = isConnected && !busy && amountWei > 0n && needsApprove;

  // Stake is only allowed if public enabled
  const stakeGateOk = PUBLIC_ENABLED;
  const canStake    = isConnected && !busy && amountWei > 0n && !needsApprove && stakeGateOk;

  const onMax = () => setAmount(fmtToken(balance, BGLD_DECIMALS, 6)); // readable fill

  const stakeVariant = useMemo(() => detectStakeVariant(STAKING_ABI), []);

  // Approve
  const onApprove = async () => {
    try {
      setError(null); setTxHash(null); setBusy(true);
      if (!address) throw new Error('Connect wallet');
      if (!TOKEN || !STAKING) throw new Error('Missing contract addresses');

      const hash = await writeContractAsync({
        abi: ERC20_ABI,
        address: TOKEN,
        functionName: 'approve',
        args: [STAKING, amountWei] as const,
      });

      setTxHash(hash);
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchAllowance();
      setApprovedUI(true);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'Approve failed');
    } finally {
      setBusy(false);
    }
  };

  // Stake
  const onStake = async () => {
    try {
      setError(null); setTxHash(null); setBusy(true);
      if (!address) throw new Error('Connect wallet');
      if (!STAKING) throw new Error('Missing staking address');
      if (!stakeGateOk) throw new Error('Public staking is not yet enabled.');

      let args:
        | readonly [bigint, number, boolean]
        | readonly [bigint, bigint, boolean]
        | readonly [bigint, number]
        | readonly [bigint, bigint];

      if (stakeVariant.ok && stakeVariant.kind === 'v3_uint32_bool') {
        args = [amountWei, Number(lockDays), false] as const;
      } else if (stakeVariant.ok && stakeVariant.kind === 'v3_uint256_bool') {
        args = [amountWei, BigInt(lockDays), false] as const;
      } else if (stakeVariant.ok && stakeVariant.kind === 'v2_uint8') {
        args = [amountWei, Number(lockDays)] as const;
      } else if (stakeVariant.ok && stakeVariant.kind === 'v2_uint256') {
        args = [amountWei, BigInt(lockDays)] as const;
      } else {
        throw new Error('Unsupported stake() signature on this contract');
      }

      // Pre-simulate to surface reverts clearly
      await publicClient!.simulateContract({
        abi: STAKING_ABI as unknown as readonly unknown[],
        address: STAKING,
        functionName: 'stake',
        args,
        account: address!,
      });

      // Send tx
      const hash = await writeContractAsync({
        abi: STAKING_ABI as unknown as readonly unknown[],
        address: STAKING,
        functionName: 'stake',
        args,
      });

      setTxHash(hash);
      await publicClient!.waitForTransactionReceipt({ hash });

      setAmount('');
      setApprovedUI(false);
      await refetchAllowance();
    } catch (e: any) {
      const msg =
        e?.reason ||
        e?.metaMessages?.join('\n') ||
        e?.shortMessage ||
        e?.message ||
        'Stake failed';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const estUsd = formatDemoUSD(amountNum);
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

        {/* --- Gold vault seeding banner (shows when public staking is OFF) --- */}
        {!PUBLIC_ENABLED && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-center p-3 font-medium shadow-md animate-pulseGold">
            <span className="drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
              Public staking will be live soon — Gold vault seeding in progress 
            </span>
          </div>
        )}

        {/* Balance / Net / Acct */}
        <div className="grid grid-cols-3 items-center gap-2">
          <div className="text-sm text-white/70 truncate">Wallet Balance</div>
          <div className="text-xs text-white/40 text-center truncate">
            net: {chainId ?? '—'} · acct: {address ? `${address.slice(0,6)}…${address.slice(-4)}` : '—'}
          </div>
          <div className="text-right text-sm text-gold font-semibold truncate">
            {fmtToken(balance, BGLD_DECIMALS, 2)} {BGLD_SYMBOL}
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
              className="rounded-xl px-3 py-2 border border-gold/30 bg-black/30 hover:bg-black/50 text-gold text-sm whitespace-nowrap"
            >
              MAX
            </button>
          </div>
          <div className="text-xs text-white/50 mt-2">Est. USD (hint): ${estUsd}</div>
        </div>

        {/* Lock controls */}
        <div className="space-y-3">
          <label className="block text-sm text-white/80">Lock Duration</label>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1,7,10,14,21,30].map((d) => (
              <button
                key={d}
                onClick={() => setLockDays(d)}
                className="rounded-xl px-3 py-3 border transition text-center whitespace-nowrap"
                style={{
                  borderColor: lockDays === d ? 'rgba(212,175,55,.9)' : 'rgba(255,255,255,.15)',
                  background: lockDays === d ? 'rgba(212,175,55,.08)' : 'rgba(0,0,0,.3)',
                  color:      lockDays === d ? 'rgba(212,175,55,1)'  : 'rgba(255,255,255,.85)',
                }}
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={onApprove}
            disabled={!canApprove}
            className={`rounded-xl px-3 py-3 font-semibold text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis
              ${canApprove ? 'bg-gold text-black hover:bg-[#e6c964]'
                           : 'bg-white/10 text-white/60 cursor-not-allowed'}`}
          >
            {approvedUI || !needsApprove ? 'Approved ✓' : (busy ? 'Approving…' : 'Approve')}
          </button>

          <button
            onClick={onStake}
            disabled={!canStake}
            className={`rounded-xl px-3 py-3 font-semibold text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis
              ${canStake ? 'bg-gold text-black hover:bg-[#e6c964]'
                         : 'bg-white/10 text-white/60 cursor-not-allowed'}`}
            title={!stakeGateOk ? 'Vault seeding in progress — public staking opens soon' : undefined}
          >
            {stakeGateOk ? (busy ? 'Staking…' : 'Stake') : 'Stake (disabled)'}
          </button>
        </div>

        {!stakeGateOk && (
          <div className="text-xs text-amber-300/80 text-center">
            Vault seeding in progress. Staking will open publicly once complete.
          </div>
        )}

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

        {/* Mechanics copy */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed">
          <div className="font-semibold text-gold mb-1">Reward Vesting & Early Exit</div>
          <ul className="list-disc ml-5 space-y-1 text-white/80">
            <li>{`Rewards vest linearly across ${lockDays} days. Exiting early forfeits unvested rewards.`}</li>
            <li>
              <span className="font-semibold">Emergency Exit</span>: Available anytime; a principal penalty applies and
              decays to <em>0%</em> at maturity.
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
              <MetricBox label="Principal Penalty" value={formatPct(principalPenalty)} />
              <MetricBox label="Vested Rewards" value={formatPct(vestedPct)} />
              <MetricBox label="Unvested Forfeited" value={formatPct(unvestedPct)} />
            </div>

            <div className="text-xs text-white/60 mt-2">
              Preview only. Exact amounts calculate on-chain at exit time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */
function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-center">
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="text-lg font-semibold text-gold truncate">{value}</div>
    </div>
  );
}

/* ---------- utils ---------- */
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
