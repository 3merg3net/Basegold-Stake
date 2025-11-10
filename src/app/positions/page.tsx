import VaultsPanel from '@/components/VaultsPanel';
import Link from 'next/link';
import VaultStats from '@/components/VaultStats';
import MetricsStrip from '@/components/MetricsStrip';
export const dynamic = 'force-static';

export default function VaultsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 text-white">
      {/* ===== Header ===== */}
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-amber-300">
          Your Reserve Vaults
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl mx-auto leading-relaxed">
          Every vault is a living position in the <span className="text-amber-300 font-semibold">Base Gold Reserve</span>.  
          Here you can monitor, compound, and withdraw your active BGLD stakes — directly from the Base chain.
        </p>
      </header>
      <MetricsStrip/>
      <VaultStats/>

      {/* ===== Guidance box ===== */}
      <section className="rounded-2xl border border-amber-300/30 bg-black/50 px-6 py-6 mb-10 backdrop-blur shadow-[0_0_24px_rgba(212,175,55,0.08)]">
        <h2 className="text-xl font-semibold text-amber-300 mb-3">Vault Management</h2>
        <ul className="space-y-2 text-white/80 text-sm leading-relaxed">
          <li>
            • <span className="text-amber-300 font-semibold">Compound</span> — reinvest your vested rewards to grow your
            position. A small <span className="text-amber-300 font-semibold">1%</span> protocol fee applies and your term restarts.
          </li>
          <li>
            • <span className="text-emerald-300 font-semibold">Withdraw</span> — available at maturity with a{' '}
            <span className="text-amber-300 font-semibold">2%</span> fee on total principal + vested rewards.
          </li>
          <li>
            • <span className="text-rose-400 font-semibold">Emergency Exit</span> — accessible before maturity; penalty decays
            from <span className="text-amber-300 font-semibold">10%</span> down to <span className="text-amber-300 font-semibold">1%</span>.
          </li>
        </ul>
        <p className="mt-4 text-xs text-white/50">
          All data is fetched directly from your wallet and the Base Gold smart contracts. No intermediaries, no off-chain balances.
        </p>
      </section>

      {/* ===== Vaults panel ===== */}
      <section className="mb-12">
        <VaultsPanel />
      </section>

      {/* ===== Helpful links / calls to action ===== */}
      <section className="text-center">
        <div className="inline-flex flex-wrap justify-center gap-3">
          <Link
            href="/stake"
            className="px-5 py-2.5 rounded-xl bg-amber-300 text-black font-semibold hover:bg-[#f1d371] transition"
          >
            Open New Vault
          </Link>
          <Link
            href="/status"
            className="px-5 py-2.5 rounded-xl border border-amber-300/40 text-amber-200 hover:bg-amber-300/10 transition"
          >
            Protocol Status
          </Link>
          <Link
            href="/mechanics"
            className="px-5 py-2.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/5 transition"
          >
            Mechanics / Whitepaper
          </Link>
        </div>
      </section>
    </main>
  );
}
