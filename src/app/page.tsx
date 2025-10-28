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
          Lock BGLD to earn high-yield rewards. Compound to grow your principal and boost future returns.
          Early exits are penalized and a small protocol fee on withdraw/compound strengthens the vault.
        </motion.p>

        {/* Primary CTA */}
        <div className="mt-8">
          <Link
            href="/stake"
            className="px-8 py-4 bg-amber-300 text-black font-semibold rounded-2xl hover:bg-[#f1d371] transition"
          >
            Open the Vaults
          </Link>
        </div>
      </section>

      {/* Live Vault Metrics */}
      <section className="px-6 pb-12 max-w-6xl mx-auto w-full">
        <MetricsStrip className="shadow-lg" />
      </section>

      {/* How It Works */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-black/50 p-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-amber-300">How Staking Works</h2>
          <ol className="list-decimal pl-5 space-y-3 text-white/80 leading-relaxed">
            <li>
              Choose a lock term from <strong>1–30 days</strong>. Longer locks earn higher APR within the posted range.
            </li>
            <li>
              At maturity you can <strong>Withdraw</strong> your principal + vested rewards, or <strong>Compound</strong> to roll rewards into principal and restart the chosen term.
            </li>
            <li>
              <strong>Daily Manual Compounding</strong> is allowed once every 24h (if you prefer frequent growth).{' '}
              <em>Auto-compound</em> can also be toggled per vault (protocol executes on its cadence).
            </li>
            <li>
              Exiting early triggers an <strong>Early Exit Penalty</strong> on principal (decays linearly to 0% by maturity) and forfeits unvested rewards. This discourages short-term churn and protects vault health.
            </li>
            <li>
              Protocol fees: a small fee on withdraw and on compound is routed back to strengthen the BGLD vault.
            </li>
          </ol>

          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-200">
            <p className="font-semibold mb-1">Clarity First</p>
            <p>
              Rewards vest continuously over your chosen term. Compounding restarts the term. Early exits return your principal
              minus the current penalty and pay out only the vested portion of rewards at that moment.
            </p>
          </div>
        </div>
      </section>

      {/* Risk Disclosure */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-black/50 p-6 md:p-8">
          <h3 className="text-xl font-semibold text-white mb-3">Risk & Responsibility</h3>
          <p className="text-white/70 leading-relaxed">
            Staking involves smart-contract risk and market risk. APRs are not guaranteed and can change via protocol governance/
            parameters within posted bounds. Only stake what you can afford to lock. Read the{' '}
            <Link href="/terms" className="underline text-amber-300">Terms</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
