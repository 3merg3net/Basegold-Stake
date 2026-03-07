import Link from 'next/link';
import StakeClient from './StakeClient';
import MetricsStrip from '@/components/MetricsStrip';
import VaultStats from '@/components/VaultStats';

export const metadata = {
  title: 'Vault Migration — Base Gold Reserve',
  description:
    'V1 vault interactions are paused while Base Gold Reserve prepares the migration to V2 architecture.',
};

export default function StakePage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-5xl mx-auto text-white">
      {/* ===== Title & Intro ===== */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-amber-300">
          V1 Vaults Are Paused
        </h1>

        <p className="text-white/80 max-w-3xl mx-auto leading-relaxed">
          The <span className="text-amber-300 font-semibold">Base Gold Reserve</span> is transitioning
          from the original V1 vault system to a more sustainable V2 architecture.
          Existing balances remain visible onchain while the migration path is finalized.
        </p>

        {/* Global market + vault stats */}
        <div className="mt-6">
          <MetricsStrip />
        </div>
        <div className="mt-4">
          <VaultStats />
        </div>

        <p className="text-white/70 max-w-3xl mx-auto mt-4 leading-relaxed">
          New V1 vault creation is temporarily disabled in the interface.
          Users do not need to take action right now. Migration details and next steps will be shared
          once the V2 path is finalized.
        </p>

        {/* Pause notice */}
        <div className="mt-5 mx-auto max-w-3xl rounded-2xl border border-amber-300/30 bg-black/60 px-4 py-3 text-xs sm:text-sm text-amber-100">
          <div className="font-semibold text-amber-300 mb-0.5">
            V1 interactions are temporarily paused
          </div>
          <p className="leading-relaxed">
            V1 staking and withdrawals are currently unavailable in the interface while the protocol completes
            a liquidity review and prepares the migration to <span className="text-amber-300 font-semibold">V2 Vaults</span>.
            Existing balances remain recorded onchain.
          </p>
        </div>
      </section>

      {/* ===== Migration Path ===== */}
      <section className="max-w-2xl mx-auto mb-10">
        <div className="rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
          <h2 className="text-lg md:text-xl font-semibold text-amber-300 mb-3 text-center">
            What Happens Next
          </h2>

          <div className="space-y-3 text-sm md:text-base">
            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-300 text-black text-xs font-bold">
                1
              </div>
              <div>
                <div className="font-semibold text-white/90">V1 Snapshot</div>
                <p className="text-white/70">
                  Existing V1 balances and positions remain visible onchain while the protocol finalizes
                  the migration framework.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-black text-xs font-bold">
                2
              </div>
              <div>
                <div className="font-semibold text-white/90">V2 Architecture</div>
                <p className="text-white/70">
                  The next vault system is being designed around stronger long-term sustainability,
                  updated reserve mechanics, and improved ecosystem alignment.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-400 text-black text-xs font-bold">
                3
              </div>
              <div>
                <div className="font-semibold text-white/90">Migration Details</div>
                <p className="text-white/70">
                  A dedicated migration path, updated mechanics, and future incentives will be announced
                  before V2 goes live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Disabled Staking Card ===== */}
      <section className="max-w-2xl mx-auto mb-12">
        <div className="rounded-2xl border border-amber-300/30 bg-black/50 backdrop-blur px-5 py-6 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
          <h2 className="text-2xl font-semibold mb-4 text-amber-300">
            V1 Vault Creation Paused
          </h2>
          <p className="text-white/70 mb-6 leading-relaxed">
            Opening new V1 vaults is temporarily disabled while the protocol prepares the migration to V2.
            Existing balances remain recorded onchain, and no user action is required at this time.
          </p>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="text-sm text-white/70 mb-4">
              The staking module is currently unavailable.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                disabled
                className="w-full rounded-2xl bg-white/10 text-white/50 px-5 py-3 font-semibold cursor-not-allowed border border-white/10"
              >
                V1 Paused
              </button>

              <Link
                href="/positions"
                className="w-full rounded-2xl border border-amber-300/40 text-amber-200 hover:bg-amber-300/10 transition px-5 py-3 font-semibold text-center"
              >
                View Existing Vaults
              </Link>
            </div>
          </div>
        </div>

        {/* ===== Migration Summary Card ===== */}
        <div className="mt-6 rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
          <h3 className="text-lg font-semibold text-amber-300 mb-2">
            Migration Summary
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm leading-relaxed">
            <li>
              <span className="text-white/90 font-semibold">V1 Status:</span> New staking and vault interaction
              are temporarily paused in the interface.
            </li>
            <li>
              <span className="text-white/90 font-semibold">Balances:</span> Existing positions remain recorded
              onchain and visible through the Vaults page.
            </li>
            <li>
              <span className="text-white/90 font-semibold">V2 Goal:</span> Updated reserve mechanics, healthier
              long-term sustainability, and future ecosystem incentives.
            </li>
            <li>
              <span className="text-white/90 font-semibold">Next Steps:</span> Migration details, timelines, and
              rollout information will be published as V2 is finalized.
            </li>
          </ul>
          <p className="text-[11px] text-white/45 mt-3 italic">
            “The Reserve is evolving. V2 is being built for the long term.”
          </p>
        </div>
      </section>
    </main>
  );
}