'use client';

import {useEffect, useMemo, useState} from 'react';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContracts,
  useSwitchChain,
  useWriteContract,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

import ERC20_ABI from '@/lib/abis/ERC20';
import STAKING_ABI from '@/lib/abis/BaseGoldStaking'; // <- the new ABI you pasted

type Props = { className?: string };

// Build-time inlined by Next.js (no runtime `process` access in the browser)
const ENV = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim() as `0x${string}`,
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim() as `0x${string}`,
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'),
  STAKING_ENABLED: (process.env.NEXT_PUBLIC_STAKING_ENABLED || '0').trim() === '1',
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function StakeForm({ className }: Props) {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [amountStr, setAmountStr] = useState<string>('');
  const [days, setDays] = useState<number>(7);
  const [auto, setAuto] = useState<boolean>(false);

  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const enabled =
    Boolean(ENV.BGLD && ENV.STAKING && isConnected) &&
    ENV.STAKING_ENABLED;

  // 1) Read bgld decimals, wallet balance, allowance
  const { data: reads } = useReadContracts({
    allowFailure: true,
    contracts: !enabled || !address ? [] : ([
      { abi: ERC20_ABI as any, address: ENV.BGLD, functionName: 'decimals' },
      { abi: ERC20_ABI as any, address: ENV.BGLD, functionName: 'balanceOf', args: [address] },
      { abi: ERC20_ABI as any, address: ENV.BGLD, functionName: 'allowance', args: [address, ENV.STAKING] },
    ] as const),
  });

  const decimals = (reads?.[0]?.result as number | undefined) ?? 18;
  const walletBgld = (reads?.[1]?.result as bigint | undefined) ?? 0n;
  const allowance = (reads?.[2]?.result as bigint | undefined) ?? 0n;

  const amountBn = useMemo(() => {
    try {
      const clean = (amountStr || '').trim();
      if (!clean) return 0n;
      return parseUnits(clean, decimals);
    } catch {
      return 0n;
    }
  }, [amountStr, decimals]);

  const walletStr = useMemo(() => {
    try { return Number(formatUnits(walletBgld, decimals)).toLocaleString(); }
    catch { return '0'; }
  }, [walletBgld, decimals]);

  const needsApprove = enabled && amountBn > 0n && allowance < amountBn;

  // 2) Approve
  async function onApprove() {
    setError(''); setStatus('Preparing approval…');
    try {
      if (chainId !== ENV.CHAIN_ID) {
        await switchChainAsync?.({ chainId: ENV.CHAIN_ID });
      }
      // simulate (clear revert reasons early)
      await publicClient!.simulateContract({
        abi: ERC20_ABI as any,
        address: ENV.BGLD,
        functionName: 'approve',
        args: [ENV.STAKING, amountBn],
        account: address!,
      });
      setStatus('Sending approval…');
      const tx = await writeContractAsync({
        abi: ERC20_ABI as any,
        address: ENV.BGLD,
        functionName: 'approve',
        args: [ENV.STAKING, amountBn],
      });
      setStatus(`Approval submitted: ${tx.slice(0, 10)}…`);
    } catch (e: any) {
      setError(labelError(e, 'Approval failed'));
      setStatus('');
    }
  }

  // 3) Stake (3-arg signature)
  async function onStake() {
    setError('');
    try {
      if (!ENV.STAKING_ENABLED) {
        setError('Staking is disabled.');
        return;
      }
      if (!amountBn || amountBn <= 0n) {
        setError('Enter an amount.');
        return;
      }
      // Basic input guards
      const d = clamp(Math.floor(days), 1, 30);
      if (chainId !== ENV.CHAIN_ID) {
        await switchChainAsync?.({ chainId: ENV.CHAIN_ID });
      }

      // simulate first — catches “Unsupported stake() signature” instantly if ABI/args mismatch
      await publicClient!.simulateContract({
        abi: STAKING_ABI as any,
        address: ENV.STAKING,
        functionName: 'stake',
        args: [amountBn, BigInt(d), Boolean(auto)],
        account: address!,
      });

      setStatus('Sending stake…');
      const tx = await writeContractAsync({
        abi: STAKING_ABI as any,
        address: ENV.STAKING,
        functionName: 'stake',
        args: [amountBn, BigInt(d), Boolean(auto)],
      });
      setStatus(`Stake submitted: ${tx.slice(0, 10)}…`);
      // optimistic reset
      setAmountStr('');
    } catch (e: any) {
      setError(labelError(e, 'Stake failed'));
      setStatus('');
    }
  }

  // 4) UX helpers
  const wrongNet = isConnected && chainId !== ENV.CHAIN_ID;
  const disabled =
    !enabled ||
    wrongNet ||
    !address;

  return (
    <div className={className}>
      {/* Status / errors */}
      {status && (
        <div className="mb-3 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
          {status}
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}
      {wrongNet && (
        <div className="mb-3 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-sm text-yellow-100">
          Wrong network. Please switch to Base ({ENV.CHAIN_ID}).
        </div>
      )}
      {!ENV.STAKING_ENABLED && (
        <div className="mb-3 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70">
          Staking is currently disabled.
        </div>
      )}

      {/* Wallet line */}
      <div className="mb-2 text-xs text-white/60">
        Wallet balance: <span className="tabular-nums text-white/90">{walletStr}</span> BGLD
      </div>

      {/* Amount input */}
      <div className="flex items-center gap-2">
        <input
          inputMode="decimal"
          placeholder="0.0 BGLD"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-base text-white outline-none focus:border-amber-300/40"
        />
        <button
          type="button"
          onClick={() => setAmountStr(formatUnits(walletBgld, decimals))}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          MAX
        </button>
      </div>

      {/* Lock slider */}
      <div className="mt-4">
        <div className="mb-1 text-xs uppercase tracking-wider text-white/60">Lock Duration</div>
        <input
          type="range"
          min={1}
          max={30}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-1 text-sm text-white/80">{days} day{days === 1 ? '' : 's'}</div>
        <div className="mt-1 text-xs text-white/60">
          Current APR scales with term (contract-side calculation).
        </div>
      </div>

      {/* Auto-compound */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-3">
        <div>
          <div className="text-sm font-semibold text-amber-200">Auto-Compound</div>
          <div className="text-xs text-white/60">
            Periodically roll rewards into principal; lock restarts. You can toggle it later.
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
            className="h-5 w-5 accent-amber-300"
          />
          <span className="text-sm text-white/80">{auto ? 'On' : 'Off'}</span>
        </label>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onApprove}
          disabled={disabled || !needsApprove || amountBn === 0n}
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            disabled || !needsApprove || amountBn === 0n
              ? 'cursor-not-allowed border border-white/10 bg-white/5 text-white/40'
              : 'border border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/15'
          }`}
        >
          {needsApprove ? 'Approve BGLD' : 'Approved ✓'}
        </button>
        <button
          type="button"
          onClick={onStake}
          disabled={
            disabled ||
            amountBn === 0n ||
            needsApprove
          }
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            disabled || amountBn === 0n || needsApprove
              ? 'cursor-not-allowed border border-white/10 bg-white/5 text-white/40'
              : 'border border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/15'
          }`}
        >
          Stake
        </button>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function labelError(e: unknown, fallback: string) {
  try {
    const msg =
      (e as any)?.shortMessage ||
      (e as any)?.message ||
      (e as any)?.cause?.shortMessage ||
      (e as any)?.cause?.message ||
      '';
    if (!msg) return fallback;
    // common readable trims
    return msg
      .replace(/Contract function .* execution reverted/i, 'Execution reverted')
      .replace(/\(see docs:.*?\)/i, '')
      .trim();
  } catch {
    return fallback;
  }
}
