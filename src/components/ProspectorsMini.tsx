'use client';
import { fakeProspectors } from '@/lib/demoData';
export default function ProspectorsMini() {
  return (
    <div className="card">
      <div className="text-sm opacity-80 mb-3">🏆 Top Prospectors</div>
      <ul className="text-sm space-y-1">
        {fakeProspectors.map((m,i)=>(
          <li key={i} className="flex justify-between">
            <span>{i+1}. {m.name}</span>
            <span className="text-yellow-400">{m.bgld.toLocaleString()} BGLD</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
