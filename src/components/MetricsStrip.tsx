'use client';

import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import ERC20_ABI from '@/lib/abis/ERC20';
import UNIV3_POOL_ABI from '@/lib/abis/UniswapV3Pool'; // minimal: slot0(), token0(), token1()

type Props = { className?: string };

const env = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim().toLowerCase(),
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase(),
  POOL: (process.env.NEXT_PUBLIC_UNIV3_POOL || '').trim().toLowerCase(),
  WETH: (process.env.NEXT_PUBLIC_WETH_ADDRESS || '').trim().toLowerCase(),
  ETH_USD_OVERRIDE: (process.env.NEXT_PUBLIC_ETH_USD_OVERRIDE || '').trim(),
  DEBUG: (process.env.NEXT_PUBLIC_DEBUG_METRICS || '0').trim() === '1',
};

// ----- helpers -----
function fmt(n?: number, digits = 2) {
  if (!Number.isFinite(n!)) return '—';
  if (Math.abs(n!) >= 1) return n!.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n!).toPrecision(6);
}
function fmtTokenAmt(v?: bigint, decimals = 18, digits = 2) {
  if (v == null) return '0';
  try {
    const s = formatUnits(v, decimals);
    const n = Number(s);
    return fmt(n, digits);
  } catch { return '0'; }
}
function short(addr: string, n = 4) {
  if (!addr) return '—';
  return `${addr.slice(0, 2 + n)}…${addr.slice(-n)}`;
}
// BigInt-safe stringify for debug
function s(obj: unknown) {
  return JSON.stringify(obj, (_k, v) => (typeof v === 'bigint' ? `${v.toString()}n` : v), 2);
}

export default function MetricsStrip({ className }: Props) {
  const enabled = Boolean(env.POOL);

  // 1) Pool reads
  const { data: poolBatch } = useReadContracts({
    allowFailure: true,
    contracts: enabled ? [
      { abi: UNIV3_POOL_ABI as any, address: env.POOL as `0x${string}`, functionName: 'slot0' },
      { abi: UNIV3_POOL_ABI as any, address: env.POOL as `0x${string}`, functionName: 'token0' },
      { abi: UNIV3_POOL_ABI as any, address: env.POOL as `0x${string}`, functionName: 'token1' },
    ] : [],
    query: { enabled },
  });

  const slot0 = poolBatch?.[0]?.result as any | undefined; // [sqrtPriceX96, tick, …]
  const poolToken0 = (poolBatch?.[1]?.result as `0x${string}` | undefined)?.toLowerCase();
  const poolToken1 = (poolBatch?.[2]?.result as `0x${string}` | undefined)?.toLowerCase();

  // 2) Infer BGLD/WETH orientation against the pool tokens
  const inferred = useMemo(() => {
    let bgld = env.BGLD;
    let weth = env.WETH;
    const havePool = Boolean(poolToken0 && poolToken1);

    if (havePool && weth) {
      const isWeth0 = poolToken0 === weth;
      const isWeth1 = poolToken1 === weth;

      if (!env.BGLD && (isWeth0 || isWeth1)) {
        // infer bgld as the non-WETH
        bgld = isWeth0 ? poolToken1! : poolToken0!;
      } else if (env.BGLD && (isWeth0 || isWeth1)) {
        // ensure bgld is the opposite side of WETH
        if (poolToken0 === weth) bgld = poolToken1!;
        else if (poolToken1 === weth) bgld = poolToken0!;
      }
    }
    return { bgld, weth, havePool };
  }, [poolToken0, poolToken1]);

  // 3) Token reads (bgld decimals/supply + vault balance)
  const { data: tokenReads } = useReadContracts({
    allowFailure: true,
    contracts: inferred.havePool && inferred.bgld && env.STAKING ? [
      { abi: ERC20_ABI as any, address: inferred.bgld as `0x${string}`, functionName: 'decimals' },
      { abi: ERC20_ABI as any, address: inferred.bgld as `0x${string}`, functionName: 'totalSupply' },
      { abi: ERC20_ABI as any, address: inferred.bgld as `0x${string}`, functionName: 'balanceOf', args: [env.STAKING as `0x${string}`] },
    ] : [],
  });

  const bgldDecimals = (tokenReads?.[0]?.result as number | undefined) ?? 18;
  const totalSupply = tokenReads?.[1]?.result as bigint | undefined;
  const vaultBgld   = tokenReads?.[2]?.result as bigint | undefined;

  // 4) Price math via Q96 (token1 per token0)
  const sqrtPriceX96 = slot0?.[0] as bigint | undefined;

  const { bgldPerEth, ethPerBgld } = useMemo(() => {
    if (!sqrtPriceX96 || !poolToken0 || !poolToken1 || !inferred.weth || !inferred.bgld) {
      return { bgldPerEth: undefined as number | undefined, ethPerBgld: undefined as number | undefined };
    }
    const sqrtNum = Number(sqrtPriceX96); // UI precision only (loss acceptable)
    const q96 = 2 ** 96;
    const price = (sqrtNum / q96) * (sqrtNum / q96); // token1 per token0

    let _bgldPerEth: number | undefined;
    let _ethPerBgld: number | undefined;

    if (poolToken0 === inferred.weth && poolToken1 === inferred.bgld) {
      // price = BGLD per 1 WETH
      _bgldPerEth = price;
      _ethPerBgld = price > 0 ? 1 / price : undefined;
    } else if (poolToken0 === inferred.bgld && poolToken1 === inferred.weth) {
      // price = WETH per 1 BGLD
      _ethPerBgld = price;
      _bgldPerEth = price > 0 ? 1 / price : undefined;
    }
    return { bgldPerEth: _bgldPerEth, ethPerBgld: _ethPerBgld };
  }, [sqrtPriceX96, poolToken0, poolToken1, inferred]);

  // 5) USD conversions (override or sane default for prod UI)
  const ethUsd = useMemo(() => {
    const x = parseFloat(env.ETH_USD_OVERRIDE);
    if (Number.isFinite(x) && x > 0) return x;
    return 3400; // fallback so UI is never blank
  }, []);
  const bgldUsd = useMemo(() => {
    if (!ethPerBgld || !ethUsd) return undefined;
    return ethPerBgld * ethUsd;
  }, [ethPerBgld, ethUsd]);

  // 6) TVL & FDV
  const tvlUsd = useMemo(() => {
    if (vaultBgld == null || bgldUsd == null) return undefined;
    try {
      const v = Number(formatUnits(vaultBgld, bgldDecimals));
      return v * bgldUsd;
    } catch { return undefined; }
  }, [vaultBgld, bgldUsd, bgldDecimals]);

  const fdvUsd = useMemo(() => {
    if (totalSupply == null || bgldUsd == null) return undefined;
    try {
      const v = Number(formatUnits(totalSupply, bgldDecimals));
      return v * bgldUsd;
    } catch { return undefined; }
  }, [totalSupply, bgldUsd, bgldDecimals]);

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Box label="BGLD in Vault" value={`${fmtTokenAmt(vaultBgld, bgldDecimals, 2)} BGLD`} />
        <Box label="BGLD / ETH" value={bgldPerEth ? fmt(1 / (ethPerBgld ?? 0), 8) : (bgldPerEth ? fmt(bgldPerEth, 2) : '—')} />
        <Box label="BGLD / USD" value={bgldUsd ? `$${fmt(bgldUsd, 8)}` : '—'} />
        <Box label="Vault TVL (USD)" value={tvlUsd ? `$${fmt(tvlUsd, 2)}` : '—'} />
        <Box label="FDV (USD)" value={fdvUsd ? `$${fmt(fdvUsd, 0)}` : '—'} />
        <Box label="Pool Tokens" value={
          poolToken0 && poolToken1
            ? `${short(poolToken0)} / ${short(poolToken1)}`
            : '—'
        } />
      </div>

      {env.DEBUG && (
        <pre className="mt-3 whitespace-pre-wrap text-xs text-white/70 bg-black/40 border border-white/10 rounded-lg p-3">
{`[MetricsStrip debug]
ENV ${s(env)}
slot0: ${s(slot0)}
sqrtPriceX96: ${String(sqrtPriceX96 || 0n)}
token0/token1: ${poolToken0 || '—'} ${poolToken1 || '—'}
inferred BGLD: ${inferred.bgld || '—'} · WETH: ${inferred.weth || '—'}
ethPerBgld: ${ethPerBgld ?? '—'} · bgldPerEth: ${bgldPerEth ?? '—'}
bgldUsd(est): ${bgldUsd ?? '—'}
vaultBgld: ${vaultBgld ?? '—'} totalSupply: ${totalSupply ?? '—'}
`}
        </pre>
      )}
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/50 p-3">
      <div className="text-[11px] uppercase tracking-wider text-white/60 truncate">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-amber-200 tabular-nums truncate">{value}</div>
    </div>
  );
}
