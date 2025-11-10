import GoldCalculator from '@/components/GoldCalculator';

export const metadata = {
  title: 'Terms — Base Gold Reserve',
  description:
    'Terms of use for the Base Gold Reserve staking vaults on Base.',
};

export default function TermsPage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-4xl mx-auto text-white">
      {/* Header */}
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-amber-300">Terms of Use</h1>
        <p className="mt-3 text-white/70 max-w-2xl mx-auto">
          These Terms govern your use of the Base Gold Reserve staking vaults. By interacting with the contracts,
          you accept these Terms and acknowledge onchain risks. Read carefully.
        </p>
      </section>

      <section className="mb-8">
  <div className="rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
    <h2 className="text-lg font-semibold text-amber-300 mb-2">Reserve Mechanics — At a Glance</h2>
    <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm leading-relaxed">
      <li>Rewards paid in BGLD; continuous vesting over your lock term.</li>
      <li>APR scales with duration (~10% → 1200%).</li>
      <li>Manual compound (24h) & Auto-compound (48h), each with 1% protocol fee; compounds restart the lock.</li>
      <li>Maturity withdraw fee 2%; early exit penalty decays 10% → 2%.</li>
      <li>Team-seeded POL reinforces liquidity and vault longevity.</li>
    </ul>
  </div>
</section>


      {/* Compact calculator “trust pulse” */}
      <section className="mb-10">
        <div className="rounded-2xl border border-amber-300/30 bg-black/50 backdrop-blur px-5 py-5 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
          <h2 className="text-lg font-semibold text-amber-300 mb-2 text-center">
            Quick Vault Rewards Estimator
          </h2>
          <p className="text-white/70 text-center mb-4 text-sm">
            Live estimates using current Dexscreener pricing. Values update automatically.
          </p>
          <div className="max-w-md mx-auto">
            <GoldCalculator mode="compact" />
          </div>
        </div>
      </section>

      {/* Terms content */}
      <section className="space-y-8 leading-relaxed text-white/80">
        <div>
          <h3 className="text-xl font-semibold text-white">1. Staking & Rewards</h3>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>Lock <span className="text-white/90 font-semibold">BGLD</span> for fixed terms of <span className="font-semibold">1–30 days</span>.</li>
            <li>Rewards are paid in <span className="text-white/90 font-semibold">BGLD</span> and
              <span className="font-semibold"> vest continuously</span> over your selected term.</li>
            <li>Target APR scales with duration, approximately <span className="font-semibold">10% → 1200%</span> depending on lock length and vault conditions.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">2. Compounding</h3>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li><span className="font-semibold">Manual Compound:</span> allowed every <span className="font-semibold">24h</span>, incurs a
              <span className="font-semibold"> 1% protocol fee</span>, adds vested rewards to principal, and
              <em> restarts the lock</em>.</li>
            <li><span className="font-semibold">Auto-Compound (optional):</span> runs every
              <span className="font-semibold"> 48h</span> while enabled, incurs a <span className="font-semibold">1% fee</span> retained in the vault, and
              <em> restarts the lock</em>.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">3. Withdrawals & Early Exit</h3>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li><span className="font-semibold">At maturity:</span> a <span className="font-semibold">2%</span> withdraw fee applies to principal + vested rewards.</li>
            <li><span className="font-semibold">Early exit:</span> penalty decays from <span className="font-semibold">10% → 1%</span> linearly to maturity; only the
              <span className="font-semibold"> vested</span> portion of rewards is paid.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">4. Liquidity & Sustainability</h3>
          <p className="mt-2">
            The team purchased supply at launch to seed vaults and deepen Protocol-Owned Liquidity (POL).
            Protocol fees recycle into the vault to strengthen reserves. This structure is designed to align long-term
            liquidity with long-term stakers.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">5. Risks</h3>
          <p className="mt-2">
            Interacting with smart contracts involves risk, including smart-contract bugs, market volatility,
            and parameter updates. Yields are variable and not guaranteed. Only stake what you can afford to lock,
            and verify contract addresses onchain before interacting.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">6. Updates</h3>
          <p className="mt-2">
            Terms may be amended to reflect protocol improvements. Continued use constitutes acceptance of updates.
          </p>
        </div>
      </section>

      {/* bullish footer */}
      <div className="mt-12 text-center text-sm text-white/65 italic">
        “Gold doesn’t rush — it endures. Base Gold brings that discipline onchain.”
      </div>
    </main>
  );
}
