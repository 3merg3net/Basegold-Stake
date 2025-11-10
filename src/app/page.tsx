'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import MetricsStrip from '@/components/MetricsStrip';
import GoldCalculator from '@/components/GoldCalculator';
import VaultStats from '@/components/VaultStats';

// Env-driven config
const BGLD_CA =
  process.env.NEXT_PUBLIC_BGLD_CA || '0xYourBGLDContractAddressHere';
const DEX_URL =
  process.env.NEXT_PUBLIC_DEXSCREENER_URL ||
  'https://dexscreener.com/base/0xYourPairAddressHere';

/* ---------------- Helpers ---------------- */

function ContractPill({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // no-op
    }
  };

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/50 px-4 py-2">
        <span className="text-white/70 text-sm">Contract</span>
        <code className="text-amber-200 text-sm">{address}</code>
        <button
          onClick={copy}
          className="ml-2 inline-flex items-center gap-2 rounded-xl border border-amber-300/40 px-3 py-1 text-amber-200 hover:bg-amber-300/10 transition"
          aria-label="Copy contract address"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
            <path
              fill="currentColor"
              d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"
            />
          </svg>
          <span className="text-sm">{copied ? 'Copied ✓' : 'Copy'}</span>
        </button>
      </div>

      {/* gold tooltip */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: copied ? 1 : 0, y: copied ? 0 : -6 }}
        transition={{ duration: 0.18 }}
        className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg border border-amber-300/40 bg-black/80 px-3 py-1 text-xs text-amber-200 shadow-lg pointer-events-none"
        aria-live="polite"
      >
        Contract copied: {short}
      </motion.div>
    </div>
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

/* ---------------- Page ---------------- */

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
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {/* Stake */}
            <Link
              href="/stake"
              className="px-8 py-4 bg-amber-300 text-black font-semibold rounded-2xl hover:bg-[#f1d371] transition"
            >
              Start Staking — Live Now
            </Link>

            {/* Buy on Dexscreener */}
            <a
              href={DEX_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-amber-300 text-amber-300 rounded-2xl hover:bg-amber-300/10 transition"
            >
              Buy BGLD on Dexscreener
            </a>
          </div>

          {/* Contract pill with copy */}
          <ContractPill address={BGLD_CA} />

          {/* Hype subtext */}
          <p className="mt-4 text-sm text-white/60">
            Built on <span className="text-[#0AA0FF] font-semibold">Base</span> · Powered by ETH · Staked in Gold
          </p>
        </div>
      </section>

      {/* Live Vault Metrics */}
      <section className="px-6 pb-10 max-w-6xl mx-auto w-full">
        <MetricsStrip/>
        <VaultStats/>
      </section>

      {/* ===== Live Calculator Widget ===== */}
<section className="mt-12 max-w-3xl mx-auto">
  <div className="rounded-2xl border border-amber-300/30 bg-black/50 px-5 py-5 backdrop-blur shadow-[0_0_24px_rgba(212,175,55,0.08)]">
    <h2 className="text-lg font-semibold text-amber-300 mb-2 text-center">
      Gold Vault Reward Simulator
    </h2>
    <p className="text-white/70 text-center mb-4 text-sm">
      Estimate your potential Base Gold rewards in real time using live Dexscreener pricing.
    </p>
    <div className="max-w-md mx-auto">
      <GoldCalculator
  mode="compact"
  demoPresets={[1_000_000, 5_000_000, 10_000_000, 20_000_000]}
  autoCycleMs={6000}
/>

    </div>
    <p className="text-white/50 text-center mt-3 text-xs">
      Values update automatically from current Dexscreener price.
    </p>
  </div>
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
              <strong>Manual Compound</strong> is allowed once every 24h. <em>Each compound restarts the term.</em>
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

      


      {/* Why Base Gold */}
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
            Staking involves smart-contract and market risk. APRs can change within posted bounds and are not guaranteed.
            Only stake what you can afford to lock. Read the{' '}
            <Link href="/terms" className="underline text-amber-300">Terms</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
