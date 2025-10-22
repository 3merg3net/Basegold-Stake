// src/app/page.tsx

import ClaimDashboard from '@/components/ClaimDashboard';

export const metadata = {
  title: 'Base Gold — Stake Your Claim',
  description: 'Stake BGLD, earn ETH rewards, auto-compound into deeper liquidity.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-darkbg to-black text-white">
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Stake Your Claim on <span className="text-gold">Base Gold</span>
        </h1>
        <p className="mt-3 text-white/80 max-w-2xl mx-auto">
          Pick a lock (1–30 days). Earn ETH rewards. Compound to grow your share — simply.
        </p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-gold/25 bg-black/30 px-4 py-2">
          <div className="text-xs uppercase tracking-wider text-white/60">Current Max APR</div>
          <div className="text-xl font-semibold text-gold">Up to 1200%</div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <ClaimDashboard />
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 text-center">
        <p className="text-sm text-white/70">
          Rewards vest linearly. Early exits forfeit unvested rewards and may apply a principal penalty.
          Read the <a className="underline text-gold" href="/how-it-works">How it works</a> and{' '}
          <a className="underline text-gold" href="/terms">Terms</a>.
        </p>
      </section>
    </main>
  );
}
