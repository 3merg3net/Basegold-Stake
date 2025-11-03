'use client';

import PositionsPanel from '@/components/PositionsPanel';

// Minimal guard so we don’t render broken UI if env is off
const ENV = {
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim(),
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim(),
  CHAIN_ID: (process.env.NEXT_PUBLIC_CHAIN_ID || '').trim(),
};

export default function PositionsClient() {
  const ok =
    ENV.STAKING.startsWith('0x') &&
    ENV.BGLD.startsWith('0x') &&
    (ENV.CHAIN_ID === '' || ENV.CHAIN_ID === '8453');

  if (!ok) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
        Positions temporarily unavailable. Please try again shortly.
      </div>
    );
  }
  return <PositionsPanel />;
}
