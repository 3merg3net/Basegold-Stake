'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from "next/dynamic";

const Countdown = dynamic(() => import("@/components/Countdown"), { ssr: false });

// Read default from env at build time (ISO string, e.g. 2025-11-01T17:00:00Z)
const ENV_LAUNCH = process.env.NEXT_PUBLIC_LAUNCH_AT || ''; 

function parseDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function useQueryParam(key: string) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    setValue(url.searchParams.get(key));
  }, []);
  return value;
}

function useCountdown(target: Date | null) {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!target) return { done: true, d: 0, h: 0, m: 0, s: 0, totalMs: 0 };
  const totalMs = target.getTime() - now.getTime();
  const done = totalMs <= 0;
  const ms = Math.max(0, totalMs);
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const m = Math.floor((ms / (1000 * 60)) % 60);
  const s = Math.floor((ms / 1000) % 60);
  return { done, d, h, m, s, totalMs: ms };
}

export default function HomePage() {
  // Admin-only UI (for quick demos): /?admin=1
  const isAdmin = useQueryParam('admin') === '1';

  // Determine the initial launch date:
  // 1) local override (if set via admin UI)  2) NEXT_PUBLIC_LAUNCH_AT  3) default +3 days from now
  const localOverride = typeof window !== 'undefined' ? localStorage.getItem('bgld_launch_at') : null;
  const initialTarget =
    parseDate(localOverride) ||
    parseDate(ENV_LAUNCH) ||
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const [target, setTarget] = useState<Date>(initialTarget);
  const { done, d, h, m, s } = useCountdown(target);

  // Admin update handler
  const [newDateStr, setNewDateStr] = useState<string>(target.toISOString().slice(0, 19));
  useEffect(() => {
    // keep input synced if external change
    setNewDateStr(target.toISOString().slice(0, 19));
  }, [target]);

  const onApplyAdminDate = () => {
    // interpret as local time
    const dt = new Date(newDateStr);
    if (!isNaN(dt.getTime())) {
      setTarget(dt);
      localStorage.setItem('bgld_launch_at', dt.toISOString());
    }
  };

  const launchLabel = useMemo(
    () => (done ? 'Public staking is LIVE' : 'Public launch in'),
    [done]
  );

  return (
    <main className="min-h-screen bg-gradient-to-t from-black via-[#0a0a0a] to-black text-white">
      {/* Hero */}
      <section className="text-center py-20 md:py-24 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight"
        >
          Stake Your Claim in <span className="text-gold">Base Gold</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mt-4"
        >
          Earn high-yield ETH rewards by locking your BGLD. Compound to grow your principal and boost future returns.
        </motion.p>

        {/* CTA */}
        <div className="mt-8">
          <Link
            href="/stake"
            className="px-8 py-4 bg-gold text-black font-semibold rounded-2xl hover:bg-gold-light transition"
          >
            Go to Staking
          </Link>
        </div>
      </section>

      {/* Demo Mode Announcement */}
      <section className="px-6 pb-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl w-full bg-black/60 backdrop-blur-md border border-gold/30 rounded-2xl p-6 md:p-8 text-center shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-gold mb-2">🧪 Demo Mode</h2>
          <p className="text-white/80 leading-relaxed">
            Staking is currently running in <span className="font-semibold">demo mode</span>.
            Early access will open for <span className="text-gold font-semibold">whales and select holders</span> first.
            Once stability targets are met, public staking opens for everyone.
          </p>
        </motion.div>
      </section>

      {/* Countdown */}
      <section className="px-6 pb-20 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl w-full rounded-2xl border border-gold/30 bg-black/60 backdrop-blur-md p-6 md:p-8 text-center"
        >
          <div className="text-sm uppercase tracking-widest text-white/60">{launchLabel}</div>

          {!done ? (
            <div className="mx-auto mt-8 max-w-xl">
  <Countdown />
</div>

          ) : (
            <div className="mt-4 text-2xl font-semibold text-gold">
              Start staking now →
              <Link href="/stake" className="underline ml-2">
                /stake
              </Link>
            </div>
          )}

          {/* Admin controls (optional): visit /?admin=1 to show */}
          {isAdmin && (
            <div className="mt-6 text-left border-t border-white/10 pt-4">
              <div className="text-xs uppercase tracking-widest text-white/60 mb-2">Admin Override</div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="datetime-local"
                  value={newDateStr}
                  onChange={(e) => setNewDateStr(e.target.value)}
                  className="flex-1 rounded-xl bg-black/50 border border-white/15 px-3 py-2 outline-none focus:border-gold/60"
                />
                <button
                  onClick={onApplyAdminDate}
                  className="rounded-xl bg-gold text-black font-semibold px-4 py-2 hover:bg-gold-light"
                >
                  Apply
                </button>
                <button
                  onClick={() => { localStorage.removeItem('bgld_launch_at'); location.reload(); }}
                  className="rounded-xl border border-white/15 px-4 py-2 text-white/80 hover:bg-white/5"
                >
                  Clear Override
                </button>
              </div>
              <p className="text-xs text-white/50 mt-2">
                Permanent value comes from <code>NEXT_PUBLIC_LAUNCH_AT</code> in <code>.env.local</code>.
              </p>
            </div>
          )}
        </motion.div>
      </section>
    </main>
  );
}

function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <div className="text-3xl font-semibold text-gold tabular-nums">{String(value).padStart(2, '0')}</div>
      <div className="text-xs uppercase tracking-widest text-white/60 mt-1">{label}</div>
    </div>
  );
}
