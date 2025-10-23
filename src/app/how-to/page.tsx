// src/app/how-to/page.tsx

export const metadata = {
  title: 'How to stake — Base Gold',
  description: 'Step-by-step guide to staking, compounding, and exiting on Base Gold.',
};

export default function HowToPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-darkbg to-black text-white">
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gold">How to stake</h1>
        <p className="mt-3 text-white/80">
          A quick walkthrough to help you stake confidently. Clear steps—no technical clutter.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20 space-y-5">
        <Step
          n="1"
          title="Connect your wallet"
          body={
            <>
              Click <span className="text-gold font-semibold">Connect</span> in the header and select your wallet.
              Ensure you’re connected to the <span className="font-semibold">Base</span> network.
            </>
          }
          cta={{ href: '/', label: 'Go Home' }}
        />

        <Step
          n="2"
          title="Approve BGLD"
          body={
            <>
              On the <a className="underline text-gold" href="/stake">Stake</a> page, enter how much you want to stake
              and click <span className="font-semibold">Approve</span>. This allows the staking contract to interact with
              your tokens—no funds move until you confirm your stake.
            </>
          }
          cta={{ href: '/stake', label: 'Open Stake' }}
        />

        <Step
          n="3"
          title="Choose your lock"
          body={
            <>
              Select a preset (<span className="font-semibold">1, 7, 10, 14, 21, or 30</span> days) or use the slider.
              Longer locks earn higher APRs, up to <span className="text-gold font-semibold">1200%</span> for 30 days.
            </>
          }
        />

        <Step
          n="4"
          title="Stake"
          body={
            <>
              Click <span className="font-semibold">Stake</span> and confirm in your wallet. Your BGLD becomes staked and
              begins earning ETH rewards immediately.
            </>
          }
        />

        <Step
          n="5"
          title="Compounding"
          body={
            <>
              Each compound event applies your earned rewards directly to your staked principal, increasing your balance
              and the rate at which you earn future rewards. You can keep compounding automatic or trigger it manually.
            </>
          }
          cta={{ href: '/', label: 'Compound from Home' }}
        />

        <Step
          n="6"
          title="Withdrawing"
          body={
            <>
              When your lock period ends, withdraw normally. If you exit early, unvested rewards are forfeited and a
              small principal penalty applies—<span className="font-semibold">5%</span> at day 0, decaying to{' '}
              <span className="font-semibold">0%</span> at maturity.
            </>
          }
          cta={{ href: '/terms', label: 'Read Terms' }}
        />

        {/* Tips */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <h2 className="text-lg font-semibold text-gold">Tips</h2>
          <ul className="mt-2 space-y-2 text-sm text-white/80">
            <li>Start small to learn the flow, then scale your stake.</li>
            <li>Longer locks earn higher APR—pick what fits your comfort level.</li>
            <li>Compounding regularly accelerates your yield growth.</li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <h2 className="text-lg font-semibold text-gold">FAQ</h2>
          <div className="mt-3 space-y-3 text-sm text-white/80">
            <Q
              q="Do I need to manage liquidity or pools?"
              a="No. Liquidity and reward routing are handled automatically. You just stake, compound, and withdraw."
            />
            <Q
              q="Will my APR change?"
              a="APR depends on your chosen lock duration. Operational factors are balanced automatically—no action required."
            />
            <Q
              q="What happens if I exit early?"
              a="You can use Emergency Exit anytime. A percentage of unvested rewards are forfeited and a small principal penalty applies, determined by how early you exit (5%→0%)."
            />
            <Q
              q="Where can I see system health?"
              a={<span>Visit the <a className="underline text-gold" href="/status">Vault Health</a> page.</span>}
            />
          </div>
        </div>

        <div className="text-center">
          <a
            href="/stake"
            className="inline-flex items-center justify-center rounded-xl border border-gold/30 bg-gold text-black font-semibold px-6 py-3 hover:bg-[#e6c964]"
          >
            Start Staking
          </a>
        </div>
      </section>
    </main>
  );
}

/* --- internal small components --- */
function Step({
  n,
  title,
  body,
  cta,
}: {
  n: string;
  title: string;
  body: React.ReactNode;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="rounded-2xl border border-gold/20 bg-black/40 p-5">
      <div className="flex items-start gap-4">
        <div className="h-9 w-9 shrink-0 rounded-full border border-gold/40 bg-black/50 text-gold grid place-content-center font-semibold">
          {n}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gold">{title}</h2>
          <div className="text-sm text-white/80 mt-1">{body}</div>
          {cta && (
            <div className="mt-3">
              <a
                href={cta.href}
                className="inline-flex items-center justify-center rounded-lg border border-gold/30 text-gold px-3 py-2 hover:bg-black/40"
              >
                {cta.label}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Q({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <div>
      <div className="font-semibold text-white">{q}</div>
      <div className="text-white/80 mt-1">{a}</div>
    </div>
  );
}
