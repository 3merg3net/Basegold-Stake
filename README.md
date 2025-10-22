# Base Gold – Stake Your Claim (Frontend)

Next.js App Router scaffold for `stake.basereserve.gold` with demo/live toggle.
Includes your Base Gold logo (place it at /public/logo.png).

## Quick start
```powershell
cd C:\projects\basegold-stake
npm install --legacy-peer-deps
npm run dev
```
Open http://localhost:3000

## Demo/Live toggle
In `.env.local`:
```
NEXT_PUBLIC_DEMO=true  # demo mode (default)
```
Switch to live by setting `NEXT_PUBLIC_DEMO=false` and filling addresses in `.env.example`.
