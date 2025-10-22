'use client';

import StakeForm from '@/components/StakeForm';

export default function StakeClient({ initialLockDays = 14 }: { initialLockDays?: number }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-darkbg to-black text-white">
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-6 text-center">
        <h1 className="text-4xl font-bold text-gold mb-2">Stake Your BGLD</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Choose your lock duration, approve the token, and stake into the vault. Rewards accrue in ETH and can be
          compounded into BGLD automatically or manually from the home page.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <StakeForm initialLockDays={initialLockDays} />
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 border-t border-gold/20 text-center">
        <h2 className="text-2xl font-semibold text-gold mb-3">How staking works</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
          When you stake, your BGLD is deposited into the vault for the selected lock period.
          ETH rewards are earned and routed back into BGLD on compounding cycles, increasing your vault share over time.
          View positions, compounding activity, and receipts on Basescan for full transparency.
        </p>
      </section>
    </main>
  );
}
