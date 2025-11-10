import StakeClient from './StakeClient';
import MetricsStrip from '@/components/MetricsStrip';
import GoldCalculator from '@/components/GoldCalculator';
import VaultStats from '@/components/VaultStats';

export const metadata = {
  title: 'Stake — Base Gold Reserve',
  description:
    'Stake BGLD into the Base Gold Reserve vault to earn auto-compounding rewards. Lock from 1–30 days. Withdraw anytime after the term.',
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
          Welcome to the <span className="text-amber-300 font-semibold">Base Gold Reserve Vault</span> —
          a time-locked staking system that rewards conviction. Every lock term adds strength to the vault
          and compounds your holdings through transparent, onchain mechanics.
        </p>
        <MetricsStrip/>
              <VaultStats/>
        <p className="text-white/70 max-w-3xl mx-auto mt-3 leading-relaxed">
          Use the <span className="text-amber-300">Gold Compound Calculator</span> to preview yield, then set your
          amount and term to stake directly into the Reserve. Rewards are paid in <span className="text-amber-300 font-semibold">BGLD</span>,
          vest continuously, and scale with your lock duration — up to <span className="text-emerald-300 font-semibold">1200% APR</span>.
        </p>
      </section>

      {/* ===== Live Calculator (small) ===== */}
      <div className="mb-10 max-w-xl mx-auto">
        <GoldCalculator mode="full" className="scale-[.97]" />

      </div>

      {/* ===== Staking Card ===== */}
      <section className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-amber-300/30 bg-black/50 backdrop-blur px-5 py-6 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
          <h2 className="text-2xl font-semibold mb-4 text-amber-300">Your Vault Position</h2>
          <p className="text-white/70 mb-6 leading-relaxed">
            Choose how long to lock your BGLD — anywhere from <strong>1 to 30 days</strong>. Longer terms earn higher rewards.
            Enable <span className="text-amber-300">auto-compound</span> to roll vested rewards into principal every 48h,
            or compound manually every 24h to fine-tune growth. <em>Each compound restarts the lock.</em>
          </p>

          {/* Stake form inside card */}
          <StakeClient />
        </div>

        {/* ===== Mechanics Summary Card ===== */}
        <div className="mt-6 rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
          <h3 className="text-lg font-semibold text-amber-300 mb-2">Vault Mechanics — Quick Summary</h3>
          <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm leading-relaxed">
            <li><span className="text-white/90 font-semibold">Rewards:</span> Paid in BGLD and vest continuously over your selected lock.</li>
            <li><span className="text-white/90 font-semibold">APR:</span> Targets scale with duration — approx. <strong>10% → 1200%</strong>.</li>
            <li><span className="text-white/90 font-semibold">Manual Compound:</span> Every <strong>24h</strong>, <strong>1%</strong> fee; adds vested rewards to principal; <em>restarts lock</em>.</li>
            <li><span className="text-white/90 font-semibold">Auto-Compound (optional):</span> Every <strong>48h</strong>, <strong>1%</strong> fee retained in vault; <em>restarts lock</em>.</li>
            <li><span className="text-white/90 font-semibold">Withdraw at Maturity:</span> <strong>2%</strong> fee on principal + vested rewards.</li>
            <li><span className="text-white/90 font-semibold">Early Exit:</span> Penalty decays from <strong>10% → 2%</strong> linearly; only vested rewards are paid.</li>
            <li><span className="text-white/90 font-semibold">POL:</span> Team purchased supply at launch to seed vaults and deepen protocol-owned liquidity.</li>
          </ul>
          <p className="text-[11px] text-white/45 mt-3 italic">
            “Every compound reinforces the Reserve.”
          </p>
        </div>
      </section>

      {/* ===== Metrics Strip (Vault Health) ===== */}
      <section className="mt-16">
        <h3 className="text-xl font-semibold mb-2 text-center text-white/90">
          Vault Health & Network Metrics
        </h3>
        <p className="text-white/60 text-center mb-6 text-sm">
          Live data from the Base Gold protocol — updated in real time.
        </p>
        
      </section>
    </main>
  );
}
