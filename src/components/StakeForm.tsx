// src/components/StakeForm.tsx
'use client';

import { useMemo, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';
import ERC20_ABI_RAW from '@/lib/abis/ERC20';

// ---- Normalize ERC20 ABI (array or artifact) ----
function normalizeAbi(mod: any) {
  const m = (mod && (mod.default ?? mod)) as any;
  if (Array.isArray(m)) return m;
  if (Array.isArray(m?.abi)) return m.abi;
  return m;
}
const ERC20_ABI = normalizeAbi(ERC20_ABI_RAW);

// ---- Minimal inline ABI for staking call only (unchanged) ----
const STAKING_STUB_ABI = [
  {
    type: 'function',
    name: 'stake',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'daysLocked', type: 'uint32' },
      { name: 'autoCompound', type: 'bool' },
    ],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
] as const;

// ---- Minimal Uniswap V3 Pool ABI (for price) ----
const UNIV3_POOL_ABI = [
  { type: 'function', name: 'slot0', stateMutability: 'view', inputs: [], outputs: [
    { name: 'sqrtPriceX96', type: 'uint160' },
    { name: 'tick', type: 'int24' },
    { name: 'observationIndex', type: 'uint16' },
    { name: 'observationCardinality', type: 'uint16' },
    { name: 'observationCardinalityNext', type: 'uint16' },
    { name: 'feeProtocol', type: 'uint8' },
    { name: 'unlocked', type: 'bool' },
  ] },
  { type: 'function', name: 'token0', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'token1', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
] as const;

type Props = {
  className?: string;
  initialLockDays?: number; // defaults to 7
};

const env = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim().toLowerCase(),
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase(),
  POOL: (process.env.NEXT_PUBLIC_UNIV3_POOL || '').trim().toLowerCase(),
  WETH: (process.env.NEXT_PUBLIC_WETH_ADDRESS || '').trim().toLowerCase(),
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'),
  STAKING_ENABLED: (process.env.NEXT_PUBLIC_STAKING_ENABLED ?? '1') !== '0', // default ON
  ETH_USD_OVERRIDE: (process.env.NEXT_PUBLIC_ETH_USD_OVERRIDE || '').trim(),
};

function clampDays(v: number) {
  if (!Number.isFinite(v)) return 7;
  return Math.max(1, Math.min(30, Math.floor(v)));
}
function fmtSmall(n?: number, digits = 6) {
  if (!Number.isFinite(n!)) return '—';
  if (Math.abs(n!) >= 1) return n!.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return Number(n!).toPrecision(digits);
}

export default function StakeForm({ className, initialLockDays = 7 }: Props) {
  const { address, chainId } = useAccount();

  const [amount, setAmount] = useState<string>('');
  const [days, setDays] = useState<number>(clampDays(initialLockDays));
  const [autoCompound, setAutoCompound] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  // --- Reads: ERC20 (decimals, balance, allowance) + Pool (slot0/token0/token1) ---
  const { data: reads, refetch: refetchReads } = useReadContracts({
    allowFailure: true,
    contracts: [
      // ERC20
      { abi: ERC20_ABI as any, address: env.BGLD as `0x${string}`, functionName: 'decimals' },
      address ? { abi: ERC20_ABI as any, address: env.BGLD as `0x${string}`, functionName: 'balanceOf', args: [address as `0x${string}`] } : undefined,
      address ? { abi: ERC20_ABI as any, address: env.BGLD as `0x${string}`, functionName: 'allowance', args: [address as `0x${string}`, env.STAKING as `0x${string}`] } : undefined,

      // Pool price
      env.POOL ? { abi: UNIV3_POOL_ABI as any, address: env.POOL as `0x${string}`, functionName: 'slot0' } : undefined,
      env.POOL ? { abi: UNIV3_POOL_ABI as any, address: env.POOL as `0x${string}`, functionName: 'token0' } : undefined,
      env.POOL ? { abi: UNIV3_POOL_ABI as any, address: env.POOL as `0x${string}`, functionName: 'token1' } : undefined,
    ].filter(Boolean) as any[],
  });

  const bgldDecimals = (reads?.[0]?.result as number | undefined) ?? 18;
  const walletBgld   = (reads?.[1]?.result as bigint | undefined) ?? 0n;
  const allowance    = (reads?.[2]?.result as bigint | undefined) ?? 0n;

  const slot0      = reads?.[3]?.result as any | undefined;
  const poolToken0 = (reads?.[4]?.result as `0x${string}` | undefined)?.toLowerCase();
  const poolToken1 = (reads?.[5]?.result as `0x${string}` | undefined)?.toLowerCase();

  // --- Parse amount -> wei ---
  const parsedAmount: bigint | undefined = useMemo(() => {
    try {
      if (!amount || Number(amount) <= 0) return undefined;
      return parseUnits(amount, bgldDecimals);
    } catch { return undefined; }
  }, [amount, bgldDecimals]);

  // --- Approve state ---
  const needsApprove = useMemo(() => {
    if (!parsedAmount) return false;
    return allowance < parsedAmount;
  }, [allowance, parsedAmount]);

  // --- Network gate (unchanged) ---
  const wrongNetwork = useMemo(() => {
    return Boolean(chainId && env.CHAIN_ID && chainId !== env.CHAIN_ID);
  }, [chainId]);

  // --- Price calc (float UI only) ---
  const { ethPerBgld, bgldUsd } = useMemo(() => {
    try {
      if (!slot0 || !poolToken0 || !poolToken1 || !env.WETH || !env.BGLD) return { ethPerBgld: undefined, bgldUsd: undefined };

      const sqrtPriceX96 = slot0[0] as bigint;
      const s = Number(sqrtPriceX96); // UI float (precision loss ok)
      const q = 2 ** 96;
      const price = (s / q) * (s / q); // token1 per token0

      let _ethPerBgld: number | undefined;
      // orientation
      if (poolToken0 === env.WETH && poolToken1 === env.BGLD) {
        // price = BGLD per 1 WETH
        const bgldPerEth = price;
        _ethPerBgld = bgldPerEth > 0 ? 1 / bgldPerEth : undefined;
      } else if (poolToken0 === env.BGLD && poolToken1 === env.WETH) {
        // price = WETH per 1 BGLD
        _ethPerBgld = price;
      }

      const ethUsd = Number(env.ETH_USD_OVERRIDE) > 0 ? Number(env.ETH_USD_OVERRIDE) : undefined;
      const _bgldUsd = _ethPerBgld && ethUsd ? _ethPerBgld * ethUsd : undefined;
      return { ethPerBgld: _ethPerBgld, bgldUsd: _bgldUsd };
    } catch {
      return { ethPerBgld: undefined, bgldUsd: undefined };
    }
  }, [slot0, poolToken0, poolToken1]);

  // --- USD hint for input amount ---
  const estUsdHint = useMemo(() => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0 || !bgldUsd) return '0.00';
    const v = n * bgldUsd;
    return v >= 1 ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : fmtSmall(v);
  }, [amount, bgldUsd]);

  const { writeContractAsync } = useWriteContract();

  async function onApprove() {
    try {
      if (!address) throw new Error('Connect wallet');
      if (!parsedAmount) throw new Error('Enter amount');
      if (wrongNetwork) throw new Error('Wrong network');

      setStatus('Approving…');
      const txHash = await writeContractAsync({
        abi: ERC20_ABI as any,
        address: env.BGLD as `0x${string}`,
        functionName: 'approve',
        args: [env.STAKING as `0x${string}`, parsedAmount],
        chainId: env.CHAIN_ID,
      });
      setStatus(`Approve submitted: ${txHash.slice(0, 10)}…`);
      setTimeout(() => refetchReads(), 1000);
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || 'Approve failed');
    }
  }

  async function onStake() {
    try {
      if (!env.STAKING_ENABLED) throw new Error('Staking is disabled');
      if (!address) throw new Error('Connect wallet');
      if (!parsedAmount) throw new Error('Enter amount');
      if (wrongNetwork) throw new Error('Wrong network');
      if (needsApprove) throw new Error('Approve required');

      setStatus('Staking…');
      // EXACT signature: stake(uint256 amount, uint32 daysLocked, bool autoCompound)
      const txHash = await writeContractAsync({
        abi: STAKING_STUB_ABI as any, // keep minimal stub so "stake" always exists
        address: env.STAKING as `0x${string}`,
        functionName: 'stake',
        args: [parsedAmount, Number(days), Boolean(autoCompound)],
        chainId: env.CHAIN_ID,
      });
      setStatus(`Stake submitted: ${txHash.slice(0, 10)}…`);
      setAmount('');
      setTimeout(() => refetchReads(), 1500);
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || 'Stake failed');
    }
  }

  return (
    <div className={className}>
      {status && (
        <div className="mb-3 rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {status}
        </div>
      )}

      {/* Wallet balance line */}
      <div className="mb-1 text-xs text-white/60">
        Wallet:&nbsp;
        <span className="text-amber-200">
          {formatUnits(walletBgld, bgldDecimals)} BGLD
        </span>
      </div>

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
      <div className="mt-1 text-xs text-white/50">
        Est. USD: ${estUsdHint}
        {bgldUsd ? (
          <span className="ml-2 text-white/40">
            (≈ ${fmtSmall(bgldUsd, 8)} / BGLD)
          </span>
        ) : null}
      </div>

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
              Rewards roll into principal and the lock restarts. You can turn it off from your vault later.
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

      {/* actions (unchanged gating) */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!parsedAmount || !address || wrongNetwork || !env.BGLD}
          onClick={onApprove}
          className={`rounded-xl px-4 py-2 border ${
            needsApprove ? 'border-amber-400 text-amber-200' : 'border-white/15 text-white/60'
          } bg-black/40`}
        >
          {needsApprove ? 'Approve' : 'Approved ✓'}
        </button>

        <button
          type="button"
          disabled={!parsedAmount || needsApprove || !env.STAKING_ENABLED || wrongNetwork}
          onClick={onStake}
          className="rounded-xl px-4 py-2 border border-emerald-400 text-emerald-200 bg-black/40 disabled:opacity-50"
        >
          Stake
        </button>
      </div>
    </div>
  );
}
