'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import MetricsStrip from '@/components/MetricsStrip';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-t from-black via-[#0a0a0a] to-black text-white">
      {/* Hero */}
      <section className="text-center py-20 md:py-24 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight"
        >
          Stake Your Claim in <span className="text-amber-300">Base Gold</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mt-4"
        >
          The first onchain <span className="text-amber-300 font-semibold">Gold Staking Vault</span> on Base.
          Lock BGLD, earn high-yield rewards, and compound to grow your principal. A small protocol fee on
          withdraw/compound strengthens the vault over time.
        </motion.p>

        {/* Primary CTA */}
        <div className="mt-8">
          <Link
            href="/stake"
            className="px-8 py-4 bg-amber-300 text-black font-semibold rounded-2xl hover:bg-[#f1d371] transition"
          >
            Start Staking — Live Now
          </Link>
        </div>

        {/* Hype subtext */}
        <p className="mt-4 text-sm text-white/60">
          Built on <span className="text-[#0AA0FF] font-semibold">Base</span> · Powered by ETH · Staked in Gold
        </p>
      </section>

      {/* Live Vault Metrics */}
      <section className="px-6 pb-10 max-w-6xl mx-auto w-full">
        <MetricsStrip className="shadow-lg" />
      </section>

      {/* Compounding & Mechanics */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-black/50 p-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-amber-300">How Staking Works</h2>

          <ol className="list-decimal pl-5 space-y-3 text-white/80 leading-relaxed">
            <li>
              Choose a lock term from <strong>1–30 days</strong>. Longer locks earn higher APR within posted bounds.
            </li>
            <li>
              At maturity you can <strong>Withdraw</strong> your principal + vested rewards, or <strong>Compound</strong> to
              roll rewards into principal and restart your chosen term.
            </li>
            <li>
              <strong>Manual Compound</strong> is allowed once every 24h.{' '}
              <em>Each compound restarts the term.</em>
            </li>
            <li>
              <strong>Auto-Compound</strong> can be toggled per vault. While enabled, the protocol compounds on its cadence and{' '}
              <em>each auto-compound restarts the term</em>. You can turn it off anytime in{' '}
              <Link href="/positions" className="underline text-amber-300">Vaults</Link>.
            </li>
            <li>
              Exiting early triggers a decaying <strong>Early Exit Penalty</strong> on principal and forfeits unvested rewards.
              This protects long-term stakers and vault health.
            </li>
            <li>
              Protocol fees on withdraw/compound flow back to reinforce the BGLD vault over time.
            </li>
          </ol>

          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-200">
            <p className="font-semibold mb-1">Clarity First</p>
            <p>
              Rewards vest continuously over your selected term. Compounding adds vested rewards to principal and
              <em> restarts</em> the lock. At maturity you decide: withdraw, or compound to keep growing.
            </p>
          </div>
        </div>
      </section>

      {/* Why Base Gold (bullish) */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Onchain Gold Vault"
            desc="Simple terms, transparent math. TVL and performance visible onchain—anytime."
          />
          <FeatureCard
            title="Compounding Engine"
            desc="Manual or auto. Compounding rolls rewards into principal to accelerate growth."
          />
          <FeatureCard
            title="Built on Base"
            desc="Low fees, fast finality, and a thriving ecosystem—perfect for everyday staking."
          />
        </div>

        {/* Risk disclosure */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/50 p-6 md:p-8">
          <h3 className="text-xl font-semibold text-white mb-3">Risk & Responsibility</h3>
          <p className="text-white/70 leading-relaxed">
            Staking involves smart-contract and market risk. APRs can change via governance/parameters within posted
            bounds and are not guaranteed. Only stake what you can afford to lock. Read the{' '}
            <Link href="/terms" className="underline text-amber-300">Terms</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-6">
      <div className="text-lg font-semibold text-amber-300">{title}</div>
      <p className="mt-2 text-white/80">{desc}</p>
    </div>
  );
}
