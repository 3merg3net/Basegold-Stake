'use client';

import MetricsStrip from '@/components/MetricsStrip';

export default function CompactMetricsRibbon() {
  // Just reuse MetricsStrip in a tighter container + subtle chrome
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3 -mt-1 mb-5">
      <MetricsStrip />
    </div>
  );
}
