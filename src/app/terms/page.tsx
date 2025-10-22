// src/app/terms/page.tsx

export const metadata = {
  title: 'Terms — Base Gold',
  description:
    'Plain-English terms for staking BGLD on Base Gold: vesting, emergency exit, and basic risks.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-darkbg to-black text-white">
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gold">Terms</h1>
        <p className="mt-2 text-sm text-white/60">Last updated: {formatDate('2025-10-21')}</p>
      </section>

      {/* One calm, clear disclaimer */}
      <section className="max-w-3xl mx-auto px-6 pb-4">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <p className="text-white/80 text-sm leading-relaxed">
            Staking {`BGLD`} is an on-chain activity. By using the app, you accept smart-contract and market risks and
            agree to the terms below. This is not financial, legal, or tax advice. Always do your own research and only
            stake what you can hold through your selected lock.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-5">
        <Card title="1) Staking & Locks">
          <ul className="list-disc ml-5 space-y-2 text-white/80 text-sm">
            <li>
              You can select a lock from <span className="font-semibold">1–30 days</span> (quick picks include 1, 7, 10,
              14, 21, and 30 days).
            </li>
            <li>
              While locked, your position earns ETH-denominated rewards that are applied to your staked principal when
              you compound (automatically or manually), increasing your balance for future yield.
            </li>
            <li>
              APR scales with lock length. The app shows current estimates (e.g., up to{' '}
              <span className="font-semibold text-gold">1200%</span> at 30 days). Rates are variable and not
              guaranteed.
            </li>
          </ul>
        </Card>

        <Card title="2) Compounding">
          <ul className="list-disc ml-5 space-y-2 text-white/80 text-sm">
            <li>
              Compounding applies earned rewards to your staked principal by converting them into additional {`BGLD`}
              and adding that amount to your existing position.
            </li>
            <li>
              You may enable auto-compound or compound manually at your discretion. Compounding frequency and network
              conditions can affect realized results.
            </li>
          </ul>
        </Card>

        <Card title="3) Vesting & Early Exit">
          <ul className="list-disc ml-5 space-y-2 text-white/80 text-sm">
            <li>
              Rewards vest <span className="font-semibold">linearly</span> over your selected lock period.
            </li>
            <li>
              If you use <span className="font-semibold">Emergency Exit</span> before maturity, unvested rewards are
              forfeited.
            </li>
            <li>
              A small principal penalty applies on early exit: it starts at{' '}
              <span className="font-semibold">5%</span> on day 0 and decays smoothly to{' '}
              <span className="font-semibold">0%</span> at maturity.
            </li>
          </ul>
        </Card>

        <Card title="4) Withdrawals">
          <ul className="list-disc ml-5 space-y-2 text-white/80 text-sm">
            <li>At maturity, you can withdraw your staked balance without penalty.</li>
            <li>
              If you exit early, the Emergency Exit flow will calculate any unvested-reward forfeiture and principal
              penalty at that time before releasing your {`BGLD`}.
            </li>
          </ul>
        </Card>

        <Card title="5) Fees, Networks & Availability">
          <ul className="list-disc ml-5 space-y-2 text-white/80 text-sm">
            <li>Transactions require gas. You are responsible for network fees on Base.</li>
            <li>
              The app and contracts operate on a public blockchain and may depend on external services (RPCs, indexers)
              that can experience congestion or downtime.
            </li>
            <li>
              Operational details (like routing and liquidity) are handled automatically so staking stays simple. No
              user action is required beyond staking, compounding, and withdrawing.
            </li>
          </ul>
        </Card>

        <Card title="6) Smart-Contract & Market Risk">
          <ul className="list-disc ml-5 space-y-2 text-white/80 text-sm">
            <li>
              Smart contracts can contain bugs or be upgraded. We aim for safe defaults and clear communication, but
              on-chain actions are final.
            </li>
            <li>
              Token prices can be volatile. APRs and outcomes are variable and may differ from projections shown in the
              UI.
            </li>
          </ul>
        </Card>

        <Card title="7) Policy Changes">
          <ul className="list-disc ml-5 space-y-2 text-white/80 text-sm">
            <li>
              Parameters (e.g., compounding cadence, reward routing, emergency-exit curve) may be adjusted over time to
              improve reliability and user outcomes. Any meaningful updates will be reflected in the app and this page.
            </li>
          </ul>
        </Card>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/70">
          Questions? Read{' '}
          <a className="underline text-gold" href="/how-it-works">
            How it works
          </a>{' '}
          or the{' '}
          <a className="underline text-gold" href="/how-to">
            How to stake
          </a>{' '}
          guide. For support, reach out on our official channels.
        </div>
      </section>
    </main>
  );
}

/* ---------- helpers ---------- */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gold/20 bg-black/40 p-5">
      <h2 className="text-lg font-semibold text-gold">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}
