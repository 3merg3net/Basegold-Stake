// src/lib/env.ts
export const env = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim(),
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim(),
  POOL: (process.env.NEXT_PUBLIC_UNIV3_POOL || '').trim(),
  WETH: (process.env.NEXT_PUBLIC_WETH_ADDRESS || '').trim(),
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453),
  STAKING_ENABLED: (process.env.NEXT_PUBLIC_STAKING_ENABLED || '1').trim() === '1',
};

export const onBase = (id?: number) => !!id && id === env.CHAIN_ID;
