// src/components/WalletChip.tsx
'use client';

import { useMemo } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import ERC20_ABI_RAW from '@/lib/abis/ERC20';

function normalizeAbi(mod: any) {
  const m = (mod && (mod.default ?? mod)) as any;
  if (Array.isArray(m)) return m;
  if (Array.isArray(m?.abi)) return m.abi;
  return m;
}
const ERC20_ABI = normalizeAbi(ERC20_ABI_RAW);

const env = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim().toLowerCase(),
  PAIR_URL:
    'https://dexscreener.com/base/0xc4e41df25e2ce0d134333d0109116a982863d5bf', // your pair link
};

export default function WalletChip({ className }: { className?: string }) {
  const { address } = useAccount();
  const enabled = Boolean(address && env.BGLD);

  const { data: reads } = useReadContracts({
    allowFailure: true,
    contracts: enabled
      ? [
          {
            abi: ERC20_ABI as any,
            address: env.BGLD as `0x${string}`,
            functionName: 'decimals',
          },
          {
            abi: ERC20_ABI as any,
            address: env.BGLD as `0x${string}`,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          },
        ]
      : [],
    // gentle refresh; cheap and keeps it fresh enough
    query: { enabled, refetchInterval: 30_000 },
  });

  const decimals = (reads?.[0]?.result as number | undefined) ?? 18;
  const rawBal = (reads?.[1]?.result as bigint | undefined) ?? 0n;

  const balanceDisplay = useMemo(() => {
    const num = Number(formatUnits(rawBal, decimals));
    if (!Number.isFinite(num)) return '0.00';
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }, [rawBal, decimals]);

  if (!address) {
    return (
      <div
        className={`rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/70 ${className || ''}`}
        title="Connect wallet"
      >
        Wallet: —
      </div>
    );
  }

  return (
    <button
      onClick={() => window.open(env.PAIR_URL, '_blank')}
      className={`group rounded-full border border-amber-400/40 bg-black/50 px-3 py-1.5 text-xs text-amber-200 hover:border-amber-400 hover:bg-black/60 transition ${className || ''}`}
      title="View on Dexscreener"
    >
      <span className="text-white/70 mr-1.5">BGLD</span>
      <span className="font-semibold tabular-nums">{balanceDisplay}</span>
    </button>
  );
}
