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
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-amber-300">
          Terms of Use
        </h1>
        <p className="mt-3 text-white/70 max-w-2xl mx-auto">
          These Terms govern your use of the Base Gold Reserve staking vaults. By
          interacting with the contracts, you accept these Terms and acknowledge
          onchain risks. Read carefully.
        </p>
      </section>

      {/* Reserve Mechanics Summary (no compounding language) */}
      <section className="mb-8">
        <div className="rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
          <h2 className="text-lg font-semibold text-amber-300 mb-2">
            Reserve Mechanics — At a Glance (V1)
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm leading-relaxed">
            <li>
              Rewards are paid in BGLD and vest continuously over your selected lock term.
            </li>
            <li>
              APR scales with duration within a published range (e.g. higher APR for
              longer locks).
            </li>
            <li>
              Withdrawals at maturity incur a small protocol fee on principal plus vested
              rewards.
            </li>
            <li>
              Early exit applies a time-based penalty to principal and only pays vested
              rewards.
            </li>
            <li>
              Team-seeded protocol-owned liquidity (POL) helps reinforce liquidity depth
              and vault longevity.
            </li>
            <li>
              A simplified V2 contract with updated mechanics and dynamic APR is in
              development; new terms will be published ahead of launch.
            </li>
          </ul>
        </div>
      </section>

      

      {/* Terms content */}
      <section className="space-y-8 leading-relaxed text-white/80">
        <div>
          <h3 className="text-xl font-semibold text-white">1. Staking & Rewards</h3>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>
              You may lock <span className="text-white/90 font-semibold">BGLD</span> for
              fixed terms (currently <span className="font-semibold">1–30 days</span> in
              V1), as published in the interface.
            </li>
            <li>
              Rewards are paid in <span className="text-white/90 font-semibold">BGLD</span>{' '}
              and vest continuously over your selected term.
            </li>
            <li>
              Target APR scales with duration, with higher APR generally associated with
              longer locks, subject to vault configuration and TVL.
            </li>
            <li>
              All rewards and balances are determined by onchain contract logic. The UI is
              a view into that state and may occasionally lag or show approximations.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">
            2. Lock Terms, Withdrawals & Early Exit
          </h3>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>
              <span className="font-semibold">At maturity:</span> a protocol fee (e.g. ~2%)
              may apply to principal and vested rewards, as configured by the contract.
            </li>
            <li>
              <span className="font-semibold">Early exit:</span> if you withdraw before
              maturity, a time-based penalty is applied to principal. Only the vested
              portion of rewards, if any, is paid out.
            </li>
            <li>
              You are solely responsible for understanding how these penalties and fees
              work before opening a vault.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">
            3. Liquidity & Sustainability
          </h3>
          <p className="mt-2">
            The team purchased BGLD supply at launch to seed vaults and deepen
            protocol-owned liquidity (POL) on Base. Protocol fees may recycle into the
            vault or treasury to support system health. This structure is designed to align
            long-term liquidity with long-term stakers, but does not guarantee any specific
            price level or yield.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">4. Protocol Upgrades (V2)</h3>
          <p className="mt-2">
            The Base Gold Reserve may deploy new versions of the staking contract (e.g.
            &quot;V2&quot;) with updated mechanics, APR curves, and fee structures. When
            this occurs, the team intends to:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>Publish new documentation and parameter ranges ahead of launch.</li>
            <li>
              Announce any planned liquidity migration date so participants can adjust
              positions.
            </li>
            <li>
              Honor existing V1 vaults onchain according to the V1 contract logic, unless
              otherwise stated in a publicly verifiable way.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">5. Risks</h3>
          <p className="mt-2">
            Interacting with smart contracts involves risk, including but not limited to:
            smart-contract bugs, market volatility, oracle or liquidity failures,
            parameter updates, or third-party integrations. Yields are variable and not
            guaranteed. Only stake what you can afford to lock and independently verify
            contract addresses and parameters before interacting.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">6. Updates to These Terms</h3>
          <p className="mt-2">
            These Terms may be amended to reflect protocol improvements, new versions of
            the vault contract, regulatory considerations, or other changes. Updated Terms
            may be posted on the site or in associated official channels. Continued use of
            the protocol after updates constitutes acceptance of the revised Terms.
          </p>
        </div>
      </section>

      {/* footer quote */}
      <div className="mt-12 text-center text-sm text-white/65 italic">
        “Gold doesn’t rush — it endures. Base Gold brings that discipline onchain.”
      </div>
    </main>
  );
}
