export const metadata = {
  title: 'How It Works – Base Gold',
  description: 'Understand the Base Gold vault, compounding loop, and liquidity flow.',
};

export default function HowItWorksPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 prose prose-invert prose-headings:text-gold">
      <h1 className="text-gold text-4xl font-bold mb-6">How It Works</h1>

      <p className="opacity-90">
        Base Gold is a decentralized vault on <strong>Base</strong> that converts earned ETH into new
        <strong> BGLD</strong> and restakes it—automatically—so your position grows over time.
      </p>

      <h2>The Cycle</h2>
      <ol>
        <li><strong>Stake BGLD</strong> into the vault (choose your lock duration).</li>
        <li><strong>Earn ETH</strong> rewards from protocol flows.</li>
        <li><strong>Compound</strong>: swap ETH → BGLD via Uniswap V3 and add to your position.</li>
        <li><strong>Repeat</strong>: auto or manual—your choice.</li>
      </ol>

      <h2>Why This Matters</h2>
      <ul>
        <li><strong>Buy Pressure</strong>: Compounding routes ETH into BGLD buys.</li>
        <li><strong>Compounding Effect</strong>: More stake → more rewards → more stake.</li>
        <li><strong>LP Health</strong>: A single 1% exotic full-range pool keeps depth coherent.</li>
      </ul>

      <h2>Auto vs Manual</h2>
      <p>
        Enable <strong>Auto</strong> to compound on a schedule; use <strong>Manual</strong> for tighter timing control.
        Either way, compounds execute a single transaction that routes ETH → BGLD and restakes back into your vault.
      </p>

      <h2>Transparency</h2>
      <p>
        Every compound is on-chain. Track your vault share and events on{' '}
        <a className="text-gold hover:underline" href="https://basescan.org" target="_blank">Basescan</a>.
      </p>

      <h2>Risk</h2>
      <p>
        Smart contracts can contain bugs; markets are volatile. Never stake more than you can afford to lose. See{' '}
        <a className="text-gold hover:underline" href="/terms">Terms</a>.
      </p>
    </main>
  );
}
