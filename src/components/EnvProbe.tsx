'use client';

import { useEffect } from 'react';

export default function EnvProbe() {
  useEffect(() => {
    const env = {
      BGLD: process.env.NEXT_PUBLIC_BGLD_ADDRESS,
      STAKING: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
      POOL: process.env.NEXT_PUBLIC_UNIV3_POOL,
      WETH: process.env.NEXT_PUBLIC_WETH_ADDRESS,
      CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
      STAKING_ENABLED: process.env.NEXT_PUBLIC_STAKING_ENABLED,
      DISABLE_STAKING: process.env.NEXT_PUBLIC_DISABLE_STAKING,
    };
    console.log('[EnvProbe]', env);
    (window as any).__bgld_env = env; // lets you inspect in DevTools
  }, []);

  return null; // no UI
}
