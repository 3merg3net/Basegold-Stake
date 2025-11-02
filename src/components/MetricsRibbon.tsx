'use client';

import MetricsStrip from './MetricsStrip';

export default function MetricsRibbon() {
  return (
    <div className="sticky top-[64px] z-20 mb-4">
      <MetricsStrip className="bg-black/60 backdrop-blur border-white/15" />
    </div>
  );
}
