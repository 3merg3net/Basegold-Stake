export const metadata = {
  title: 'Documentation – Base Gold',
  description: 'Official documentation for Base Gold staking vault and auto-compounding protocol.',
};

export default function DocsPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6 prose prose-invert prose-headings:text-gold">
      <h1 className="text-gold text-4xl font-bold mb-6">Base Gold Documentation</h1>

      <p className="opacity-90">
        Welcome to the Base Gold documentation hub. This section provides a concise overview of the
        staking vault, compounding mechanism, and vault reward logic. Use this as a quick technical
        and conceptual reference before engaging with the protocol.
      </p>

      <h2>Overview</h2>
      <p>
        Base Gold is a decentralized staking and compounding vault built on the
        <strong> Base </strong> Layer-2 blockchain. It enables users to stake <strong>BGLD</strong>{' '}
        tokens, earn ETH-denominated rewards, and automatically compound them back into liquidity
        for long-term yield amplification.
      </p>

      <h2>Core Mechanics</h2>
      <ul>
        <li>
          <strong>Vault Staking:</strong> Lock your BGLD tokens into the vault for a chosen duration
          (1–30 days). Longer locks yield higher APR multipliers.
        </li>
        <li>
          <strong>ETH Compounding:</strong> Staking rewards are distributed in ETH. When compounded,
          the contract automatically purchases additional BGLD and adds it to your stake position.
        </li>
        <li>
          <strong>Uniswap V3 Integration:</strong> The vault interacts with a 1% exotic
          full-range pool to maintain deep liquidity and auto-rebalance LP tokens.
        </li>
        <li>
          <strong>Reserve Layer:</strong> A percentage of vault rewards route to the Reserve Pool to
          sustain future protocol development and ecosystem initiatives.
        </li>
      </ul>

      <h2>Compounding Logic</h2>
      <p>
        When you trigger <code>Compound()</code>, your earned ETH rewards are used to market-buy
        BGLD and add them to the LP stake. This auto-compounding effect steadily increases your
        position over time without requiring manual claims.
      </p>

      <h2>Smart Contract Architecture</h2>
      <ul>
        <li><strong>Vault.sol</strong> – Handles deposits, withdrawals, and reward tracking.</li>
        <li><strong>Compounder.sol</strong> – Executes ETH → BGLD swaps and LP restakes.</li>
        <li><strong>ReserveVault.sol</strong> – Manages protocol fee collection.</li>
        <li><strong>ERC20.sol</strong> – Implements the BGLD token standard (1B total supply).</li>
      </ul>

      <h2>Audit & Security</h2>
      <p>
        Base Gold contracts follow modern Solidity best practices. Before mainnet launch, they will
        undergo peer review and static analysis. We encourage community verification and open-source
        transparency.
      </p>

      <h2>Getting Started</h2>
      <ol>
        <li>Connect your wallet (MetaMask, Rainbow, or Coinbase Wallet).</li>
        <li>Stake BGLD in the vault UI.</li>
        <li>Select your preferred lock duration (1–30 days).</li>
        <li>Compound rewards periodically or let them auto-stake.</li>
      </ol>

      <h2>Governance</h2>
      <p>
        The Base Gold ecosystem is evolving toward community governance. Future upgrades may allow
        stakers to propose and vote on vault parameters, emission curves, and reserve allocation.
      </p>

      <h2>Links</h2>
      <ul>
        <li>
          <a href="https://www.basereserve.gold" target="_blank" className="text-gold hover:underline">
            Official Site
          </a>
        </li>
        <li>
          <a href="https://x.com/BaseReserveGold" target="_blank" className="text-gold hover:underline">
            Twitter / X
          </a>
        </li>
        <li>
          <a href="https://basescan.org" target="_blank" className="text-gold hover:underline">
            View Contracts on Basescan
          </a>
        </li>
      </ul>

      <p className="mt-10 italic text-gray-400">
        Documentation last updated {new Date().toLocaleDateString()}.
      </p>
    </main>
  );
}
