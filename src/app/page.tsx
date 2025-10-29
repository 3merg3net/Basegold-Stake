'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import MetricsStrip from '@/components/MetricsStrip';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-t from-black via-[#0a0a0a] to-black text-white">
      {/* Hero */}
      <section className="text-center py-20 md:py-24 px-6 relative overflow-hidden">
        {/* Soft Gold Halo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 500px at 50% 30%, rgba(212,175,55,0.08), transparent 80%)',
          }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight"
        >
          The First On-Chain <span className="text-amber-300">Gold Vault</span> on Base
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mt-4 leading-relaxed"
        >
          Welcome to the next era of digital gold.{" "}
          <span className="text-amber-300 font-semibold">Base Gold (BGLD)</span> is building the first
          fully on-chain staking vault designed to preserve value, compound yield, and grow the Base ecosystem’s
          strongest asset — trust in scarcity.
        </motion.p>

        {/* Vault Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-amber-200 text-xs font-semibold tracking-wide"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-amber-300 animate-pulse"></span>
          Vault Seeding in Progress · Public Staking Soon
        </motion.div>

        {/* CTA */}
        <div className="mt-8">
          <Link
            href="/stake"
            className="px-8 py-4 bg-amber-300 text-black font-semibold rounded-2xl hover:bg-[#f1d371] transition"
          >
            Prepare to Stake
          </Link>
        </div>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-6 text-white/60 text-sm uppercase tracking-widest"
        >
          Built on Base · Powered by ETH · Backed by Gold Logic
        </motion.p>
      </section>

      {/* Live Vault Metrics */}
      <section className="px-6 pb-12 max-w-6xl mx-auto w-full">
        <MetricsStrip className="shadow-lg" />
      </section>

      {/* The Narrative */}
      <section className="px-6 pb-20 max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-semibold text-amber-300 mb-4"
        >
          A New Gold Standard for DeFi
        </motion.h2>
        <p className="text-white/70 leading-relaxed text-lg max-w-3xl mx-auto">
          The <span className="text-amber-300 font-semibold">Base Gold Vault</span> transforms passive holding
          into a yield-compounding engine. Each stake feeds the vault, each compound strengthens it.
          Every exit contributes a fraction back to the system — creating a closed-loop of sustainable value.
        </p>
        <p className="mt-4 text-white/60 max-w-2xl mx-auto text-base">
          This isn’t just another staking pool. It’s a decentralized, self-reinforcing Gold reserve built on Base,
          for Base. When you stake, you don’t just earn — you help define the foundation of Base’s Golden Claim.
        </p>
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
              At maturity, <strong>Withdraw</strong> your principal + rewards or <strong>Compound</strong> to restart
              your stake with boosted balance.
            </li>
            <li>
              <strong>Daily Manual Compounding</strong> available once every 24h for active stakers.{' '}
              <em>Auto-Compound</em> can also be toggled on each vault to automatically reinvest every 48h.
            </li>
            <li>
              Exiting early applies a <strong>decaying penalty</strong> to principal and forfeits unvested rewards —
              protecting long-term participants and reinforcing the vault’s sustainability.
            </li>
            <li>
              Every compound and withdrawal contributes a small fee directly back to the <strong>Vault TVL</strong>,
              compounding community growth.
            </li>
          </ol>

          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-200">
            <p className="font-semibold mb-1">Gold Logic · Clear Math</p>
            <p>
              Rewards vest continuously over the term. Compounding resets the timer and increases your Gold stake. 
              Vault health scales with time, not hype — and that’s what gives Base Gold its strength.
            </p>
          </div>
        </div>
      </section>

      {/* Bullish Launch Block */}
      <section className="px-6 pb-20 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl w-full bg-black/70 backdrop-blur-md border border-amber-300/40 rounded-2xl p-6 md:p-8 text-center shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-amber-300 mb-2">🔥 The Gold Era Has Begun</h2>
          <p className="text-white/80 leading-relaxed">
            <span className="text-amber-300 font-semibold">Base Gold</span> is the first true on-chain Gold Vault — 
            a DeFi primitive designed to last decades, not seasons. Once live, staking and compounding will shape 
            the vault’s yield dynamics forever.
          </p>
          <p className="mt-3 text-white/70">
            Early stakers earn the highest APYs ever posted by Base Gold.
            Vault seeding is live — public staking opens soon.
          </p>

          <div className="mt-6 animate-pulseGold text-amber-300 font-semibold text-sm uppercase tracking-wide">
            #StakeYourGold · #BaseGold · #VaultSeedingLive
          </div>

          <div className="mt-8">
            <Link
              href="/stake"
              className="inline-block px-6 py-3 bg-amber-300 text-black rounded-xl font-semibold hover:bg-[#f1d371] transition"
            >
              Enter the Vault
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Risk Disclosure */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-black/50 p-6 md:p-8">
          <h3 className="text-xl font-semibold text-white mb-3">Risk & Responsibility</h3>
          <p className="text-white/70 leading-relaxed">
            Staking involves smart-contract and market risk. APRs are not guaranteed and can adjust within posted
            bounds. Only stake what you can afford to lock. Read the{' '}
            <Link href="/terms" className="underline text-amber-300">
              Terms
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
