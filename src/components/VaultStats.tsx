'use client';

import { motion } from 'framer-motion';
import { useVaultStats } from '@/hooks/useVaultStats';
import { TrendingUp, Flame, Users, Coins } from 'lucide-react';
import Sparkline from '@/components/Sparkline';

const Card = ({
  title, value, sub, icon, chart
}: {
  title: string; value: string; sub?: string; icon: React.ReactNode; chart?: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="relative rounded-2xl border border-gold/25 bg-black/40 backdrop-blur-md p-5 overflow-hidden"
  >
    <div className="absolute -inset-1 opacity-20 blur-2xl"
         style={{ background: 'radial-gradient(400px 120px at 50% -10%, rgba(212,175,55,.25), transparent)' }} />
    <div className="relative flex items-start gap-3">
      <div className="p-2 rounded-xl border border-gold/30 text-gold">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-white/70">{title}</div>
        <div className="text-2xl font-semibold text-gold">{value}</div>
        {sub && <div className="text-xs text-white/60 mt-1">{sub}</div>}
        {chart && <div className="mt-3">{chart}</div>}
      </div>
    </div>
  </motion.div>
);

export default function VaultStats() {
  const { fmt, hist } = useVaultStats();

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card
          title="Vault TVL"
          value={fmt.tvlBgld}
          sub={fmt.tvlUsd + ' est.'}
          icon={<Coins size={18} />}
          chart={<Sparkline data={hist.tvlBgld} filled />}
        />
        <Card
          title="24h Compounded"
          value={fmt.compEth24h}
          sub={fmt.compBgld24h}
          icon={<TrendingUp size={18} />}
          chart={<Sparkline data={hist.compBgld24h} />}
        />
        <Card
          title="Buy Pressure (1h)"
          value={fmt.buyPressure1h}
          sub="ETH→BGLD routed"
          icon={<Flame size={18} />}
          chart={<Sparkline data={hist.buyPressure1h} filled />}
        />
        <Card
          title="Active Miners"
          value={fmt.stakers}
          sub="Stakers in vault"
          icon={<Users size={18} />}
        />
      </div>
    </section>
  );
}
