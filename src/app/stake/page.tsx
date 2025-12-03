import StakeClient from './StakeClient';
import MetricsStrip from '@/components/MetricsStrip';
import GoldCalculator from '@/components/GoldCalculator';
import VaultStats from '@/components/VaultStats';

export const metadata = {
  title: 'Stake — Base Gold Reserve',
  description:
    'Stake BGLD into the Base Gold Reserve vault to earn time-based rewards. Lock from 1–30 days. Withdraw after the term.',
};

export default function StakePage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-5xl mx-auto text-white">
      {/* ===== Title & Intro ===== */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-amber-300">
          Stake Your Gold. Strengthen the Reserve.
        </h1>
        <p className="text-white/80 max-w-3xl mx-auto leading-relaxed">
          Welcome to the <span className="text-amber-300 font-semibold">Base Gold Reserve Vault (V1)</span> —{' '}
          a time-locked staking system that rewards conviction. Every lock term adds strength to the
          vault and earns you BGLD rewards that vest over time and settle onchain.
        </p>

        {/* Global market + vault stats */}
        <div className="mt-6">
          <MetricsStrip />
        </div>
        <div className="mt-4">
          <VaultStats />
        </div>

        <p className="text-white/70 max-w-3xl mx-auto mt-4 leading-relaxed">
          Use the staking module below to lock BGLD directly into the Reserve. Rewards are paid in{' '}
          <span className="text-amber-300 font-semibold">BGLD</span>, vest continuously, and scale with your
          lock duration up to the published APR band.
        </p>

        {/* V2 upgrade notice */}
        <div className="mt-5 mx-auto max-w-3xl rounded-2xl border border-amber-300/30 bg-black/60 px-4 py-3 text-xs sm:text-sm text-amber-100">
          <div className="font-semibold text-amber-300 mb-0.5">
            V2 staking contract is in active development
          </div>
          <p>
            This page currently interacts with the V1 staking contract. A simplified V2 vault with
            updated mechanics and dynamic APR will launch separately, with a clear liquidity migration
            date announced in advance.
          </p>
        </div>
      </section>

      {/* ===== 3-Step How-To ===== */}
      <section className="max-w-2xl mx-auto mb-10">
        <div className="rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
          <h2 className="text-lg md:text-xl font-semibold text-amber-300 mb-3 text-center">
            How to Stake in 3 Steps
          </h2>
          <div className="space-y-3 text-sm md:text-base">
            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-300 text-black text-xs font-bold">
                1
              </div>
              <div>
                <div className="font-semibold text-white/90">Choose Your Lock</div>
                <p className="text-white/70">
                  Enter your amount and choose a lock between <strong>1–30 days</strong>. Longer locks target
                  higher APR within the posted range.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-black text-xs font-bold">
                2
              </div>
              <div>
                <div className="font-semibold text-white/90">Approve → Stake</div>
                <p className="text-white/70">
                  Tap <span className="text-amber-300 font-semibold">Approve</span>, then tap{' '}
                  <span className="text-emerald-300 font-semibold">Stake</span> once it lights up. Your position
                  becomes a live <span className="text-amber-300">vault</span> tracked onchain.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-400 text-black text-xs font-bold">
                3
              </div>
              <div>
                <div className="font-semibold text-white/90">Let Time Work</div>
                <p className="text-white/70">
                  Rewards vest over your lock term. At maturity you can withdraw principal plus vested rewards
                  (minus protocol fees) or decide to open a new vault — including in V2 when live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Staking Card (primary action) ===== */}
      <section className="max-w-2xl mx-auto mb-12">
        <div className="rounded-2xl border border-amber-300/30 bg-black/50 backdrop-blur px-5 py-6 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
          <h2 className="text-2xl font-semibold mb-4 text-amber-300">Your Vault Position</h2>
          <p className="text-white/70 mb-6 leading-relaxed">
            Choose how long to lock your BGLD — anywhere from <strong>1 to 30 days</strong>. While the
            vault is open, your rewards in BGLD vest continuously. At the end of the term, you can withdraw
            or later re-lock as part of your longer-term strategy.
          </p>

          {/* Stake form inside card */}
          <StakeClient />
        </div>

        {/* ===== Mechanics Summary Card ===== */}
        <div className="mt-6 rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
          <h3 className="text-lg font-semibold text-amber-300 mb-2">
            Vault Mechanics — Quick Summary (V1)
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm leading-relaxed">
            <li>
              <span className="text-white/90 font-semibold">Rewards:</span> Paid in BGLD and vest
              continuously over your selected lock.
            </li>
            <li>
              <span className="text-white/90 font-semibold">APR:</span> Targets scale with duration
              within the published band (e.g. shorter locks lower APR, longer locks higher APR).
            </li>
            <li>
              <span className="text-white/90 font-semibold">Maturity Withdrawals:</span> A protocol
              fee (e.g. ~2%) may apply to principal plus vested rewards.
            </li>
            <li>
              <span className="text-white/90 font-semibold">Early Exit:</span> A time-based penalty
              applies to principal; only vested rewards are paid out.
            </li>
            <li>
              <span className="text-white/90 font-semibold">POL:</span> Team-purchased supply at
              launch seeded vaults and protocol-owned liquidity on Base.
            </li>
            <li>
              <span className="text-white/90 font-semibold">V2:</span> A new vault contract with
              simplified behavior and dynamic APR will be introduced; V1 positions will remain
              honored onchain.
            </li>
          </ul>
          <p className="text-[11px] text-white/45 mt-3 italic">
            “Base Gold is a time-based reserve, not a get-rich-quick scheme.”
          </p>
        </div>
      </section>

      {/* ===== Calculator (bottom) ===== */}
      <section className="max-w-xl mx-auto mb-16">
        <h3 className="text-xl font-semibold text-center text-white/90 mb-3">
          Optional · Gold Reward Estimator
        </h3>
        <p className="text-sm text-white/60 text-center mb-4">
          Use this to preview estimated rewards before staking — it does not affect your actual vault
          position and may differ from final V2 parameters.
        </p>

        <GoldCalculator mode="full" className="scale-[.97]" />
      </section>
    </main>
  );
}
