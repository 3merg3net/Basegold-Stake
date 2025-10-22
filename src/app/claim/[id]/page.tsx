type Props = { params: { id: string } };
export default function ClaimId({ params }: Props) {
  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Claim ID {params.id}</h2>
      <div className="card">
        <div className="grid md:grid-cols-3 gap-6">
          <div><div className="text-sm opacity-70">Staked</div><div className="text-2xl font-semibold">— BGLD</div></div>
          <div><div className="text-sm opacity-70">Depth</div><div className="text-2xl font-semibold">— days</div></div>
          <div><div className="text-sm opacity-70">Gold Dust (ETH)</div><div className="text-2xl font-semibold">—</div></div>
        </div>
        <div className="mt-6 h-2 w-full rounded bg-white/10 overflow-hidden">
          <div className="h-full bg-yellow-500 w-1/3" />
        </div>
        <div className="mt-6 flex gap-3">
          <button className="rounded-xl bg-zinc-800 px-4 py-2">Expand Claim</button>
          <button className="rounded-xl bg-yellow-500 px-4 py-2 text-black">Smelt Rewards</button>
          <button className="rounded-xl bg-red-600/80 px-4 py-2">Abandon Claim</button>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 p-6">
        <div className="font-semibold mb-2">History</div>
        <ul className="space-y-2 opacity-90 text-sm"><li>—</li></ul>
      </div>
    </div>
  );
}
