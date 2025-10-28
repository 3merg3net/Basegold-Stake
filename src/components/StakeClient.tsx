'use client';

import { useStaking } from '@/hooks/useStaking';
import { formatUnits } from 'viem';
import Link from 'next/link';

export default function StakeClient() {
  const {
    isConnected, chainId, address,
    amount, setAmount,
    days, setDays,
    auto, setAuto,
    balance, allowance,
    ids,
    needApproval, approve, stake,
    isPending, txHash,
  } = useStaking();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Stake form */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
        <h2 className="text-xl font-semibold">Stake BGLD (Sepolia)</h2>
        <p className="text-white/70 text-sm mt-1">
          Chain ID: {chainId ?? '—'} {isConnected ? '• connected' : '• connect wallet'}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-white/70">Amount (BGLD)</span>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="mt-1 text-xs text-white/60">
              Balance: {balance !== undefined ? Number(formatUnits(balance, 18)).toLocaleString() : '—'}
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Lock Days</span>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-2 w-full"
            />
            <div className="mt-1 text-xs text-white/60">Selected: {days} day(s)</div>
          </label>

          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
            <span className="text-sm text-white/80">Auto-compound rewards</span>
          </label>

          <div className="mt-4 flex gap-3">
            {needApproval ? (
              <button
                onClick={approve}
                disabled={isPending}
                className="rounded-lg bg-amber-400/90 px-4 py-2 text-black font-semibold hover:bg-amber-300 disabled:opacity-60"
              >
                {isPending ? 'Approving…' : 'Approve BGLD'}
              </button>
            ) : (
              <button
                onClick={stake}
                disabled={isPending}
                className="rounded-lg bg-amber-400/90 px-4 py-2 text-black font-semibold hover:bg-amber-300 disabled:opacity-60"
              >
                {isPending ? 'Staking…' : 'Stake'}
              </button>
            )}

            {txHash && (
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
              >
                View Tx
              </a>
            )}
          </div>

          <div className="mt-3 text-xs text-white/60">
            Allowance: {allowance !== undefined ? Number(formatUnits(allowance, 18)).toLocaleString() : '—'}
          </div>
        </div>
      </div>

      {/* Quick status */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
        <h3 className="text-lg font-semibold">Your Positions</h3>
        <p className="text-sm text-white/70 mt-1">Found: {ids.length}</p>

        <div className="mt-4 space-y-2">
          {ids.length === 0 ? (
            <div className="text-white/60 text-sm">
              No positions yet. After staking, check the <Link href="/positions" className="underline">Positions</Link> page for details.
            </div>
          ) : (
            <ul className="list-disc pl-5 text-sm text-white/80">
              {ids.map((id) => (
                <li key={id.toString()}>Position #{id.toString()} — <Link href="/positions" className="underline">view</Link></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
