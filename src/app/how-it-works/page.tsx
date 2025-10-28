export default function HowItWorksPage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-semibold mb-6">How It Works</h1>

      <section className="space-y-4 text-white/80 leading-relaxed">
        <p>
          Base Gold lets you lock BGLD into time-bound vaults (1–30 days) and earn rewards that vest continuously across the term.
          The APR range is configured on-chain and published transparently. Longer locks target higher APR within bounds.
        </p>
        <p>
          At maturity you can either withdraw your principal plus vested rewards, or compound to roll rewards into principal and
          restart the chosen term. Compounding frequently increases your principal base, potentially boosting future rewards.
        </p>
        <p>
          Exiting early is allowed, but a principal penalty applies that decays linearly from a maximum at day 0 to 0% at maturity,
          and only the vested portion of rewards is paid. This design discourages short-term churn and helps maintain vault health.
        </p>
        <p>
          A small fee on withdraw and on compound is routed back to the protocol to strengthen reserves and improve long-term
          sustainability.
        </p>
      </section>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 mt-8">
        <h2 className="text-xl font-semibold text-amber-300 mb-2">Key Properties</h2>
        <ul className="list-disc pl-6 space-y-2 text-white/80">
          <li>Vesting is continuous over the selected term.</li>
          <li>Compounding restarts the term and adds rewards to principal.</li>
          <li>Early exit pays vested rewards and applies a time-decaying principal penalty.</li>
          <li>Protocol fees on withdraw/compound feed the vault.</li>
        </ul>
      </div>
    </main>
  );
}
