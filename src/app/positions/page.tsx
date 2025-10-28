'use client';

import PositionsPanel from '@/components/PositionsPanel';

export default function PositionsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-black text-white">
      <div className="w-full max-w-6xl px-4 pt-8 pb-24">
        <div className="flex flex-col items-start space-y-2 mb-6">
          <h1 className="text-3xl font-semibold text-gold tracking-wide">Your Vaults</h1>
          <p className="text-sm text-white/70">
            Manage your active Base Gold vaults — compound, withdraw, or enable auto-compounding.
          </p>
        </div>

        <PositionsPanel />
      </div>
    </main>
  );
}
