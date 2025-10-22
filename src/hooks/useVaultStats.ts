'use client';

import { useEffect, useMemo, useState } from 'react';

type Stats = {
  tvlBgld: number;
  tvlUsd: number;
  compEth24h: number;
  compBgld24h: number;
  buyPressure1h: number;
  stakers: number;
};

const DEMO = true;
const HISTORY_LEN = 32;

export function useVaultStats() {
  const [stats, setStats] = useState<Stats>({
    tvlBgld: 1_250_000,
    tvlUsd: 420_000,
    compEth24h: 18.4,
    compBgld24h: 1_320_000,
    buyPressure1h: 86_000,
    stakers: 523,
  });

  // sparkline histories
  const [hist, setHist] = useState({
    tvlBgld: seed(stats.tvlBgld),
    compBgld24h: seed(stats.compBgld24h),
    buyPressure1h: seed(stats.buyPressure1h),
  });

  useEffect(() => {
    if (!DEMO) return;
    const id = setInterval(() => {
      setStats(s => {
        const dEth = +(Math.random() * 0.35 + 0.05).toFixed(2);
        const dBgld = Math.floor(dEth * (70000 + Math.random() * 100000));
        const _next = {
          tvlBgld: s.tvlBgld + Math.floor(dBgld * 0.05),
          tvlUsd: +(s.tvlUsd + dEth * 3000).toFixed(0),
          compEth24h: +(s.compEth24h + dEth).toFixed(2),
          compBgld24h: s.compBgld24h + dBgld,
          buyPressure1h: Math.max(0, s.buyPressure1h + Math.floor(dBgld * (Math.random() > 0.55 ? 1 : -0.45))),
          stakers: s.stakers + (Math.random() > 0.92 ? 1 : 0),
        };
        setHist(h => ({
          tvlBgld: pushLimited(h.tvlBgld, _next.tvlBgld),
          compBgld24h: pushLimited(h.compBgld24h, _next.compBgld24h),
          buyPressure1h: pushLimited(h.buyPressure1h, _next.buyPressure1h),
        }));
        return _next;
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const fmt = useMemo(() => ({
    tvlBgld: abbr(stats.tvlBgld),
    tvlUsd: `$${abbr(stats.tvlUsd)}`,
    compEth24h: `${stats.compEth24h.toFixed(2)} ETH`,
    compBgld24h: abbr(stats.compBgld24h) + ' BGLD',
    buyPressure1h: abbr(stats.buyPressure1h) + ' BGLD',
    stakers: stats.stakers.toLocaleString(),
  }), [stats]);

  return { stats, fmt, hist };
}

function abbr(n: number) {
  if (n >= 1_000_000_000) return (n/1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return (n/1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n/1_000).toFixed(2) + 'K';
  return n.toString();
}
function seed(v: number) {
  // create slight random walk for initial sparkline
  const arr = [v];
  for (let i = 1; i < HISTORY_LEN; i++) {
    const last = arr[i - 1];
    const delta = (Math.random() - 0.4) * (v * 0.01);
    arr.push(Math.max(0, last + delta));
  }
  return arr;
}
function pushLimited(arr: number[], v: number) {
  const next = [...arr, v];
  if (next.length > HISTORY_LEN) next.shift();
  return next;
}
