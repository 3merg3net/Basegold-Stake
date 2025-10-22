// src/app/status/page.tsx

import { formatUSD } from '@/lib/constants';

export const metadata = {
  title: 'Vault Health — Base Gold',
  description: 'Simple, non-technical view of TVL, buffer, and reward cadence.',
};

// NOTE: For now these are placeholders; wire to on-chain reads later.
function useDemoData() {
  // Pretend values; replace with wagmi reads for: TVL, buffer %, last/next compound, 24h rewards
  return {
    tvlUsd: 238_450,
    bufferPct: 5.6,          // ETH buffer as % of TVL (target ~5–10%)
    lastCompoundMins: 92,
    nextCompoundMins: 268,
    rewards24hUsd: 4280,
  };
}

export default function StatusPage() {
  const d = useDemoData();

  const Stat = ({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) => (
    <div className="rounded-2xl border border-gold/20 bg-black/40 p-5 text-center">
      <div className="text-xs uppercase tracking-widest text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-white/60">{sub}</div>}
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-darkbg to-black text-white">
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Vault Health</h1>
        <p className="mt-2 text-white/70">
          A simple view of the vault’s condition. No LP details—just what matters.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat label="Total Value Locked" value={<span className="text-gold">{formatUSD(d.tvlUsd)}</span>} />
        <Stat label="ETH Buffer" value={<span className="text-gold">{d.bufferPct.toFixed(1)}%</span>} sub="Target: 5–10%" />
        <Stat label="24h Rewards (est.)" value={<span className="text-gold">{formatUSD(d.rewards24hUsd)}</span>} />
        <Stat label="Compound cadence" value={<span className="text-gold">~4–6h</span>} sub={`next in ${Math.round(d.nextCompoundMins/60)}h`} />
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-xl font-semibold text-gold">How to read this</h2>
          <ul className="mt-3 space-y-2 text-white/80 text-sm">
            <li><span className="text-gold/90 font-medium">TVL</span> — total assets held by the vault.</li>
            <li><span className="text-gold/90 font-medium">ETH Buffer</span> — helps pair new stakes smoothly; higher is healthier.</li>
            <li><span className="text-gold/90 font-medium">Rewards</span> — recent ETH earnings routed by the compounding policy.</li>
            <li><span className="text-gold/90 font-medium">Cadence</span> — how often compounding typically runs.</li>
          </ul>
          <p className="mt-3 text-xs text-white/60">
            Detailed LP internals are managed behind the scenes so staking stays simple.
          </p>
        </div>
      </section>
    </main>
  );
}
