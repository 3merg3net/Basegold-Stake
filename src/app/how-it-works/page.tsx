export const metadata = {
  title: "How It Works – Base Gold",
  description:
    "Simple overview of Base Gold staking: lock periods, compounding, and early exit rules.",
};

export default function HowItWorksPage() {
  const STAKE_URL = process.env.NEXT_PUBLIC_STAKE_URL || "https://stake.basereserve.gold";
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-white">
      <h1 className="text-3xl font-bold tracking-wide text-amber-300">How Staking Works</h1>

      <section className="mt-6 space-y-4 text-white/85">
        <p>
          Stake <strong>$BGLD</strong> for a fixed period to earn rewards. If you turn on
          <em> Auto-Compound</em>, earned rewards are applied to your principal, increasing your base for the next calculation—no extra steps.
        </p>

        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Lock Periods:</strong> 1–30 days. Longer locks target higher APRs.</li>
          <li><strong>Compounding:</strong> rewards applied to principal when enabled.</li>
          <li><strong>Emergency Exit:</strong> permitted anytime. A percentage of unvested rewards are forfeited; a small principal fee (up to 5%) applies and decreases as you approach maturity.</li>
          <li><strong>Clarity:</strong> compounding uses rewards to grow your stake; we don’t “hold” user ETH outside executing your selection.</li>
        </ul>

        <p className="pt-2 text-white/70 text-sm">
          Parameters can evolve to keep the system sustainable. Check the current terms in app before confirming a stake.
        </p>
      </section>

      <div className="mt-8">
        <a
          href={STAKE_URL}
          className="inline-block rounded-xl bg-amber-400/90 px-5 py-3 font-semibold text-black hover:bg-amber-300"
          target="_blank"
          rel="noreferrer"
        >
          Open Staking
        </a>
      </div>
    </main>
  );
}
