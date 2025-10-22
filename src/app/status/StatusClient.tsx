'use client';

import { useEffect, useMemo, useState } from 'react';
import VaultStats from '@/components/VaultStats';
import Sparkline from '@/components/Sparkline';
import { CheckCircle2, AlertTriangle, RefreshCcw, Link as LinkIcon } from 'lucide-react';

type Health = 'up' | 'degraded' | 'down';

export default function StatusClient() {
  // Demo heartbeat
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [health, setHealth] = useState<Health>('up');
  const [latencyMs, setLatencyMs] = useState<number>(120 + Math.round(Math.random() * 60));
  const [blocks, setBlocks] = useState<number[]>(() => seedLine(32, 10, 30));

  const statusColor = useMemo(() => {
    if (health === 'up') return 'text-emerald-400';
    if (health === 'degraded') return 'text-yellow-400';
    return 'text-red-400';
  }, [health]);

  useEffect(() => {
    const id = setInterval(() => {
      setLatencyMs(v => Math.max(80, Math.min(300, v + (Math.random() - 0.5) * 30)));
      setBlocks(b => pushLimited(b, b.at(-1)! + Math.round(Math.random() * 2)));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const refresh = () => {
    setLastUpdated(new Date());
    setHealth(Math.random() > 0.06 ? 'up' : 'degraded');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-darkbg to-black text-white">
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gold mb-1">Status</h1>
            <div className="text-sm text-gray-400">
              Last updated: <span className="text-white/80">{lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="flex items-center gap-2 rounded-xl border border-gold/30 bg-black/40 px-4 py-2 hover:bg-black/60"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
            <a
              href="https://basescan.org"
              target="_blank"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-4 py-2 hover:bg-black/60"
            >
              <LinkIcon size={16} /> Basescan
            </a>
          </div>
        </div>

        {/* Health cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          <Card title="Vault Health" value={<HealthBadge health={health} />} />
          <Card title="API Latency" value={<span className="text-white">{Math.round(latencyMs)} ms</span>} />
          <Card
            title="Recent Blocks"
            value={
              <div className="flex items-center gap-3">
                <span className="text-white">Base</span>
                <Sparkline data={blocks} width={120} height={32} />
              </div>
            }
          />
        </div>
      </section>

      <VaultStats />

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold text-gold mb-4">Notes</h2>
        <ul className="list-disc ml-6 text-gray-300 leading-relaxed">
          <li>All compounding and staking actions are executed on-chain and visible on Basescan.</li>
          <li>During heavy network load, compounding latency can increase due to gas conditions.</li>
          <li>Auto-compound can be toggled off at any time; manual compounding remains available.</li>
        </ul>
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-gold/25 bg-black/40 backdrop-blur-md p-5 overflow-hidden">
      <div className="absolute -inset-1 opacity-20 blur-2xl"
           style={{ background: 'radial-gradient(400px 120px at 50% -10%, rgba(212,175,55,.25), transparent)' }} />
      <div className="relative">
        <div className="text-sm text-white/70 mb-1">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

function HealthBadge({ health }: { health: 'up' | 'degraded' | 'down' }) {
  if (health === 'up') {
    return <span className="inline-flex items-center gap-2 text-emerald-400"><CheckCircle2 size={16} /> Operational</span>;
  }
  if (health === 'degraded') {
    return <span className="inline-flex items-center gap-2 text-yellow-400"><AlertTriangle size={16} /> Degraded</span>;
  }
  return <span className="inline-flex items-center gap-2 text-red-400"><AlertTriangle size={16} /> Partial Outage</span>;
}

// demo helpers
function seedLine(n: number, start = 10, step = 20) {
  const arr = [start];
  for (let i = 1; i < n; i++) arr.push(arr[i-1] + Math.round(Math.random() * step));
  return arr;
}
function pushLimited(arr: number[], v: number) {
  const next = [...arr, v]; if (next.length > 32) next.shift(); return next;
}
