'use client';

import MetricsStrip from '@/components/MetricsStrip';

export default function StatusPage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-semibold mb-6">
        Protocol Status
      </h1>

      {/* Live vault metrics */}
      <MetricsStrip className="shadow-sm mb-6" />

      {/* Notes / Transparency */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-3">
        <p className="text-white/80">
          Base Gold vault metrics update live from chain. TVL reflects BGLD held by the staking contract, APR range
          is the current protocol configuration, and total positions is the on-chain count of open vaults (IDs).
        </p>
        <p className="text-white/60 text-sm">
          Staking involves smart-contract and market risk. APRs are variable within configured bounds. Read the{' '}
          <a className="underline text-amber-300" href="/terms">Terms</a>.
        </p>
      </section>
    </main>
  );
}
