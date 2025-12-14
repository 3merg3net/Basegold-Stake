import StakeClient from './StakeClient';
import MetricsStrip from '@/components/MetricsStrip';
import VaultStats from '@/components/VaultStats';

export const metadata = {
  title: 'Stake — Base Gold Reserve',
  description:
    'Stake BGLD into the Base Gold Reserve vault to earn time-based rewards. Choose a lock and withdraw after the term.',
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
          Welcome to the <span className="text-amber-300 font-semibold">Base Gold Reserve Vault</span> — a
          time-locked staking system designed to reward conviction and grow the Reserve on Base.
          Your vault is transparent onchain and rewards vest over time.
        </p>

        {/* Global market + vault stats */}
        <div className="mt-6">
          <MetricsStrip />
        </div>
        <div className="mt-4">
          <VaultStats />
        </div>

        <p className="text-white/70 max-w-3xl mx-auto mt-4 leading-relaxed">
          Use the module below to lock BGLD directly into the Reserve. Rewards are paid in{' '}
          <span className="text-amber-300 font-semibold">BGLD</span>, vest continuously, and the
          current APR is set by onchain parameters.
        </p>

        {/* V2 upgrade notice (bullish, mellow) */}
        <div className="mt-5 mx-auto max-w-3xl rounded-2xl border border-amber-300/30 bg-black/60 px-4 py-3 text-xs sm:text-sm text-amber-100">
          <div className="font-semibold text-amber-300 mb-0.5">
            V2 Vaults are in active development
          </div>
          <p className="leading-relaxed">
            V1 vaults remain live and honored onchain — and we’re building V2 to expand the system with longer-term
            incentives and Base Gold Rush integration. If you prefer to be positioned for the full V2 feature set,
            it may make sense to wait. If you choose to stake now, consider using a smaller test vault and a shorter lock.
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
                  Enter your amount and choose a lock between <strong>1–30 days</strong>.
                  The current APR is configured onchain and scales with duration.
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
                  <span className="text-emerald-300 font-semibold">Stake</span>. Your position becomes a live vault
                  tracked onchain.
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
                  Rewards vest across your lock term. At maturity you can withdraw principal plus vested rewards
                  (minus protocol fees) or later roll into V2 once live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Staking Card (primary action) ===== */}
      <section className="max-w-2xl mx-auto mb-12">
        <div className="rounded-2xl border border-amber-300/30 bg-black/50 backdrop-blur px-5 py-6 shadow-[0_0_24px_rgba(212,175,55,0.08)]">
          <h2 className="text-2xl font-semibold mb-4 text-amber-300">Open a Vault</h2>
          <p className="text-white/70 mb-6 leading-relaxed">
            Choose how long to lock your BGLD — anywhere from <strong>1 to 30 days</strong>.
            Rewards vest continuously while the vault is active. When the term ends, you can withdraw.
          </p>

          <StakeClient />
        </div>

        {/* ===== Mechanics Summary Card ===== */}
        <div className="mt-6 rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
          <h3 className="text-lg font-semibold text-amber-300 mb-2">
            Vault Mechanics — Quick Summary
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm leading-relaxed">
            <li>
              <span className="text-white/90 font-semibold">Rewards:</span> Paid in BGLD and vest continuously
              over your selected lock.
            </li>
            <li>
              <span className="text-white/90 font-semibold">APR:</span> Set by onchain parameters and scales with duration.
            </li>
            <li>
              <span className="text-white/90 font-semibold">Maturity Withdrawals:</span> A protocol fee may apply to principal + vested rewards.
            </li>
            <li>
              <span className="text-white/90 font-semibold">Early Exit:</span> A time-based penalty may apply; only vested rewards are paid out.
            </li>
            <li>
              <span className="text-white/90 font-semibold">V2:</span> Longer locks + new incentives + Base Gold Rush integration are being prepared.
            </li>
          </ul>
          <p className="text-[11px] text-white/45 mt-3 italic">
            “Gold rewards conviction. The Reserve rewards time.”
          </p>
        </div>
      </section>
    </main>
  );
}
