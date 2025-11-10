// app/api/gold/route.ts
import { NextResponse } from 'next/server';

const CHAIN = 'base';

function num(x: any): number | 0 {
  const n = Number(x);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function GET() {
  const pair = (process.env.NEXT_PUBLIC_DEXSCREENER_POOL || '').trim();
  const token = (process.env.NEXT_PUBLIC_BGLD_ADDRESS || process.env.NEXT_PUBLIC_BGLD_CA || '').trim();

  let usd = 0;

  try {
    if (pair) {
      const r = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${CHAIN}/${pair}`, { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        const p = j?.pair?.priceUsd ?? j?.pairs?.[0]?.priceUsd;
        usd = num(p);
      }
    }

    if (!usd && token) {
      const r2 = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`, { cache: 'no-store' });
      if (r2.ok) {
        const j2 = await r2.json();
        const pairs: any[] = Array.isArray(j2?.pairs) ? j2.pairs : [];
        // Prefer Base chain pairs with priceUsd
        const basePairs = pairs.filter(p => (p?.chainId === CHAIN || p?.chainId === 'base') && num(p?.priceUsd));
        const best = basePairs[0] || pairs.find(p => num(p?.priceUsd)) || null;
        usd = best ? num(best.priceUsd) : 0;
      }
    }
  } catch (_) {
    // swallow, will return 0 below
  }

  // Final JSON (always return a shape)
  return NextResponse.json(
    { usd, source: 'dexscreener' },
    {
      headers: {
        // let the browser re-fetch frequently in dev/prod
        'Cache-Control': 'no-store',
      },
    }
  );
}
