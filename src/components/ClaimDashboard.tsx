'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { aprForDays } from '@/lib/constants';

// Updated set: 1, 7, 10, 14, 21, 30
const LOCKS = [1, 7, 10, 14, 21, 30];

export default function ClaimDashboard() {
  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gold">Choose Your Lock</h2>
        <p className="text-sm text-white/70">
          APR scales from <span className="text-gold font-semibold">10%</span> at 1 day to{' '}
          <span className="text-gold font-semibold">1200%</span> at 30 days.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 p-6 rounded-2xl bg-gradient-to-t from-darkbg via-black to-darkbg border border-gold/20">
        {LOCKS.map((days, i) => (
          <motion.div
            key={days}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.24) }}
            className={`p-6 rounded-2xl border bg-black/40 backdrop-blur-md hover:scale-[1.02] transition
              ${[7, 10, 14, 21, 30].includes(days) ? 'border-gold/60 shadow-gold' : 'border-gold/25'}`}
          >
            <h3 className="text-2xl font-bold text-gold mb-2">{days}-Day Lock</h3>
            <p className="text-gray-400 mb-4">Fixed lock duration • Rewards vest linearly.</p>
            <p className="text-3xl font-bold text-gold mb-6">{aprForDays(days)}% APR</p>

            <Link
              href={`/stake?lock=${days}`}
              className="w-full inline-flex items-center justify-center px-6 py-2 bg-gold text-black font-semibold rounded-xl hover:bg-gold-light active:scale-95 transition"
            >
              Stake {days}d
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed">
        <div className="font-semibold text-gold mb-1">Vesting & Early Exit</div>
        <ul className="list-disc ml-5 space-y-1 text-white/80">
          <li>Rewards vest <strong>linearly</strong> across the selected lock.</li>
          <li>Exiting early forfeits all <strong>unvested</strong> rewards.</li>
          <li>Emergency Exit is available with a principal penalty that decreases as you approach maturity.</li>
        </ul>
        <p className="mt-2 text-xs text-white/60">
          By staking you agree to the <a href="/terms" className="underline text-gold">Terms of Use</a>.
        </p>
      </div>
    </section>
  );
}
