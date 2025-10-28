'use client';

import { useEffect, useState } from 'react';
import StakeForm from '@/components/StakeForm';
import PositionsPanel from '@/components/PositionsPanel';

/**
 * Stake page – no network warning pill.
 * Left: clear mechanics copy
 * Right: StakeForm + Positions
 */
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
      {fatal && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm whitespace-pre-wrap">
          {fatal}
        </div>
      )}

      {/* Top intro panel (no network pill) */}
      <section className="rounded-2xl border border-gold/25 bg-black/50 backdrop-blur-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Stake <span className="text-gold">BGLD</span> · Earn ETH
        </h1>
        <p className="text-sm md:text-base text-white/70 mt-2">
          Lock your BGLD for 1–30 days. Rewards vest linearly. Compound to grow principal and boost future
          rewards. Emergency exit is available with a decaying principal fee.
        </p>
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: mechanics explainer (pure copy; no pills) */}
        <section className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
          <h2 className="text-xl font-semibold text-gold mb-3">How Staking Works</h2>
          <ul className="list-disc ml-5 space-y-2 text-white/80 text-sm leading-relaxed">
            <li>
              <span className="font-semibold">Terms:</span> Choose a lock between <span className="font-semibold">1–30 days</span>. APR scales with duration.
            </li>
            <li>
              <span className="font-semibold">Rewards:</span> Vest linearly over the chosen term. You can view
              <span className="font-semibold"> vested</span> vs <span className="font-semibold">unvested</span> in your vault.
            </li>
            <li>
              <span className="font-semibold">Compounding:</span> Compound matured rewards into principal (term resets). Daily compounding rules apply per contract.
            </li>
            <li>
              <span className="font-semibold">Emergency Exit:</span> Available any time with a principal fee that decays from max to 0% at maturity; vested rewards are paid, unvested are forfeited.
            </li>
            <li>
              <span className="font-semibold">Withdraw:</span> At maturity, withdraw principal + all rewards (minus any configured withdrawal fee).
            </li>
          </ul>

          <div className="mt-4 text-xs text-white/50">
            Always verify the connected network and contract addresses in your wallet before confirming.
          </div>
        </section>

        {/* Right: stake form */}
        <section>
          <StakeForm initialLockDays={14} />
        </section>
      </div>

      {/* Positions / Vaults */}
      <section>
        <PositionsPanel />
      </section>
    </div>
  );
}
