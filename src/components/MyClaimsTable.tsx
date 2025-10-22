'use client';
import { fakeClaims } from '@/lib/demoData';

export default function MyClaimsTable() {
  return (
    <div className="card">
      <div className="text-sm opacity-80 mb-2">📜 My Claims</div>
      <table className="w-full text-sm">
        <thead className="text-yellow-300/80">
          <tr className="text-left">
            <th>ID</th><th>Depth</th><th>Staked</th><th>Gold Dust (ETH)</th>
          </tr>
        </thead>
        <tbody>
          {fakeClaims.map(c=>(
            <tr key={c.id} className="border-t border-white/5">
              <td className="py-1">#{c.id}</td>
              <td>{c.depth}d</td>
              <td>{c.amount.toLocaleString()}</td>
              <td>{c.goldDust}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
