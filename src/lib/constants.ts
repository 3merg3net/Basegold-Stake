// ==== Addresses / Token Settings (replace when wiring) ====
export const BGLD_TOKEN = '0xYourBGLDTokenAddress';    // TODO: replace
export const VAULT_ADDRESS = '0xYourVaultAddress';      // TODO: replace
export const BGLD_DECIMALS = 18;
export const BGLD_SYMBOL = 'BGLD';

// ==== Lock Options (Quick Picks) ====
export const LOCK_OPTIONS = [
  { days: 7 },
  { days: 14 },
  { days: 30 },
];

// ==== APR Model ====
// Requirements: 10% at 1d -> 1200% at 30d.
// We'll use a smooth exponential curve (feels premium vs. simple linear).
// Curve passes exactly through (1d, 10%) and (30d, 1200%).
// APR(d) = a * b^(d - 1), where:
// a = 10; b = (1200 / 10)^(1 / (30 - 1)) = (120)^(1/29)
const APR_BASE = 10; // %
const APR_GROWTH = Math.pow(120, 1 / 29); // ≈ 1.222...

export function aprForDays(days: number): number {
  const d = Math.max(1, Math.min(30, Math.round(days)));
  const apr = APR_BASE * Math.pow(APR_GROWTH, d - 1);
  return Math.round(apr); // whole % looks better in UI
}

// ==== Early Exit Policy ====
// 1) Rewards vest linearly across the lock. Exiting early forfeits ALL unvested rewards.
// 2) Emergency Exit: additional penalty on principal to discourage gaming.
//    Penalty scales with how early you exit: from 90% when exiting immediately,
//    down to 10% when you’re at the very end.
//    penalty% = 10% + 80% * (remaining / total)
export function emergencyExitPenaltyPercent(totalDays: number, elapsedDays: number): number {
  const t = Math.max(1, Math.min(30, Math.round(totalDays)));
  const e = Math.max(0, Math.min(t, Math.round(elapsedDays)));
  const remaining = t - e;
  const ratio = remaining / t; // 1 at start, 0 near end
  const penalty = 10 + 80 * ratio; // 10%..90%
  return Math.round(penalty); // %
}

// Helper: plain number abbreviations
export function abbr(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  return n.toString();
}
