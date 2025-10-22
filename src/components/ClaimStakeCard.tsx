'use client';
import { useState } from 'react';
import { useActions } from '@/hooks/useActions';

export default function ClaimStakeCard() {
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState(15);
  const { stake, compound } = useActions();

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Stake Claim</h3>
      <label className="text-sm opacity-80">Amount (BGLD)</label>
      <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.0"
        className="mt-1 w-full rounded-lg bg-zinc-900 p-3 outline-none border border-white/10" />
      <div className="mt-4">
        <div className="flex justify-between text-sm opacity-80"><span>Mine Depth</span><span>{days} days</span></div>
        <input type="range" min={1} max={30} value={days} onChange={e=>setDays(parseInt(e.target.value))} className="w-full" />
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={()=>stake(amount, days)} className="rounded-xl bg-yellow-500 px-5 py-3 text-black font-semibold">Stake Claim</button>
        <button onClick={compound} className="rounded-xl border border-yellow-500/40 px-5 py-3 animate-pulseGold">Dig Deeper</button>
      </div>
      <p className="mt-3 text-sm opacity-75">Compounding routes ETH→BGLD via the single UniV3 1% pool and adds to your stake.</p>
    </div>
  );
}
