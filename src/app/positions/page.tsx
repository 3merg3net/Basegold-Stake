import VaultsPanel from '@/components/VaultsPanel';
import Link from 'next/link';
import VaultStats from '@/components/VaultStats';
import MetricsStrip from '@/components/MetricsStrip';

export const dynamic = 'force-static';

export default function VaultsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 text-white">
      {/* ===== Header ===== */}
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-amber-300">
          Your BGLD Reserve Vaults
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base">
          These are your live staking positions in the
          <span className="text-amber-300 font-semibold"> Base Gold Reserve</span>.  
          View, manage, and withdraw your staked BGLD directly from your Base wallet.
        </p>
      </header>

      {/* ===== Legacy / V2 Announcement ===== */}
      <section className="mb-8">
        <div className="rounded-2xl border border-amber-400/60 bg-gradient-to-r from-black via-[#2a2010] to-black px-4 sm:px-5 py-4 shadow-[0_0_20px_rgba(212,175,55,0.35)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-black text-xs font-extrabold shadow-[0_0_12px_rgba(212,175,55,0.8)]">
                !
              </span>
              <div>
                <div className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase text-amber-200">
                  Legacy Vaults (V1) • V2 Upgrade Coming
                </div>
                <p className="mt-1 text-[11px] sm:text-xs text-amber-100/90 leading-snug">
                  Current vaults remain active and continue vesting as normal. We’re preparing an
                  upgraded V2 Gold Vault with longer lock options, dynamic APR, and improved risk
                  controls. You’ll be able to migrate or open fresh V2 positions once it’s live.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-stretch sm:items-end gap-2 text-[11px] sm:text-xs">
              <Link
                href="/stake"
                className="inline-flex items-center justify-center rounded-xl border border-amber-300/70 bg-amber-300/10 px-3 py-1.5 text-amber-100 font-semibold hover:bg-amber-300/20 transition"
              >
                Open New Stake
              </Link>
              <span className="text-[10px] text-amber-100/70 text-left sm:text-right">
                Full V2 details and any migration incentives will be announced before launch.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Vaults FIRST (mobile-first UX) ===== */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-amber-200 mb-3">
          Your Active Positions (V1)
        </h2>

        <div className="rounded-2xl border border-white/12 bg-black/45 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_0_18px_rgba(0,0,0,0.5)]">
          <VaultsPanel />
          <p className="mt-3 text-[11px] text-white/50 leading-snug">
            Vault data is read live from the Base Gold contracts. If you don’t see your positions:
            <span className="block mt-1">
              • Confirm your wallet is connected on{' '}
              <span className="text-[#0AA0FF] font-semibold">Base</span>
            </span>
            <span className="block">
              • Give it a moment to sync — larger wallets or slow networks can take a few seconds
              to display.
            </span>
          </p>
        </div>
      </section>

      {/* ===== Metrics strip ===== */}
      <section className="mb-8">
        <MetricsStrip />
      </section>

      {/* ===== Vault Stats ===== */}
      <section className="mb-10">
        <VaultStats />
      </section>

      {/* ===== Guidance box ===== */}
      <section className="rounded-2xl border border-amber-300/30 bg-black/50 px-6 py-6 mb-12 backdrop-blur shadow-[0_0_24px_rgba(212,175,55,0.08)]">
        <h2 className="text-xl font-semibold text-amber-300 mb-3">
          Vault Management (V1 Mechanics)
        </h2>
        <ul className="space-y-2 text-white/80 text-sm leading-relaxed">
          <li>
            • <span className="text-amber-300 font-semibold">Compound</span> — reinvest vested rewards to grow your position.
            A <span className="font-semibold text-amber-300">1%</span> protocol fee applies and your term restarts.
          </li>
          <li>
            • <span className="text-emerald-300 font-semibold">Withdraw</span> — available at maturity with a
            <span className="text-amber-300 font-semibold"> 2%</span> fee on total principal + vested rewards.
          </li>
          <li>
            • <span className="text-rose-400 font-semibold">Emergency Exit</span> — penalty decays from 
            <span className="text-amber-300 font-semibold"> 10%</span> down to 
            <span className="text-amber-300 font-semibold"> 1%</span>. Only vested rewards are paid.
          </li>
        </ul>
        <p className="mt-4 text-xs text-white/55">
          All vault balances and rewards are fetched directly from your wallet and the Base Gold smart contracts.
          V2 will introduce extended lock ranges and a dynamic APR curve while preserving the onchain transparency
          of this legacy system.
        </p>
      </section>

      {/* ===== CTAs ===== */}
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
            href="/how-it-works"
            className="px-5 py-2.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/5 transition"
          >
            Mechanics / Whitepaper
          </Link>
        </div>
      </section>
    </main>
  );
}
