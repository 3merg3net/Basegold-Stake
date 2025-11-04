// src/app/api/bgld-price/route.ts
import { NextResponse } from 'next/server';

/**
 * Returns { usd: number | null }
 * Source: Dexscreener pairs endpoint for Base
 * Requires: NEXT_PUBLIC_BGLD_POOL (Uniswap V3 pool address on Base)
 */
export async function GET() {
  const pool = (process.env.NEXT_PUBLIC_BGLD_POOL || '').trim();
  if (!pool) {
    return NextResponse.json({ usd: null }, { status: 200 });
  }

  const url = `https://api.dexscreener.com/latest/dex/pairs/base/${pool}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(id);
    if (!res.ok) return NextResponse.json({ usd: null }, { status: 200 });

    const j = await res.json();
    // Dexscreener returns { pairs: [ { priceUsd: "..." }, ... ] }
    const p = Number(j?.pairs?.[0]?.priceUsd);
    if (Number.isFinite(p) && p > 0) {
      return NextResponse.json({ usd: p }, { status: 200 });
    }
    return NextResponse.json({ usd: null }, { status: 200 });
  } catch {
    clearTimeout(id);
    return NextResponse.json({ usd: null }, { status: 200 });
  }
}
