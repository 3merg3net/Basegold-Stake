// src/app/how-it-works/page.tsx

export const metadata = {
  title: 'How it works — Base Gold',
  description: 'Simple, transparent, and reward-focused staking on Base Gold.',
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-darkbg to-black text-white">
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gold">How it works</h1>
        <p className="mt-3 text-white/80">
          Stake <span className="font-semibold text-gold">BGLD</span> for 1–30 days. While staked, your position earns
          ETH rewards. Each compounding cycle automatically applies your earned rewards to your staked principal,
          allowing it to grow and qualify for higher future yields. You can keep compounding automatic or compound
          manually whenever you like.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-6 space-y-4">
        <div className="rounded-2xl border border-gold/20 bg-black/40 p-5">
          <h2 className="text-lg font-semibold text-gold">Locks & Rewards</h2>
          <p className="text-white/80 text-sm mt-1">
            Choose your lock period — <span className="font-semibold">1, 7, 10, 14, 21, or 30 days</span> — or pick a
            custom value with the slider. Rewards vest linearly over the lock duration. Longer locks earn higher APRs,
            up to <span className="font-semibold text-gold">1200%</span> for 30-day stakes.
          </p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-black/40 p-5">
          <h2 className="text-lg font-semibold text-gold">Compounding</h2>
          <p className="text-white/80 text-sm mt-1">
            When you compound, your earned ETH rewards are converted into additional BGLD and added to your existing
            stake. This increases your principal balance and boosts the rewards you earn in the next cycle.
          </p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-black/40 p-5">
          <h2 className="text-lg font-semibold text-gold">Exiting</h2>
          <p className="text-white/80 text-sm mt-1">
            At maturity you can withdraw normally with no penalty. If you exit early, an Emergency Exit option lets you
            unlock your BGLD immediately, forfeiting unvested rewards and incurring a small principal penalty that starts
            at <span className="font-semibold">5%</span> on day 0 and decays to <span className="font-semibold">0%</span>{' '}
            by maturity.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="text-center text-sm text-white/70">
          Ready to begin? Go to <a className="underline text-gold" href="/stake">Stake</a> or check{' '}
          <a className="underline text-gold" href="/status">Vault Health</a>. For the fine print, read the{' '}
          <a className="underline text-gold" href="/terms">Terms</a>.
        </div>
      </section>
    </main>
  );
}
