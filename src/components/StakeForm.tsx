'use client';

import { useMemo, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';
import ERC20_ABI_RAW from '@/lib/abis/ERC20';
import { useBgldPrice } from '@/hooks/useBgldPrice';

// ---- Normalize ERC20 ABI (array or artifact) ----
function normalizeAbi(mod: any) {
  const m = (mod && (mod.default ?? mod)) as any;
  if (Array.isArray(m)) return m;
  if (Array.isArray(m?.abi)) return m.abi;
  return m;
}
const ERC20_ABI = normalizeAbi(ERC20_ABI_RAW);

// ---- Minimal inline ABI for staking call only ----
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

// (kept for compatibility with your reads list)
const UNIV3_POOL_ABI = [
  {
    type: 'function',
    name: 'slot0',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' },
    ],
  },
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
  STAKING_ENABLED:
    (process.env.NEXT_PUBLIC_STAKING_ENABLED ??
      process.env.NEXT_PUBLIC_DISABLE_STAKING ??
      '0') === '0', // ON unless explicitly disabled
  ETH_USD_OVERRIDE: (process.env.NEXT_PUBLIC_ETH_USD_OVERRIDE || '').trim(),
};

function clampDays(v: number) {
  if (!Number.isFinite(v)) return 7;
  return Math.max(1, Math.min(30, Math.floor(v)));
}
function fmtNum(n?: number, digits = 2) {
  if (!Number.isFinite(n!)) return '—';
  return n!.toLocaleString(undefined, { maximumFractionDigits: digits });
}
function fmtUsd(n?: number) {
  if (!Number.isFinite(n!)) return '—';
  return n!.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
}

// --- APR curve used across app (matches calculator) ---
function getAPR(days: number): number {
  if (days <= 5) return 10 + (days - 1) * 7.5; // 10–40%
  if (days <= 14) return 100 + (days - 6) * 25; // 100–300%
  const extra = Math.max(0, days - 15); // 15–30 → 400–1200%
  return 400 + extra * 53.3;
}

export default function StakeForm({ className, initialLockDays = 7 }: Props) {
  const { address, chainId } = useAccount();

  const [amount, setAmount] = useState<string>('');
  const [days, setDays] = useState<number>(clampDays(initialLockDays));
  const [status, setStatus] = useState<string>('');

  // Live BGLD/USD via your hook (backed by /api/gold)
  const priceUsd = useBgldPrice();

  // --- Reads: ERC20 (decimals, balance, allowance) + Pool (slot0/token0/token1) ---
  const {
    data: reads,
    refetch: refetchReads,
    isLoading: readsLoading,
  } = useReadContracts({
    allowFailure: true,
    contracts: [
      // ERC20
      { abi: ERC20_ABI as any, address: env.BGLD as `0x${string}`, functionName: 'decimals' },
      address
        ? {
            abi: ERC20_ABI as any,
            address: env.BGLD as `0x${string}`,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          }
        : undefined,
      address
        ? {
            abi: ERC20_ABI as any,
            address: env.BGLD as `0x${string}`,
            functionName: 'allowance',
            args: [address as `0x${string}`, env.STAKING as `0x${string}`],
          }
        : undefined,

      // (kept for compatibility)
      env.POOL
        ? { abi: UNIV3_POOL_ABI as any, address: env.POOL as `0x${string}`, functionName: 'slot0' }
        : undefined,
      env.POOL
        ? { abi: UNIV3_POOL_ABI as any, address: env.POOL as `0x${string}`, functionName: 'token0' }
        : undefined,
      env.POOL
        ? { abi: UNIV3_POOL_ABI as any, address: env.POOL as `0x${string}`, functionName: 'token1' }
        : undefined,
    ].filter(Boolean) as any[],
  });

  const bgldDecimals = (reads?.[0]?.result as number | undefined) ?? 18;
  const walletBgld = (reads?.[1]?.result as bigint | undefined) ?? 0n;
  const allowance = (reads?.[2]?.result as bigint | undefined) ?? 0n;

  const walletBgldNum = Number(formatUnits(walletBgld, bgldDecimals));
  const walletDisplay = Number.isFinite(walletBgldNum)
    ? walletBgldNum.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : '0.00';

  // --- Parse amount -> wei ---
  const parsedAmount: bigint | undefined = useMemo(() => {
    try {
      if (!amount || Number(amount) <= 0) return undefined;
      return parseUnits(amount, bgldDecimals);
    } catch {
      return undefined;
    }
  }, [amount, bgldDecimals]);

  // --- Approve state ---
  const needsApprove = useMemo(() => {
    if (!parsedAmount) return false;
    return allowance < parsedAmount;
  }, [allowance, parsedAmount]);

  // --- Network gate ---
  const wrongNetwork = useMemo(() => {
    return Boolean(chainId && env.CHAIN_ID && chainId !== env.CHAIN_ID);
  }, [chainId]);

  // --- APR + reward previews (UI-only estimate) ---
  const apr = useMemo(() => getAPR(days), [days]);

  const amountNum = useMemo(() => {
    const n = Number(amount || '0');
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const estRewardBgld = useMemo(() => {
    if (!amountNum) return 0;
    return amountNum * (apr / 100) * (days / 365);
  }, [amountNum, apr, days]);

  const estRewardUsd = useMemo(() => {
    if (!priceUsd || !estRewardBgld) return 0;
    return estRewardBgld * priceUsd;
  }, [estRewardBgld, priceUsd]);

  const estPrincipalUsd = useMemo(() => {
    if (!priceUsd || !amountNum) return 0;
    return amountNum * priceUsd;
  }, [amountNum, priceUsd]);

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
      const txHash = await writeContractAsync({
        abi: STAKING_STUB_ABI as any,
        address: env.STAKING as `0x${string}`,
        functionName: 'stake',
        // autoCompound set to false for all new V1 stakes
        args: [parsedAmount, Number(days), false],
        chainId: env.CHAIN_ID,
      });
      setStatus(`Stake submitted: ${txHash.slice(0, 10)}…`);
      setAmount('');
      setTimeout(() => refetchReads(), 1500);
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || 'Stake failed');
    }
  }

  // --- UX: why is Stake disabled? ---
  const canStake =
    !!parsedAmount && !needsApprove && !!address && !wrongNetwork && env.STAKING_ENABLED;

  let stakeHint = '';
  if (!address) {
    stakeHint = 'Connect your wallet to open a vault.';
  } else if (wrongNetwork) {
    stakeHint = 'Switch network to Base (chain ID 8453) in your wallet.';
  } else if (!parsedAmount) {
    stakeHint = 'Enter how much BGLD you want to stake.';
  } else if (needsApprove) {
    stakeHint = 'Step 1: Approve BGLD, then click Stake.';
  } else if (!env.STAKING_ENABLED) {
    stakeHint = 'Staking is temporarily paused while we update parameters.';
  }

  return (
    <div className={className}>
      {/* Status banner */}
      {status && (
        <div className="mb-3 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
          {status}
        </div>
      )}

      {/* V2 migration notice */}
      <div className="mb-3 rounded-xl border border-amber-300/30 bg-black/50 px-3 py-3 text-xs text-amber-100">
        <div className="font-semibold text-amber-300 text-sm mb-0.5">
          Heads up: V2 staking upgrade in progress
        </div>
        <p className="leading-relaxed">
          This page interacts with the current V1 staking contract. A final V2 vault with
          updated mechanics is being prepared, and a liquidity migration date will be
          announced soon. You can continue to open V1 vaults or wait for V2—
          always DYOR and choose what fits your risk.
        </p>
      </div>

      {/* Terminal header row */}
      <div className="mb-3 flex items-center justify-between rounded-2xl border border-amber-300/30 bg-black/40 px-4 py-3">
        <div className="text-white/80 text-sm">
          Live BGLD Price <span className="text-white/50">(via Dexscreener)</span>
        </div>
        <div className="text-amber-200 text-lg font-semibold">
          {priceUsd
            ? `$${priceUsd.toLocaleString(undefined, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 8,
              })}`
            : '—'}
        </div>
      </div>

      {/* Wallet balance line */}
      <div className="mb-2 text-xs text-white/60">
        Wallet:&nbsp;
        <span className="text-amber-200">
          {formatUnits(walletBgld, bgldDecimals)} BGLD
        </span>
        {priceUsd ? (
          <span className="text-white/50">
            {' '}
            ({fmtUsd(walletBgldNum * priceUsd)})
          </span>
        ) : null}
        {readsLoading && (
          <span className="ml-2 text-[10px] text-white/40">syncing…</span>
        )}
      </div>

      {/* Amount */}
      <label className="block text-sm text-white/70 mb-1">Amount to Stake</label>
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-300/40"
          inputMode="decimal"
          placeholder="0.0 BGLD"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white/80 hover:bg-white/5 transition"
          onClick={() => setAmount(formatUnits(walletBgld, bgldDecimals))}
          type="button"
        >
          MAX
        </button>
      </div>
      <div className="mt-1 text-xs text-white/50">
        Est. USD: {priceUsd && amountNum > 0 ? fmtUsd(estPrincipalUsd) : '—'}
      </div>

      {/* Days slider */}
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
          className="w-full accent-amber-300"
        />
        <div className="mt-1 text-xs text-white/60">Wallet: {walletDisplay} BGLD</div>
      </div>

      {/* Preview stats */}
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/40 p-3">
          <div className="text-xs text-white/60">Est. APR (V1)</div>
          <div className="text-amber-200 text-xl font-semibold">
            {fmtNum(apr, 1)}%
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-3">
          <div className="text-xs text-white/60">Projected Reward over term</div>
          <div className="text-amber-200 text-xl font-semibold">
            {fmtNum(estRewardBgld, 2)} BGLD
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-3">
          <div className="text-xs text-white/60">≈ USD Value</div>
          <div className="text-emerald-200 text-xl font-semibold">
            {priceUsd ? fmtUsd(estRewardUsd) : '—'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!parsedAmount || !address || wrongNetwork || !env.BGLD}
          onClick={onApprove}
          className={`rounded-xl px-4 py-2 border bg-black/40 transition ${
            needsApprove
              ? 'border-amber-400 text-amber-200 hover:bg-amber-300/10'
              : 'border-white/15 text-white/60'
          }`}
        >
          {needsApprove ? 'Approve' : 'Approved ✓'}
        </button>

        <button
          type="button"
          disabled={!canStake}
          onClick={onStake}
          className="rounded-xl px-4 py-2 border border-emerald-400 text-emerald-200 bg-black/40 hover:bg-emerald-400/10 disabled:opacity-50 transition"
        >
          Stake (V1)
        </button>
      </div>

      {/* Why is stake disabled / connection tips */}
      {stakeHint && (
        <div className="mt-2 text-[11px] text-white/55">
          {stakeHint}{' '}
          <span className="text-white/35">
            If you&apos;re using the Base app browser and nothing happens,
            try opening this site in Safari/Chrome and connecting there.
          </span>
        </div>
      )}

      {/* Footnote – updated, no compounding language */}
      <div className="mt-4 text-[11px] text-white/45 italic">
        Base Gold is evolving. V2 staking details and liquidity migration timing will
        be shared publicly before any changes go live.
      </div>
    </div>
  );
}
