'use client';

import StakeForm from '@/components/StakeForm';
import PositionsPanel from '@/components/PositionsPanel';
import MetricsStrip from '@/components/MetricsStrip';

export default function StakePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT: Stake form + vault metrics */}
      <div className="space-y-6">
        <StakeForm initialLockDays={14} />
        <MetricsStrip showYourCount className="shadow-sm" />
      </div>

      {/* RIGHT: Vault management */}
      <div>
        <PositionsPanel />
      </div>
    </div>
  );
}
