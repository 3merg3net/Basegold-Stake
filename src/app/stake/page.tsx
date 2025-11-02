'use client';

import { useEffect, useState } from 'react';
import MetricsStrip from '@/components/MetricsStrip';
import StakeForm from '@/components/StakeForm';
import PositionsPanel from '@/components/PositionsPanel';


export default function StakePage() {
  const [fatal, setFatal] = useState<string | null>(null);

  useEffect(() => {
    const onErr = (ev: ErrorEvent) => {
      setFatal(ev?.error?.message || ev?.message || 'Unhandled error');
    };
    const onRej = (ev: PromiseRejectionEvent) => {
      const r: any = ev?.reason;
      const msg =
        r?.metaMessages?.join('\n') ||
        r?.cause?.data?.message ||
        r?.cause?.shortMessage ||
        r?.cause?.message ||
        r?.shortMessage ||
        r?.message ||
        String(r);
      setFatal(msg);
    };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Compact TVL / Pricing card for the stake page */}
      <section className="rounded-2xl border border-amber-300/20 bg-black/60 backdrop-blur-md p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-amber-300">Vault TVL & Pricing</h2>
          <div
            aria-hidden="true"
            className="pointer-events-none h-4 w-24 rounded-full opacity-25 blur"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,.45), transparent)' }}
          />
        </div>

        {/* Your existing global metrics component */}
        <MetricsStrip className="!p-0 !bg-transparent !border-0" />

        <p className="mt-3 text-xs leading-relaxed text-white/60">
          TVL updates live from the staking vault. USD and ETH figures are estimated from on-chain pricing (or your
          configured overrides). Compounding rolls rewards into principal and restarts your chosen term; early exits
          incur a decaying fee and forfeit unvested rewards.
        </p>
      </section>

      {fatal && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm whitespace-pre-wrap">
          {fatal}
        </div>
      )}

      {/* Staking UI */}
      
      <StakeForm initialLockDays={14} />
      <PositionsPanel />
    </div>
  );
}
