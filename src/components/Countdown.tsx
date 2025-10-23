"use client";

import { useEffect, useMemo, useState } from "react";

type TL = { days: number; hours: number; minutes: number; seconds: number };

function diffToParts(targetMs: number): TL {
  const now = Date.now();
  const diff = Math.max(0, targetMs - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <div className="text-3xl font-semibold text-amber-300 tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-xs uppercase tracking-widest text-white/60">{label}</div>
    </div>
  );
}

/**
 * Hydration-safe countdown:
 * - Renders only on the client (this file is "use client")
 * - No server-rendered time text at all
 */
export default function Countdown() {
  // Set in .env.local, e.g. NEXT_PUBLIC_GO_LIVE_AT=2025-11-01T17:00:00Z
  const targetIso = process.env.NEXT_PUBLIC_GO_LIVE_AT || "2025-12-01T17:00:00Z";
  const targetMs = useMemo(() => new Date(targetIso).getTime(), [targetIso]);

  const [t, setT] = useState<TL>(() => diffToParts(targetMs));

  useEffect(() => {
    const tick = () => setT(diffToParts(targetMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-3 text-sm uppercase tracking-widest text-white/70">Public Staking Launch</div>
      <div className="grid grid-cols-4 gap-3">
        <TimeBox label="Days" value={t.days} />
        <TimeBox label="Hours" value={t.hours} />
        <TimeBox label="Minutes" value={t.minutes} />
        <TimeBox label="Seconds" value={t.seconds} />
      </div>
      <p className="mt-3 text-xs text-white/60">Target: {new Date(targetMs).toUTCString()}</p>
    </div>
  );
}
