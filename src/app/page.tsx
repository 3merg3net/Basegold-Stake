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
        {/* V1 pause + V2 migration notice */}
        <div className="mx-auto mb-5 max-w-3xl rounded-2xl border border-amber-300/30 bg-black/60 px-4 py-3 text-xs sm:text-sm text-amber-100">
          <div className="font-semibold text-amber-300 mb-0.5">
            V1 Vaults are temporarily paused — V2 migration is in progress
          </div>
          <p className="text-amber-100/90 leading-relaxed">
            The Base Gold Reserve is moving to a more sustainable vault architecture.
            Existing V1 balances remain recorded onchain while the protocol prepares the next phase.
            <span className="text-amber-300 font-semibold"> V2 Vaults</span> will introduce updated lock design,
            improved sustainability, and future ecosystem incentives tied to
            <span className="text-white/90 font-semibold"> Base Gold Rush</span>.
          </p>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
        >
          Base Gold Reserve Is{' '}
          <span className="text-amber-300 drop-shadow-[0_0_16px_rgba(212,175,55,0.45)]">
            Upgrading to V2
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto mt-4 leading-relaxed"
        >
          The protocol is transitioning from V1 vaults to a more sustainable V2 design.
          Existing balances remain visible onchain, and updated migration details will be shared soon.
        </motion.p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/positions"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-300 text-black font-semibold rounded-2xl hover:bg-[#f1d371] transition text-sm sm:text-base shadow-[0_0_20px_rgba(212,175,55,0.25)]"
            >
              View V1 Vaults
            </Link>

            <Link
              href="/status"
              className="w-full sm:w-auto px-8 py-3.5 border border-amber-300 text-amber-300 rounded-2xl hover:bg-amber-300/10 transition text-sm sm:text-base"
            >
              Migration Status
            </Link>

            <a
              href={DEX_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 border border-white/15 text-white/80 rounded-2xl hover:bg-white/5 transition text-sm sm:text-base"
            >
              View $BGLD Market
            </a>
          </div>

          <div className="mt-3 inline-flex flex-col sm:flex-row gap-2 sm:gap-4 text-[11px] sm:text-xs text-white/65">
            <div className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5">
              <span className="text-amber-300 font-semibold mr-1">1.</span>
              V1 interactions are paused
            </div>
            <div className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5">
              <span className="text-amber-300 font-semibold mr-1">2.</span>
              Balances remain recorded onchain
            </div>
            <div className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5">
              <span className="text-amber-300 font-semibold mr-1">3.</span>
              V2 migration details coming soon
            </div>
          </div>

          <div className="mt-5 w-full max-w-2xl">
            <ContractPill address={BGLD_CA} />
          </div>

          <p className="mt-4 text-xs sm:text-sm text-white/60">
            Built on <span className="text-[#0AA0FF] font-semibold">Base</span> · Powered by ETH ·
            Next phase of the reserve architecture now in development
          </p>
        </div>
      </section>

      {/* Live Metrics */}
      <section className="px-5 pb-10 max-w-6xl mx-auto w-full">
        <div className="mb-4 text-xs sm:text-sm text-white/60 text-center">
          Live data from the Base Gold market and visible vault contracts.
        </div>
        <MetricsStrip />
        <div className="mt-6">
          <VaultStats />
        </div>
      </section>

      {/* V2 section */}
      <section className="px-5 mt-2 pb-14 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl border border-amber-300/30 bg-black/60 px-5 sm:px-6 py-6 backdrop-blur shadow-[0_0_24px_rgba(212,175,55,0.12)]">
          <h2 className="text-xl sm:text-2xl font-semibold text-amber-300 mb-2">
            V2 Vaults: The Reserve Upgrade
          </h2>
          <p className="text-sm sm:text-base text-white/75 leading-relaxed">
            V1 demonstrated strong demand for a Base-native reserve vault, but the next phase requires
            a more sustainable design. V2 is being built to support longer-term alignment, healthier reward mechanics,
            and future utility across the Base Gold ecosystem.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-sm font-semibold text-white/90">Longer-Term Design</div>
              <p className="mt-1 text-sm text-white/70">
                Updated lock structures and reserve mechanics designed to better support long-term protocol health.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-sm font-semibold text-white/90">Sustainability First</div>
              <p className="mt-1 text-sm text-white/70">
                Reward design and reserve math are being rebuilt around stronger long-term alignment and more durable growth.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-sm font-semibold text-white/90">Future Ecosystem Utility</div>
              <p className="mt-1 text-sm text-white/70">
                V2 is expected to align more closely with future Base Gold Rush incentives and broader ecosystem expansion.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs sm:text-sm text-amber-100/90">
            <span className="font-semibold text-amber-300">Current focus:</span>{' '}
            complete the V1 migration path, finalize V2 architecture, and transition the reserve system into
            a more durable long-term structure.
          </div>
        </div>
      </section>

      {/* V1 migration path */}
      <section className="px-5 pb-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-black/60 p-5 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-amber-300 text-center sm:text-left">
            V1 Pause & Migration Path
          </h2>

          <ol className="list-decimal pl-5 space-y-3 text-sm sm:text-base text-white/80 leading-relaxed">
            <li>
              V1 vault interactions are temporarily paused in the interface while the protocol finalizes
              a migration plan.
            </li>
            <li>
              Existing vault balances remain visible on the{' '}
              <Link href="/positions" className="underline text-amber-300">
                Vaults
              </Link>{' '}
              page and continue to be recorded onchain.
            </li>
            <li>
              V2 will introduce updated vault mechanics designed for stronger long-term sustainability and
              future ecosystem alignment.
            </li>
            <li>
              Additional migration details, timelines, and next steps will be published as the rollout is finalized.
            </li>
          </ol>

          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs sm:text-sm text-amber-200">
            <p className="font-semibold mb-1">Migration Update</p>
            <p>
              V1 is being transitioned into a dedicated migration path while V2 is prepared as the long-term
              reserve architecture. Users do not need to take action at this time.
            </p>
          </div>
        </div>
      </section>

      {/* Why Base Gold + Risk */}
      <section className="px-5 pb-24 max-w-6xl mx-auto">
        <div className="grid gap-5 md:gap-6 md:grid-cols-3">
          <FeatureCard
            title="Onchain Transparency"
            desc="Vault balances and positions remain visible directly on Base while the protocol prepares the V2 migration path."
          />
          <FeatureCard
            title="Sustainability Upgrade"
            desc="V2 is being designed around healthier long-term reserve mechanics and stronger ecosystem alignment."
          />
          <FeatureCard
            title="Built for Expansion"
            desc="The next phase of Base Gold connects reserve architecture with future ecosystem utility, including casino-aligned incentives."
          />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/70 p-5 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
            Protocol Update
          </h3>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed">
            The Base Gold Reserve is undergoing an architecture transition. V1 vault interactions are
            temporarily paused in the interface while the migration path to V2 is finalized. Please follow the{' '}
            <Link href="/status" className="underline text-amber-300">
              Status
            </Link>{' '}
            page for updates and next steps.
          </p>
        </div>
      </section>
    </main>
  );
}