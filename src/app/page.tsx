import Hero from '@/components/Hero';
import CompoundPanel from '@/components/CompoundPanel';
import ClaimDashboard from '@/components/ClaimDashboard';
import VaultStats from '@/components/VaultStats';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-darkbg to-black text-white">
      <Hero />

      {/* Compounding */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gold mb-3 text-glow-gold">Automated Compounding</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Convert earned ETH into fresh BGLD on every cycle. Toggle{' '}
            <span className="text-gold font-semibold">Auto</span> to compound on a schedule,
            or run it <span className="font-semibold">Manually</span> whenever you want tighter control.
            All actions route through Uniswap V3 and restake back into your vault.
          </p>
        </div>
        <CompoundPanel />
        <div className="mt-12 text-center text-sm text-gray-400 max-w-3xl mx-auto leading-relaxed">
          <p>
            Compounding executes an ETH→BGLD swap and adds the output to your position in a single transaction.
            No manual claiming. No idle rewards. Just continuous growth and transparent on-chain receipts.
          </p>
        </div>
      </section>

      {/* Live stats */}
      <VaultStats />

      {/* Staking vaults */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-gold/20">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gold mb-3 text-glow-gold">Staking Vaults</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Pick your lock period for boosted APR. Short-term to long-term claims — all vaults compound
            automatically and feed BGLD liquidity with ETH-denominated rewards.
          </p>
        </div>
        <ClaimDashboard />
      </section>

      {/* Thesis */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-gold/20 text-center">
        <h2 className="text-3xl font-bold text-gold mb-4">The Base Gold Thesis</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
          Base Gold channels network ETH flow into compounding BGLD exposure. One shared LP, transparent vaults,
          and sustainable buy pressure via automated reinvestment. Stake early, compound often.
        </p>
      </section>
    </main>
  );
}
