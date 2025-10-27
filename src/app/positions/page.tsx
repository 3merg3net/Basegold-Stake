import type { Metadata } from 'next';
import Link from 'next/link';
import PositionsPanel from '@/components/PositionsPanel';

export const metadata: Metadata = {
  title: 'Vaults · Base Gold',
  description: 'View and manage your staking vaults.',
};

export default function PositionsPage() {
  return (
    <div className="space-y-8">
      {/* Hero / header */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-6 relative overflow-hidden">
        <div
          className="absolute -inset-1 opacity-20 blur-2xl"
          style={{ background: 'radial-gradient(600px 200px at 50% -20%, rgba(212,175,55,.25), transparent)' }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Vaults</h1>
            <p className="text-white/60 mt-1">
              Manage your staked BGLD—compound, add to vaults, emergency exit, and withdraw when mature.
            </p>
          </div>
          <Link
            href="/stake"
            className="rounded-xl bg-gold text-black px-4 py-2 font-semibold hover:bg-[#e6c964]"
          >
            + New Vault
          </Link>
        </div>
      </section>

      {/* The fully-featured panel (renamed to “Vaults” inside the component) */}
      <PositionsPanel />
    </div>
  );
}
