'use client';

import { useEffect, useState } from 'react';

export function useBgldPrice() {
  const [usd, setUsd] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/bgld-price', { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) throw new Error('http');
        const j = await res.json();
        if (mounted) setUsd(typeof j?.usd === 'number' ? j.usd : null);
      } catch {
        if (mounted) setUsd(null);
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return usd; // number | null
}
