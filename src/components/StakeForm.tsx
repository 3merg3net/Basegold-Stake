// src/components/StakeForm.tsx
'use client';

import {useEffect, useMemo, useState} from 'react';
import {formatUnits, parseUnits} from 'viem';
import {useAccount, useReadContracts, useWriteContract} from 'wagmi';
import ERC20_ABI from '@/lib/abis/ERC20';
import STAKING_ABI from '@/lib/abis/BaseGoldStaking';

type Props = {
  className?: string;
  /** optional default slider position; clamped to [1,30] */
  initialLockDays?: number;
};

const env = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').toLowerCase(),
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').toLowerCase(),
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'),
  STAKING_ENABLED: (process.env.NEXT_PUBLIC_STAKING_ENABLED || '0') === '1',
};

function clampDays(v: number) {
  if (!Number.isFinite(v)) return 7;
  return Math.max(1, Math.min(30, Math.floor(v)));
}

export default function StakeForm({ className, initialLockDays = 7 }: Props) {
  const { address, chainId } = useAccount();

  // ✅ STATE INIT — this is the bit you needed
  const [amount, setAmount] = useState<string>('');               // user input (BGLD)
  const [days, setDays] = useState<number>(clampDays(initialLockDays));
  const [autoCompound, setAutoCompound] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  // read decimals, wallet balance, allowance
  const { data: reads } = useReadContracts({
    allowFailure: true,
    contracts: [
      { abi: ERC20_ABI as any, address: env.BGLD as `0x${string}`, functionName: 'decimals' },
      address ? { abi: ERC20_ABI as any, address: env.BGLD as `0x${string}`, functionName: 'balanceOf', args: [address as `0x${string}`] } : undefined,
      address ? { abi: ERC20_ABI as any, address: env.BGLD as `0x${string}`, functionName: 'allowance', args: [address as `0x${string}`, env.STAKING as `0x${string}`] } : undefined,
    ].filter(Boolean) as any[],
  });

  const bgldDecimals = (reads?.[0]?.result as number | undefined) ?? 18;
  const walletBgld = (reads?.[1]?.result as bigint | undefined) ?? 0n;
  const allowance   = (reads?.[2]?.result as bigint | undefined) ?? 0n;

  const parsedAmount: bigint | undefined = useMemo(() => {
    try {
      if (!amount || Number(amount) <= 0) return undefined;
      return parseUnits(amount, bgldDecimals);
    } catch {
      return undefined;
    }
  }, [amount, bgldDecimals]);

  const needsApprove = useMemo(() => {
    if (!parsedAmount) return false;
    return allowance < parsedAmount;
  }, [allowance, parsedAmount]);

  const { writeContractAsync } = useWriteContract();

  async function onApprove() {
    try {
      if (!address) throw new Error('Connect wallet');
      if (!parsedAmount) throw new Error('Enter amount');
      setStatus('Approving…');
      const tx = await writeContractAsync({
        abi: ERC20_ABI as any,
        address: env.BGLD as `0x${string}`,
        functionName: 'approve',
        args: [env.STAKING as `0x${string}`, parsedAmount],
        chainId: env.CHAIN_ID,
      });
      setStatus(`Approve submitted: ${tx.slice(0, 10)}…`);
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || 'Approve failed');
    }
  }

  async function onStake() {
    try {
      if (!env.STAKING_ENABLED) throw new Error('Staking is disabled');
      if (!address) throw new Error('Connect wallet');
      if (!parsedAmount) throw new Error('Enter amount');
      if (chainId && chainId !== env.CHAIN_ID) throw new Error('Wrong network');

      setStatus('Staking…');
      // exact signature: stake(uint256 amount, uint32 daysLocked, bool autoCompound)
      const tx = await writeContractAsync({
        abi: STAKING_ABI as any,
        address: env.STAKING as `0x${string}`,
        functionName: 'stake',
        args: [parsedAmount, BigInt(days) as unknown as number, autoCompound],
        chainId: env.CHAIN_ID,
      });
      setStatus(`Stake submitted: ${tx.slice(0, 10)}…`);
      setAmount('');
    } catch (e: any) {
      // This is the error you saw on MM if the signature mismatches
      setStatus(e?.shortMessage || e?.message || 'Stake failed');
    }
  }

  const estUsdHint = '0.00'; // (optional) wire in your price logic if you want the hint

  return (
    <div className={className}>
      {/* top-line status/errors */}
      {status && (
        <div className="mb-3 rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {status}
        </div>
      )}

      {/* amount */}
      <label className="block text-sm text-white/70 mb-1">Amount to Stake</label>
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-amber-100"
          inputMode="decimal"
          placeholder="0.0 BGLD"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white/80"
          onClick={() => setAmount(formatUnits(walletBgld, bgldDecimals))}
          type="button"
        >
          MAX
        </button>
      </div>
      <div className="mt-1 text-xs text-white/50">Est. USD (hint): ${estUsdHint}</div>

      {/* days slider */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>1 day</span>
          <span>Lock: {days}d</span>
          <span>30 days</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          value={days}
          onChange={(e) => setDays(clampDays(Number(e.target.value)))}
          className="w-full"
        />
      </div>

      {/* auto-compound */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-amber-200 font-semibold">Auto-Compound</div>
            <div className="text-sm text-white/70">
              Rewards roll into principal and lock restarts. You can turn it off from your vault later.
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoCompound}
              onChange={(e) => setAutoCompound(e.target.checked)}
            />
            <span className="text-white/80">Enable</span>
          </label>
        </div>
      </div>

      {/* actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!parsedAmount || !address}
          onClick={onApprove}
          className={`rounded-xl px-4 py-2 border ${
            needsApprove ? 'border-amber-400 text-amber-200' : 'border-white/15 text-white/60'
          } bg-black/40`}
        >
          {needsApprove ? 'Approve' : 'Approved ✓'}
        </button>

        <button
          type="button"
          disabled={!parsedAmount || needsApprove || !env.STAKING_ENABLED}
          onClick={onStake}
          className="rounded-xl px-4 py-2 border border-emerald-400 text-emerald-200 bg-black/40 disabled:opacity-50"
        >
          Stake
        </button>
      </div>
    </div>
  );
}
