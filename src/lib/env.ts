// src/lib/env.ts
export const ENV = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim(),
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim(),
  POOL: (process.env.NEXT_PUBLIC_UNIV3_POOL || '').trim(),
  WETH: (process.env.NEXT_PUBLIC_WETH_ADDRESS || '').trim(),
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'),
  STAKING_ENABLED: (process.env.NEXT_PUBLIC_STAKING_ENABLED || '0').trim() === '1',
  DEBUG_METRICS: (process.env.NEXT_PUBLIC_DEBUG_METRICS || '0').trim() === '1',
};

// simple runtime guards
export const isHexAddr = (s?: string) => /^0x[a-fA-F0-9]{40}$/.test(String(s || ''));
