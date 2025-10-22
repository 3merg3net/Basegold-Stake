// src/lib/constants.ts

export const BGLD_SYMBOL = 'BGLD';
export const BGLD_DECIMALS = 18;

// --- APR curve: 10% at 1 day → 1200% at 30 days ---
export function aprForDays(days: number): number {
  const d = Math.max(1, Math.min(30, Math.round(days)));
  const t = (d - 1) / 29; // 0..1
  const base = 10 * Math.pow(1 + 0.08, d - 1); // ~10 → ~116
  const booster = 1 + 11.0 * Math.pow(t, 2.2); // boosts to ~1200
  const apr = base * booster;
  return Math.min(1200, Math.round(apr));
}

/**
 * Emergency exit principal penalty (% of principal).
 * Max 5% at day 0, decays smoothly to 0% at maturity.
 * Rewards: unvested portion is forfeited separately (handled/displayed in UI/logic).
 */
export function emergencyExitPenaltyPercent(lockDays: number, elapsedDays: number): number {
  const L = Math.max(1, Math.min(30, Math.round(lockDays)));
  const e = Math.max(0, Math.min(L, Math.round(elapsedDays)));
  const progress = e / L; // 0..1
  // Smooth decay: 5% -> 0%
  const pct = 5 * (1 - Math.pow(progress, 0.9));
  return Math.max(0, Math.min(5, Math.round(pct * 10) / 10)); // one decimal
}

/** Vested rewards % (linearly with time) */
export function vestedRewardsPercent(lockDays: number, elapsedDays: number): number {
  const L = Math.max(1, Math.min(30, Math.round(lockDays)));
  const e = Math.max(0, Math.min(L, Math.round(elapsedDays)));
  const progress = (e / L) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

/** Unvested rewards % (forfeited on early exit) */
export function unvestedRewardsPercent(lockDays: number, elapsedDays: number): number {
  return Math.max(0, Math.min(100, 100 - vestedRewardsPercent(lockDays, elapsedDays)));
}

// (optional) simple number formatters
export const formatPct = (v: number) =>
  `${(Number.isFinite(v) ? v : 0).toFixed(v % 1 === 0 ? 0 : 1)}%`;

export const formatUSD = (v: number) => {
  if (!Number.isFinite(v)) return '$0.00';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(2)}k`;
  return `$${v.toFixed(2)}`;
};
