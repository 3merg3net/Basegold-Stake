'use client';

import PositionsPanel from '@/components/PositionsPanel';

export default function ClaimDashboardPage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-semibold mb-6">Claim & Manage Vaults</h1>
      <p className="text-white/80 mb-6">
        View all your active vaults. Withdraw at maturity, compound to grow principal, toggle auto-compound, or use emergency exit if needed.
      </p>
      <PositionsPanel />
    </main>
  );
}
