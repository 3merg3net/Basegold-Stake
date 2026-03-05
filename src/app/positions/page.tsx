import VaultsPanel from '@/components/VaultsPanel';
import Link from 'next/link';
import VaultStats from '@/components/VaultStats';
import MetricsStrip from '@/components/MetricsStrip';

export const dynamic = 'force-static';

export default function VaultsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 text-white">
      {/* ===== Header ===== */}
      <header className="text-center mb-7">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-amber-300">
          Your BGLD Reserve Vaults
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base">
          Live staking positions read directly from the Base Gold contracts.
          Withdraw at maturity or exit early if needed — always confirm final values in your wallet.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/stake"
            className="px-5 py-2.5 rounded-xl bg-amber-300 text-black font-semibold hover:bg-[#f1d371] transition"
          >
            Open New Vault
          </Link>
          <Link
            href="/how-it-works"
            className="px-5 py-2.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/5 transition"
          >
            Mechanics / Whitepaper
          </Link>
          <Link
            href="/status"
            className="px-5 py-2.5 rounded-xl border border-amber-300/40 text-amber-200 hover:bg-amber-300/10 transition"
          >
            Protocol Status
          </Link>
        </div>
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
                  V1 vaults remain active and continue vesting as normal. We’re preparing an upgraded
                  V2 vault system with longer lock options and improved controls. You’ll be able to
                  migrate or open new V2 positions when it goes live.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-2 text-[11px] sm:text-xs">
              <Link
                href="/stake"
                className="inline-flex items-center justify-center rounded-xl border border-amber-300/70 bg-amber-300/10 px-3 py-1.5 text-amber-100 font-semibold hover:bg-amber-300/20 transition"
              >
                Open Stake
              </Link>
              <span className="text-[10px] text-amber-100/70 text-left sm:text-right">
                Migration details will be announced before launch.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Vaults ===== */}
      <section className="mb-10">
        <div className="flex items-end justify-between gap-3 mb-3">
          <h2 className="text-xl font-semibold text-amber-200">
            Your Active Positions (V1)
          </h2>
          <Link
            href="/stake"
            className="text-xs text-amber-200/80 hover:text-amber-200 underline underline-offset-4"
          >
            + Open another vault
          </Link>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/45 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_0_18px_rgba(0,0,0,0.5)]">
          <VaultsPanel />

          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
            <div className="text-[11px] font-semibold text-white/70">
              Not seeing your vaults?
            </div>
            <ul className="mt-1 text-[11px] text-white/55 leading-snug space-y-1">
              <li>
                • Confirm your wallet is connected on{' '}
                <span className="text-[#0AA0FF] font-semibold">Base</span>
              </li>
              <li>• Give it a moment to sync (some wallets take a few seconds)</li>
              <li>• If your wallet fails to estimate gas, try MetaMask/Coinbase Wallet</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Mechanics (tight + no compound language) ===== */}
      <section className="rounded-2xl border border-amber-300/30 bg-black/50 px-6 py-6 mb-10 backdrop-blur shadow-[0_0_24px_rgba(212,175,55,0.08)]">
        <h2 className="text-lg font-semibold text-amber-300 mb-3">
          Withdraw & Exit Rules (V1)
        </h2>
        <ul className="space-y-2 text-white/80 text-sm leading-relaxed">
          <li>
            • <span className="text-emerald-300 font-semibold">Withdraw at Maturity</span> — available when the lock
            completes. A <span className="text-amber-300 font-semibold">2%</span> fee applies on principal + vested
            rewards.
          </li>
          <li>
            • <span className="text-rose-400 font-semibold">Emergency Exit</span> — exit early with a penalty that
            decays from <span className="text-amber-300 font-semibold">10%</span> down to{' '}
            <span className="text-amber-300 font-semibold">1%</span> as maturity approaches.
          </li>
        </ul>
        <p className="mt-4 text-xs text-white/55">
          All balances and rewards are fetched directly from your wallet and the Base Gold smart contracts.
          Always verify the final amounts shown in your wallet before confirming.
        </p>
      </section>

      {/* ===== Metrics strip ===== */}
      <section className="mb-8">
        <MetricsStrip />
      </section>

      {/* ===== Vault Stats ===== */}
      <section className="mb-6">
        <VaultStats />
      </section>

      {/* ===== Footer CTA ===== */}
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
        </div>
      </section>
    </main>
  );
}