import { NextResponse } from 'next/server';

const POOL = process.env.NEXT_PUBLIC_DEXSCREENER_POOL || '';

export const revalidate = 15; // ISR-ish caching (seconds)

export async function GET() {
  try {
    if (!POOL) return NextResponse.json({ ok: false, error: 'POOL_MISSING' }, { status: 500 });

    const url = `https://api.dexscreener.com/latest/dex/pairs/base/${POOL}`;
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return NextResponse.json({ ok: false, error: 'DEX_HTTP' }, { status: 502 });

    const json = await res.json();
    const pair = json?.pair ?? json?.pairs?.[0] ?? null;
    if (!pair) return NextResponse.json({ ok: false, error: 'PAIR_NOT_FOUND' }, { status: 404 });

    // Normalize what the client needs
    const priceUsd = Number(pair?.priceUsd ?? pair?.price?.usd ?? 0) || null;
    const change24h = Number(pair?.priceChange?.h24 ?? 0);
    const liquidityUsd = Number(pair?.liquidity?.usd ?? 0);
    const volume24h = Number(pair?.volume?.h24 ?? 0);
    const fdv = Number(pair?.fdv ?? 0);

    return NextResponse.json({
      ok: true,
      pool: POOL,
      priceUsd,
      change24h,
      liquidityUsd,
      volume24h,
      fdv,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'SERVER_ERR' }, { status: 500 });
  }
}
