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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-white/15 bg-black/60 px-4 py-3">
        <span className="text-white/70 text-xs sm:text-sm uppercase tracking-wider">
          $BGLD Contract
        </span>
        <code className="text-amber-200 text-xs sm:text-sm break-all sm:break-normal">
          {address}
        </code>
        <button
          onClick={copy}
          className="sm:ml-auto inline-flex items-center gap-2 rounded-xl border border-amber-300/40 px-3 py-1.5 text-amber-200 hover:bg-amber-300/10 transition text-xs sm:text-sm"
          aria-label="Copy contract address"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
            <path
              fill="currentColor"
              d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"
            />
          </svg>
          <span>{copied ? 'Copied ✓' : 'Copy'}</span>
        </button>
      </div>

      {/* gold tooltip */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: copied ? 1 : 0, y: copied ? 0 : -6 }}
        transition={{ duration: 0.18 }}
        className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg border border-amber-300/40 bg-black/90 px-3 py-1 text-[11px] text-amber-200 shadow-lg pointer-events-none"
        aria-live="polite"
      >
        Contract copied: {short}
      </motion.div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-5 md:p-6">
      <div className="text-base md:text-lg font-semibold text-amber-300">
        {title}
      </div>
      <p className="mt-2 text-sm md:text-base text-white/80">{desc}</p>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-t from-black via-[#050608] to-black text-white">
      {/* Hero */}
      <section className="text-center pt-16 md:pt-20 pb-10 px-5">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
        >
          Stake Your Claim in{' '}
          <span className="text-amber-300 drop-shadow-[0_0_16px_rgba(212,175,55,0.45)]">
            Base Gold
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto mt-4 leading-relaxed"
        >
          On-chain <span className="text-amber-300 font-semibold">Gold Staking Vault</span>{' '}
          on Base. Lock BGLD, earn aggressive yield, and compound into a growing vault
          that’s fully visible onchain.
        </motion.p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Stake */}
            <Link
              href="/stake"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-300 text-black font-semibold rounded-2xl hover:bg-[#f1d371] transition text-sm sm:text-base shadow-[0_0_20px_rgba(212,175,55,0.25)]"
            >
              Start Staking — Live Now
            </Link>

            {/* Buy on Dexscreener */}
            <a
              href={DEX_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 border border-amber-300 text-amber-300 rounded-2xl hover:bg-amber-300/10 transition text-sm sm:text-base"
            >
              Buy $BGLD on Dexscreener
            </a>
          </div>

          {/* Quick 3-step guide */}
          <div className="mt-3 inline-flex flex-col sm:flex-row gap-2 sm:gap-4 text-[11px] sm:text-xs text-white/65">
            <div className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5">
              <span className="text-amber-300 font-semibold mr-1">1.</span>
              Buy $BGLD on Base
            </div>
            <div className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5">
              <span className="text-amber-300 font-semibold mr-1">2.</span>
              Stake in the Base Gold Vault
            </div>
            <div className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5">
              <span className="text-amber-300 font-semibold mr-1">3.</span>
              Earn & compound onchain
            </div>
          </div>

          {/* Contract pill with copy */}
          <div className="mt-5 w-full max-w-2xl">
            <ContractPill address={BGLD_CA} />
          </div>

          {/* Hype subtext */}
          <p className="mt-4 text-xs sm:text-sm text-white/60">
            Built on <span className="text-[#0AA0FF] font-semibold">Base</span> · Powered by ETH ·
            Staked in Gold
          </p>
        </div>
      </section>

      {/* Live Vault Metrics */}
      <section className="px-5 pb-10 max-w-6xl mx-auto w-full">
        <div className="mb-4 text-xs sm:text-sm text-white/60 text-center">
          Live data from the Base Gold market and staking contracts.
        </div>
        <MetricsStrip />
        <div className="mt-6">
          <VaultStats />
        </div>
      </section>

      {/* ===== Live Calculator Widget ===== */}
      <section className="px-5 mt-4 pb-12 max-w-3xl mx-auto w-full">
        <div className="rounded-2xl border border-amber-300/30 bg-black/60 px-4 sm:px-5 py-5 backdrop-blur shadow-[0_0_24px_rgba(212,175,55,0.12)]">
          <h2 className="text-lg sm:text-xl font-semibold text-amber-300 mb-1 text-center">
            Gold Vault Reward Simulator
          </h2>
          <p className="text-xs sm:text-sm text-white/70 text-center mb-4">
            Estimate your potential BGLD rewards in real time using the live Dexscreener price
            feed.
          </p>
          <div className="max-w-md mx-auto">
            <GoldCalculator
              mode="compact"
              demoPresets={[1_000_000, 5_000_000, 10_000_000, 20_000_000]}
              autoCycleMs={6000}
            />
          </div>
          <p className="text-[11px] text-white/50 text-center mt-3">
            Simulated values only. Actual rewards depend on your lock length and onchain
            conditions.
          </p>
        </div>
      </section>

      {/* How Staking Works */}
      <section className="px-5 pb-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-black/60 p-5 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-amber-300 text-center sm:text-left">
            How Staking Works
          </h2>

          <ol className="list-decimal pl-5 space-y-3 text-sm sm:text-base text-white/80 leading-relaxed">
            <li>
              Choose a lock term from <strong>1–30 days</strong>. Longer locks target higher APR
              within the posted bounds.
            </li>
            <li>
              At maturity you can <strong>Withdraw</strong> your principal + vested rewards, or{' '}
              <strong>Compound</strong> to roll rewards into principal and restart your chosen
              term.
            </li>
            <li>
              <strong>Manual Compound</strong> is allowed once every 24h.{' '}
              <em>Each compound restarts the term.</em>
            </li>
            <li>
              <strong>Auto-Compound</strong> can be toggled per vault. While enabled, the protocol
              compounds on its cadence and <em>each auto-compound restarts the term</em>. You can
              turn it off anytime in{' '}
              <Link href="/positions" className="underline text-amber-300">
                Vaults
              </Link>
              .
            </li>
            <li>
              Exiting early applies a decaying <strong>Early Exit Penalty</strong> on principal and
              only pays vested rewards. This protects long-term stakers and overall vault health.
            </li>
            <li>
              Protocol fees on withdraw/compound are retained in the system or routed to treasury,
              reinforcing Base Gold over time.
            </li>
          </ol>

          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs sm:text-sm text-amber-200">
            <p className="font-semibold mb-1">Signal in plain English</p>
            <p>
              Rewards vest continuously over your chosen term. Compounding adds vested rewards to
              principal and <em>restarts</em> the lock. At maturity you choose: withdraw, or
              compound to keep stacking more BGLD inside the vault.
            </p>
          </div>
        </div>
      </section>

      {/* Why Base Gold + Risk */}
      <section className="px-5 pb-24 max-w-6xl mx-auto">
        <div className="grid gap-5 md:gap-6 md:grid-cols-3">
          <FeatureCard
            title="Onchain Gold Vault"
            desc="Simple terms, transparent math. TVL, rewards, and protocol health are verifiable directly on Base."
          />
          <FeatureCard
            title="Compounding Engine"
            desc="Manual or auto. Every compound rolls vested rewards into principal, amplifying long-term growth."
          />
          <FeatureCard
            title="Base-Native"
            desc="Low fees, fast finality, and a thriving ecosystem. Perfect for everyday staking and compounding."
          />
        </div>

        {/* Risk disclosure */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/70 p-5 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
            Risk & Responsibility
          </h3>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed">
            Staking involves smart contract and market risk. APR targets can change within posted
            bounds and are not guaranteed. Only stake what you can afford to lock. Review the{' '}
            <Link href="/terms" className="underline text-amber-300">
              Terms
            </Link>{' '}
            before participating.
          </p>
        </div>
      </section>
    </main>
  );
}
