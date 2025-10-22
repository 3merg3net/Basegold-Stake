'use client';
import { useEffect, useState } from 'react';
import { simulateBuyPressure } from '@/lib/demoData';

export default function BuyPressureFeed() {
  const [events, setEvents] = useState<{eth:string,bgld:number,time:string}[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const e = simulateBuyPressure();
      setEvents(prev => [e, ...prev.slice(0, 6)]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card">
      <div className="text-sm opacity-80 mb-2">⛏️ Buy Pressure Feed</div>
      <ul className="text-sm space-y-1 min-h-[80px]">
        {events.map((e,i)=>(
          <li key={i} className="text-yellow-300/90">
            {e.time}: {e.eth} ETH → {e.bgld.toLocaleString()} BGLD bought
          </li>
        ))}
      </ul>
    </div>
  );
}
