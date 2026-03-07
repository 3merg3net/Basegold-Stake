import VaultsPanel from '@/components/VaultsPanel';
import Link from 'next/link';
import VaultStats from '@/components/VaultStats';
import MetricsStrip from '@/components/MetricsStrip';

export const dynamic = 'force-static';

export default function VaultsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 text-white">
      {/* ===== Header ===== */}
      <header className="text-center mb-7">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-amber-300">
          Your BGLD Reserve Vaults
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base">
          Existing V1 vault balances remain visible onchain while the protocol completes
          the migration path to a more sustainable V2 architecture.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/status"
            className="px-5 py-2.5 rounded-xl bg-amber-300 text-black font-semibold hover:bg-[#f1d371] transition"
          >
            Migration Status
          </Link>
          <Link
            href="/how-it-works"
            className="px-5 py-2.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/5 transition"
          >
            Mechanics / Whitepaper
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-amber-300/40 text-amber-200 hover:bg-amber-300/10 transition"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* ===== V1 Pause / V2 Migration Announcement ===== */}
      <section className="mb-8">
        <div className="rounded-2xl border border-amber-400/60 bg-gradient-to-r from-black via-[#2a2010] to-black px-4 sm:px-5 py-4 shadow-[0_0_20px_rgba(212,175,55,0.35)]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-black text-xs font-extrabold shadow-[0_0_12px_rgba(212,175,55,0.8)]">
              !
            </span>
            <div>
              <div className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase text-amber-200">
                V1 Vaults Paused • V2 Migration In Progress
              </div>
              <p className="mt-1 text-[11px] sm:text-xs text-amber-100/90 leading-snug">
                V1 interactions are temporarily paused in the interface while the protocol
                completes a liquidity review and prepares the migration to V2 vault architecture.
                Existing balances remain recorded onchain. No user action is required at this time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Vaults ===== */}
      <section className="mb-10">
        <div className="flex items-end justify-between gap-3 mb-3">
          <h2 className="text-xl font-semibold text-amber-200">
            Your Existing Positions (V1)
          </h2>
          <Link
            href="/status"
            className="text-xs text-amber-200/80 hover:text-amber-200 underline underline-offset-4"
          >
            View migration updates
          </Link>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/45 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_0_18px_rgba(0,0,0,0.5)]">
          <VaultsPanel />

          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
            <div className="text-[11px] font-semibold text-white/70">
              Not seeing your vaults?
            </div>
            <ul className="mt-1 text-[11px] text-white/55 leading-snug space-y-1">
              <li>
                • Confirm your wallet is connected on{' '}
                <span className="text-[#0AA0FF] font-semibold">Base</span>
              </li>
              <li>• Give it a moment to sync (some wallets take a few seconds)</li>
              <li>• Follow the Status page for migration timing and next steps</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Migration Summary ===== */}
      <section className="rounded-2xl border border-amber-300/30 bg-black/50 px-6 py-6 mb-10 backdrop-blur shadow-[0_0_24px_rgba(212,175,55,0.08)]">
        <h2 className="text-lg font-semibold text-amber-300 mb-3">
          V1 Pause & Migration Summary
        </h2>
        <ul className="space-y-2 text-white/80 text-sm leading-relaxed">
          <li>
            • <span className="text-white/90 font-semibold">V1 Status:</span> New staking,
            withdrawals, and emergency exits are temporarily disabled in the interface.
          </li>
          <li>
            • <span className="text-white/90 font-semibold">Balances:</span> Existing positions remain
            visible onchain and can still be reviewed on this page.
          </li>
          <li>
            • <span className="text-white/90 font-semibold">V2 Goal:</span> Updated reserve mechanics,
            improved sustainability, and future ecosystem incentives.
          </li>
          <li>
            • <span className="text-white/90 font-semibold">Next Steps:</span> Migration details,
            timelines, and rollout updates will be published through the Status page.
          </li>
        </ul>
        <p className="mt-4 text-xs text-white/55">
          This page remains available so users can review existing vault balances while the protocol
          finalizes the transition path to V2.
        </p>
      </section>

      {/* ===== Metrics strip ===== */}
      <section className="mb-8">
        <MetricsStrip />
      </section>

      {/* ===== Vault Stats ===== */}
      <section className="mb-6">
        <VaultStats />
      </section>

      {/* ===== Footer CTA ===== */}
      <section className="text-center">
        <div className="inline-flex flex-wrap justify-center gap-3">
          <Link
            href="/status"
            className="px-5 py-2.5 rounded-xl bg-amber-300 text-black font-semibold hover:bg-[#f1d371] transition"
          >
            Migration Status
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-amber-300/40 text-amber-200 hover:bg-amber-300/10 transition"
          >
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}