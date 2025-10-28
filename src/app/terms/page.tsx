export default function TermsPage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-semibold mb-6">Terms of Use</h1>

      <div className="space-y-4 text-white/80 leading-relaxed">
        <p>
          By using Base Gold, you agree to these Terms. Staking involves smart-contract risk and market risk. Rewards and APRs are
          variable and not guaranteed. Only stake what you can afford to lock.
        </p>
        <p>
          Vault mechanics include continuous reward vesting over the chosen term, optional compounding (which restarts the term),
          and early exit with a time-decaying principal penalty plus forfeiture of unvested rewards. Protocol fees may apply to
          withdraw and compound operations and are directed to strengthen vault reserves.
        </p>
        <p>
          The protocol reserves the right to adjust APR bounds, fees, or configuration parameters within governance/owner controls.
          Any changes will be reflected on the site and on-chain configuration.
        </p>
        <p>
          Nothing here constitutes financial advice. You are solely responsible for your decisions and for complying with your local
          laws and regulations.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 mt-8 text-sm text-white/60">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </div>
    </main>
  );
}
