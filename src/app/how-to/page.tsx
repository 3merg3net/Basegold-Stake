export default function HowToPage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-semibold mb-6">How to Stake BGLD</h1>

      <ol className="list-decimal pl-6 space-y-4 text-white/80 leading-relaxed">
        <li>
          <strong>Connect Wallet.</strong> Open the <a href="/stake" className="underline text-amber-300">Stake</a> page and
          connect a Base-compatible wallet (Coinbase Wallet, MetaMask, etc.). Be on <strong>Base mainnet</strong>.
        </li>
        <li>
          <strong>Hold BGLD.</strong> You’ll need BGLD in your wallet and a small amount of ETH on Base for gas.
        </li>
        <li>
          <strong>Choose Amount & Term.</strong> Enter the BGLD amount and pick a lock duration (1–30 days). Longer locks earn
          higher APR within the published range.
        </li>
        <li>
          <strong>Approve → Stake.</strong> First approve the vault to use your BGLD, then confirm the stake transaction.
        </li>
        <li>
          <strong>Manage Your Vault.</strong> In the <em>Vaults</em> panel, you can view vesting progress, compound (which restarts
          the term), toggle auto-compound, or withdraw at maturity. Early exits apply a time-decaying principal penalty and only pay
          the vested portion of rewards.
        </li>
      </ol>

      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5 mt-8">
        <h2 className="text-xl font-semibold text-amber-300 mb-2">Tips</h2>
        <ul className="list-disc pl-6 space-y-2 text-white/80">
          <li>Manual compounding is available once every 24 hours during a term.</li>
          <li>Auto-compound re-locks your vault on protocol cadence; disable it any time.</li>
          <li>APR and fees can change within governance bounds; always check current terms.</li>
        </ul>
      </div>
    </main>
  );
}
