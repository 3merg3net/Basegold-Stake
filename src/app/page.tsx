'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import MetricsStrip from '@/components/MetricsStrip';
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

function FeatureCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
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
        {/* Bullish V2 upgrade notice */}
        <div className="mx-auto mb-5 max-w-3xl rounded-2xl border border-amber-300/30 bg-black/60 px-4 py-3 text-xs sm:text-sm text-amber-100">
          <div className="font-semibold text-amber-300 mb-0.5">
            Base Gold Vaults are evolving — V2 is in progress
          </div>
          <p className="text-amber-100/90 leading-relaxed">
            The reception to the introductory V1 vault has been massive — and we’re building the next phase.
            <span className="text-amber-300 font-semibold"> V2 Vaults</span> will introduce longer lock options,
            improved long-term reward design, and new incentives tied to the{' '}
            <span className="text-white/90 font-semibold">Base Gold Rush</span> casino platform.
            <span className="text-amber-300 font-semibold"> More details will be announced ahead of launch.</span>
          </p>
        </div>

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
          On-chain <span className="text-amber-300 font-semibold">Gold Vaults</span> on Base.
          Lock BGLD, earn time-based rewards, and track every position transparently onchain — with
          V2 bringing the next level of long-term upside.
        </motion.p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Stake */}
            <Link
              href="/stake"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-300 text-black font-semibold rounded-2xl hover:bg-[#f1d371] transition text-sm sm:text-base shadow-[0_0_20px_rgba(212,175,55,0.25)]"
            >
              Open a Vault — Live
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
              Lock in a Base Gold vault
            </div>
            <div className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5">
              <span className="text-amber-300 font-semibold mr-1">3.</span>
              Earn time-based rewards onchain
            </div>
          </div>

          {/* Contract pill with copy */}
          <div className="mt-5 w-full max-w-2xl">
            <ContractPill address={BGLD_CA} />
          </div>

          {/* Hype subtext */}
          <p className="mt-4 text-xs sm:text-sm text-white/60">
            Built on <span className="text-[#0AA0FF] font-semibold">Base</span> · Powered by ETH ·
            Designed as a digital gold reserve
          </p>
        </div>
      </section>

      {/* Live Vault Metrics */}
      <section className="px-5 pb-10 max-w-6xl mx-auto w-full">
        <div className="mb-4 text-xs sm:text-sm text-white/60 text-center">
          Live data from the Base Gold market and vault contracts.
        </div>
        <MetricsStrip />
        <div className="mt-6">
          <VaultStats />
        </div>
      </section>

      {/* V2: Bullish expansion section (replaces estimator) */}
      <section className="px-5 mt-2 pb-14 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl border border-amber-300/30 bg-black/60 px-5 sm:px-6 py-6 backdrop-blur shadow-[0_0_24px_rgba(212,175,55,0.12)]">
          <h2 className="text-xl sm:text-2xl font-semibold text-amber-300 mb-2">
            V2 Vaults: The House-Aligned Upgrade
          </h2>
          <p className="text-sm sm:text-base text-white/75 leading-relaxed">
            V1 proved the demand for a Base-native reserve vault. V2 takes it further — built for
            sustainability, longer-term conviction, and real utility across the Base Gold ecosystem.
            The goal is simple: reward stakers who strengthen the Reserve while building the next wave of growth.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-sm font-semibold text-white/90">Longer Locks</div>
              <p className="mt-1 text-sm text-white/70">
                More runway for long-term stakers — with reward design that favors conviction over churn.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-sm font-semibold text-white/90">High Long-Term APR</div>
              <p className="mt-1 text-sm text-white/70">
                Strong incentives where they matter most: longer commitments, healthier vault math, stronger protocol.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-sm font-semibold text-white/90">Casino Incentives</div>
              <p className="mt-1 text-sm text-white/70">
                V2 stakers will be positioned for future casino-aligned rewards — including chip utilities and
                potential revenue-share opportunities as Base Gold Rush grows.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs sm:text-sm text-amber-100/90">
            <span className="font-semibold text-amber-300">The big idea:</span>{' '}
            never before has staking made it this easy to be aligned with the “house” side of a casino ecosystem.
            As Base Gold Rush expands, the Reserve expands — and V2 stakers are positioned closest to the growth.
          </div>
        </div>
      </section>

      {/* How Staking Works */}
      <section className="px-5 pb-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-black/60 p-5 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-amber-300 text-center sm:text-left">
            How the Vault Works (Current)
          </h2>

          <ol className="list-decimal pl-5 space-y-3 text-sm sm:text-base text-white/80 leading-relaxed">
            <li>
              Choose a lock term (current vaults are short-term). Longer locks generally target stronger rewards
              within on-chain parameters.
            </li>
            <li>
              While your vault is active, rewards in <strong>BGLD</strong> vest continuously across the term.
              Monitor your position on the{' '}
              <Link href="/positions" className="underline text-amber-300">
                Vaults
              </Link>{' '}
              page.
            </li>
            <li>
              At maturity, withdraw your principal plus vested rewards (minus protocol fees), or roll into the V2
              system once it’s live.
            </li>
            <li>
              Exiting early applies a time-based penalty to principal and only pays the vested portion of rewards,
              protecting long-term vault health.
            </li>
          </ol>

          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs sm:text-sm text-amber-200">
            <p className="font-semibold mb-1">Upgrade Path</p>
            <p>
              Current vaults remain honored onchain. V2 will deploy separately with expanded mechanics and new
              incentives. TVL will be presented as a unified number across vault systems during the transition.
            </p>
          </div>
        </div>
      </section>

      {/* Why Base Gold + Risk */}
      <section className="px-5 pb-24 max-w-6xl mx-auto">
        <div className="grid gap-5 md:gap-6 md:grid-cols-3">
          <FeatureCard
            title="Onchain Gold Vault"
            desc="Simple time-based vaults with transparent math. TVL and rewards are verifiable directly on Base."
          />
          <FeatureCard
            title="Reserve-First Design"
            desc="Parameters are refined to protect long-term sustainability while still rewarding conviction."
          />
          <FeatureCard
            title="Built for Expansion"
            desc="V2 aligns vaults with the Base Gold Rush casino ecosystem — giving stakers utility and future upside."
          />
        </div>

        {/* Risk disclosure */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/70 p-5 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
            Risk & Responsibility
          </h3>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed">
            Staking involves smart contract and market risk. Vault parameters can change as the protocol evolves.
            Yields are not guaranteed. Only stake what you can afford to lock, and review the{' '}
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
