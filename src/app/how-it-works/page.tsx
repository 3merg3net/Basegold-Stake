import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-semibold mb-6">Base Gold Reserve Mechanics</h1>

      {/* ===== Migration Banner ===== */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-b from-black/70 via-[#0b0b0b]/85 to-black/90 px-6 py-10 shadow-[0_0_48px_rgba(212,175,55,0.10)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border border-amber-300/40 blur-[1px]" />
          <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full border border-amber-300/25" />
        </div>

        <div className="text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-black/40 px-4 py-1 text-xs text-amber-200/90">
            <span>Base Gold Reserve Protocol</span>
            <span className="opacity-60">•</span>
            <span>V1 Transition / V2 Preparation</span>
          </div>

          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-amber-300">
            V1 VAULTS ARE TRANSITIONING TO V2
          </h1>
          <p className="mt-3 text-white/70 max-w-3xl mx-auto">
            The original Base Gold Reserve vault system is being transitioned into a dedicated
            migration path while the protocol prepares a more sustainable V2 architecture.
            Existing balances remain recorded onchain.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href="/positions"
              className="px-5 py-2.5 rounded-xl bg-amber-300 text-black font-semibold hover:bg-[#f1d371] transition"
            >
              View Existing Vaults
            </Link>
            <Link
              href="/status"
              className="px-5 py-2.5 rounded-xl border border-amber-300/40 text-amber-200 hover:bg-amber-300/10 transition"
            >
              Migration Status
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-amber-300/30 bg-black/50 px-6 py-6 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
  <h2 className="text-2xl font-semibold text-amber-300 mb-3">
    For Existing V1 Vault Holders
  </h2>
  <p className="text-white/80 leading-relaxed">
    If you already opened a V1 vault, your position has not disappeared and has not been removed from the protocol.
    Existing balances remain recorded onchain and visible through the Vaults page while the migration path to V2 is finalized.
  </p>
  <p className="mt-3 text-white/75 leading-relaxed">
    The current pause is intended to move the legacy V1 system into a structured migration process.
    No action is required from users at this time. Additional details, next steps, and migration guidance will be published through the Status page as they are finalized.
  </p>
  
  <div className="mt-4 flex flex-wrap gap-3">
    <Link
      href="/positions"
      className="px-4 py-2 rounded-xl bg-amber-300 text-black font-semibold hover:bg-[#f1d371] transition"
    >
      View Existing Vaults
    </Link>
    <Link
      href="/status"
      className="px-4 py-2 rounded-xl border border-amber-300/40 text-amber-200 hover:bg-amber-300/10 transition"
    >
      Migration Status
    </Link>
  </div>
</section>

      <div id="whitepaper" className="mt-12" />

      <section className="space-y-4 text-white/80 leading-relaxed">
        <p>
          Base Gold originally introduced V1 as a time-locked vault system where BGLD could be
          deposited into fixed-duration positions. Those balances remain visible onchain, but V1
          interactions are currently paused in the interface while the protocol finalizes its next phase.
        </p>
        <p>
          The current focus is not new V1 participation, but a transition into a more durable V2
          reserve design. Existing positions continue to be part of the historical onchain state and
          remain reviewable through the Vaults page.
        </p>
        <p>
  For users with existing V1 positions, the protocol is treating those vaults as part of a migration workflow rather than as abandoned balances.
  The interface pause is designed to stabilize the transition to V2 while keeping legacy positions visible and reviewable onchain.
</p>
        <p>
          V2 is intended to preserve the core reserve concept while improving long-term sustainability,
          refining reward mechanics, and aligning more closely with the broader Base Gold ecosystem.
        </p>
        <p>
          During this transition period, users should treat V1 as a legacy system under migration rather
          than an actively promoted staking product.
        </p>
      </section>

      {/* ===== Protocol Overview ===== */}
      <section className="mt-16 rounded-2xl border border-amber-300/30 bg-black/50 px-6 py-8 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
        <h2 className="text-3xl font-bold mb-4 text-amber-300">
          Base Gold Reserve Overview
        </h2>
        <p className="text-white/80 mb-6 leading-relaxed">
          The <strong>Base Gold Reserve</strong> is an onchain reserve ecosystem built around the idea
          of time preference, transparent contract state, and long-term alignment. The protocol is now
          moving from its initial V1 vault model toward a more sustainable V2 architecture.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-white/90">1. Reserve Vision</h3>
        <p className="text-white/70 mb-5 leading-relaxed">
          Base Gold is built around a reserve-first philosophy. The goal is to create a durable Base-native
          system where long-term alignment matters more than short-term churn, and where onchain visibility
          remains central to how the reserve is understood.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-white/90">2. Legacy V1 Vaults</h3>
        <p className="text-white/70 mb-5 leading-relaxed">
          V1 introduced short-term time-locked vault mechanics and onchain reward accounting. Those positions
          remain part of the protocol’s onchain history, but V1 is now being treated as a legacy generation
          of the reserve while migration planning moves forward.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-white/90">3. V2 Direction</h3>
        <ul className="list-disc pl-6 mb-5 space-y-2 text-white/80">
          <li>Updated reserve mechanics designed for stronger long-term sustainability.</li>
          <li>Improved alignment between vault structure and broader ecosystem health.</li>
          <li>Future utility tied more directly to the wider Base Gold roadmap.</li>
          <li>Migration planning that preserves visibility into legacy V1 balances.</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3 text-white/90">
          4. Onchain Transparency
        </h3>
        <p className="text-white/70 mb-5 leading-relaxed">
          A core principle of Base Gold remains transparency. Even during migration, existing balances,
          vault identifiers, and contract references remain visible onchain and reviewable through the
          protocol interface.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-white/90">
          5. Transition Philosophy
        </h3>
        <p className="text-white/70 leading-relaxed">
          The current transition is focused on evolving the reserve architecture rather than abandoning it.
          V2 is intended to carry forward the reserve concept with healthier long-term mechanics and stronger
          system design.
        </p>

        <div className="mt-6 text-center text-sm text-white/60 italic">
          “The reserve evolves. Transparency remains.”
        </div>
      </section>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 mt-8">
        <h2 className="text-xl font-semibold text-amber-300 mb-2">Current Key Properties</h2>
        <ul className="list-disc pl-6 space-y-2 text-white/80">
          <li>V1 vault balances remain visible onchain.</li>
          <li>V1 interactions are temporarily paused in the interface.</li>
          <li>Migration details and rollout updates will be published through the Status page.</li>
          <li>V2 is being built as the next long-term reserve architecture.</li>
          <li>The reserve-first concept remains central to the protocol direction.</li>
        </ul>
      </div>
    </main>
  );
}