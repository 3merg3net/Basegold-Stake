export default function HowItWorksPage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-semibold mb-6">Base Gold Vault Mechanics</h1>

      {/* ===== Whitepaper Banner ===== */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-b from-black/70 via-[#0b0b0b]/85 to-black/90 px-6 py-10 shadow-[0_0_48px_rgba(212,175,55,0.10)]">
        {/* watermark seal */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border border-amber-300/40 blur-[1px]" />
          <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full border border-amber-300/25" />
        </div>

        <div className="text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-black/40 px-4 py-1 text-xs text-amber-200/90">
            <span>Base Gold Reserve Protocol</span>
            <span className="opacity-60">•</span>
            <span>Whitepaper v1.0 (V1 Vaults)</span>
          </div>

          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-amber-300">
            THE GOLD STANDARD MECHANISM
          </h1>
          <p className="mt-3 text-white/70 max-w-3xl mx-auto">
            A Base-native Reserve that channels conviction into time-locked vaults.
            Transparent math, fixed-duration staking, and liquidity that grows with the vault.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <a
              href="/stake"
              className="px-5 py-2.5 rounded-xl bg-amber-300 text-black font-semibold hover:bg-[#f1d371] transition"
            >
              Open a V1 Vault
            </a>
            <a
              href="#whitepaper"
              className="px-5 py-2.5 rounded-xl border border-amber-300/40 text-amber-200 hover:bg-amber-300/10 transition"
            >
              Read Whitepaper
            </a>
          </div>
        </div>
      </section>

      {/* anchor */}
      <div id="whitepaper" className="mt-12" />

      <section className="space-y-4 text-white/80 leading-relaxed">
        <p>
          Base Gold lets you lock BGLD into time-bound vaults (currently 1–30 days in V1)
          and earn rewards that vest continuously across the term. The APR range is
          configured on-chain and published transparently. Longer locks target higher APR
          within bounds.
        </p>
        <p>
          While your vault is active, rewards accrue in BGLD and can be monitored on the
          Vaults page. At the end of your chosen term, you may withdraw your principal plus
          vested rewards (minus protocol fees) or later decide to open a new vault,
          including on V2 once deployed.
        </p>
        <p>
          Exiting early is allowed, but a principal penalty applies that decays as your
          vault approaches maturity, and only the vested portion of rewards is paid. This
          design discourages short-term churn and helps maintain vault health.
        </p>
        <p>
          A small fee on withdraw is routed back to the protocol to strengthen reserves and
          support long-term sustainability. V2 will preserve these core ideas while
          simplifying mechanics and introducing dynamic APR linked to vault conditions.
        </p>
      </section>

      {/* ===== Base Gold Whitepaper ===== */}
      <section className="mt-16 rounded-2xl border border-amber-300/30 bg-black/50 px-6 py-8 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
        <h2 className="text-3xl font-bold mb-4 text-amber-300">
          Base Gold Reserve Whitepaper (V1 Overview)
        </h2>
        <p className="text-white/80 mb-6 leading-relaxed">
          The <strong>Base Gold Reserve</strong> is an onchain staking ecosystem designed
          for long-term stability, high-yield rewards, and Base-native liquidity. It
          merges the perceived reliability of &quot;digital gold&quot; with the speed and
          transparency of blockchain technology.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-white/90">1. Reserve Vision</h3>
        <p className="text-white/70 mb-5 leading-relaxed">
          Base Gold exists as a digital hedge for volatile markets. When others chase hype,
          BGLD focuses on time and conviction. Every lock and every completed term adds
          structural strength to the vault, forming an expanding onchain reserve governed
          by mathematics, not centralized discretion.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-white/90">2. Tokenomics</h3>
        <ul className="list-disc pl-6 mb-5 space-y-2 text-white/80">
          <li>Total Supply: <strong>1,000,000,000 BGLD</strong></li>
          <li>
            A portion of supply is seeded by the team to initialize staking vaults and
            protocol-owned liquidity (POL) on Base.
          </li>
          <li>Protocol fees recycle back into vault reserves.</li>
          <li>Rewards are distributed in BGLD and vest continuously across each lock.</li>
          <li>Liquidity is reinforced through team-held POL on Base DEXs.</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3 text-white/90">3. Reward Mechanics (V1)</h3>
        <ul className="list-disc pl-6 mb-5 space-y-2 text-white/80">
          <li>APR scales with lock duration and is published onchain.</li>
          <li>Rewards accrue in BGLD and vest linearly over the chosen term.</li>
          <li>
            Withdrawals at maturity incur a small protocol fee on principal plus vested
            rewards.
          </li>
          <li>
            Early exit applies a time-based penalty to principal and pays only vested
            rewards.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mb-3 text-white/90">
          4. Liquidity & Sustainability
        </h3>
        <p className="text-white/70 mb-5 leading-relaxed">
          Team-seeded POL helps Base Gold maintain liquidity depth onchain, shielding the
          system from shallow markets and supporting consistent reward flows. Fees
          continuously reinforce this reserve, aiming for sustainable yields instead of
          unsustainable inflation. V2 builds on this foundation with a cleaner curve and
          TVL-aware APR.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-white/90">
          5. The Philosophy of Gold
        </h3>
        <p className="text-white/70 leading-relaxed">
          Gold represents trust, permanence, and value through time. Base Gold mirrors that
          principle for the digital age — not through a hard peg, but through transparency,
          time preference, and collective conviction. Each staker becomes a contributor to
          a decentralized Reserve where rewards flow to those willing to lock through
          volatility.
        </p>

        <div className="mt-6 text-center text-sm text-white/60 italic">
          “When the noise fades, the Reserve remains.”
        </div>
      </section>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 mt-8">
        <h2 className="text-xl font-semibold text-amber-300 mb-2">Key Properties</h2>
        <ul className="list-disc pl-6 space-y-2 text-white/80">
          <li>Rewards vest continuously over the selected term.</li>
          <li>APR increases with longer lock durations, within posted bounds.</li>
          <li>
            Early exit pays vested rewards only and applies a time-decaying principal
            penalty.
          </li>
          <li>
            Protocol fees on withdrawals and other actions feed back into the vault and
            POL.
          </li>
          <li>
            V2 will keep the &quot;time-locked reserve&quot; idea while simplifying
            behavior for long-term stability.
          </li>
        </ul>
      </div>
    </main>
  );
}
