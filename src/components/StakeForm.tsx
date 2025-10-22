'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount /*, useReadContract, useWriteContract*/ } from 'wagmi';
import { parseUnits /*, formatUnits*/ } from 'viem';
import {
  BGLD_DECIMALS,
  BGLD_SYMBOL,
  aprForDays,
  emergencyExitPenaltyPercent,
  vestedRewardsPercent,
  unvestedRewardsPercent,
  formatPct,
} from '@/lib/constants';
// import { BGLD_TOKEN, VAULT_ADDRESS } from '@/lib/constants';
// import ERC20 from '@/lib/abis/ERC20.json';
// import VAULT from '@/lib/abis/Vault.json';

const DEMO = true; // flip to false when wiring contracts

export default function StakeForm({ initialLockDays = 14 }: { initialLockDays?: number }) {
  const { isConnected /*, address*/ } = useAccount();

  // Demo local state
  const [bgldBalance, setBgldBalance] = useState<string>('250000');
  const [amount, setAmount] = useState<string>('');
  const [lockDays, setLockDays] = useState<number>(clampLock(initialLockDays));
  const [approved, setApproved] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Emergency exit estimator (visual only)
  const [exitElapsed, setExitElapsed] = useState<number>(0);

  useEffect(() => {
    setLockDays(clampLock(initialLockDays));
  }, [initialLockDays]);

  const apr = useMemo(() => aprForDays(lockDays), [lockDays]);
  const amountNum = useMemo(() => Number(amount || 0), [amount]);
  const canApprove = isConnected && !busy && amountNum > 0;
  const canStake = isConnected && !busy && amountNum > 0 && approved;

  const onMax = () => setAmount(bgldBalance);

  const onApprove = async () => {
    try {
      setError(null); setTxHash(null); setBusy(true);
      if (DEMO) {
        await sleep(900);
        setApproved(true);
      } else {
        // const value = parseUnits(amount, BGLD_DECIMALS);
        // const tx = await writeContractAsync({ ...approve call... });
        // setTxHash(tx as string);
      }
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'Approve failed');
    } finally {
      setBusy(false);
    }
  };

  const onStake = async () => {
    try {
      setError(null); setTxHash(null); setBusy(true);
      if (DEMO) {
        await sleep(1100);
        const newBal = Math.max(0, Number(bgldBalance) - Number(amount)).toString();
        setBgldBalance(newBal);
      } else {
        // const value = parseUnits(amount, BGLD_DECIMALS);
        // const tx = await writeContractAsync({ ...stake call... });
        // setTxHash(tx as string);
      }
      setAmount('');
      setApproved(false);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'Stake failed');
    } finally {
      setBusy(false);
    }
  };

  const estUsd = formatDemoUSD(amountNum);

  // Emergency exit preview numbers (UI only)
  const principalPenalty = emergencyExitPenaltyPercent(lockDays, exitElapsed); // now max 5%
  const vestedPct = vestedRewardsPercent(lockDays, exitElapsed);
  const unvestedPct = unvestedRewardsPercent(lockDays, exitElapsed);

  return (
    <div className="relative rounded-2xl border border-gold/30 bg-black/40 backdrop-blur-md p-6 overflow-hidden">
      <div
        className="absolute -inset-1 opacity-20 blur-2xl"
        style={{ background: 'radial-gradient(500px 150px at 50% -10%, rgba(212,175,55,.25), transparent)' }}
      />
      <div className="relative space-y-6">
        {/* Balance */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/70">Wallet Balance</div>
          <div className="text-sm text-gold font-semibold">
            {Number(bgldBalance).toLocaleString()} {BGLD_SYMBOL}
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
          <div className="text-xs text-white/50 mt-2">Est. USD (demo): ${estUsd}</div>
        </div>

        {/* Lock controls */}
        <div className="space-y-3">
          <label className="block text-sm text-white/80">Lock Duration</label>

          {/* Quick picks: 1,7,10,14,21,30 */}
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

          {/* Day slider 1–30 */}
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

          {/* Dynamic APR */}
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
            {approved ? 'Approved ✓' : (busy ? 'Approving…' : 'Approve')}
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
            <a className="underline" href={`https://basescan.org/tx/${txHash}`} target="_blank">
              view on Basescan
            </a>
          </div>
        )}
        {error && <div className="text-sm text-red-400">{error}</div>}

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

          {/* Emergency Exit Estimator — calm, optional */}
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

        <div className="text-xs text-white/60">
          By staking you agree to the&nbsp;
          <a href="/terms" className="underline text-gold">Terms of Use</a>. Locks cannot be withdrawn early without penalty.
        </div>
      </div>
    </div>
  );
}

/* ===== Utils ===== */
function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }
function sanitizeNumber(s: string) {
  return s.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d*).*$/, '$1');
}
function formatDemoUSD(v: number) {
  if (!v || Number.isNaN(v)) return '0.00';
  const price = 0.005; // demo UI price
  const usd = v * price;
  return usd < 1000 ? usd.toFixed(2) : Math.round(usd).toLocaleString();
}
function clampLock(n?: number) {
  const x = Number(n || 14);
  return Math.max(1, Math.min(30, Math.round(x)));
}
