// src/app/stake/page.tsx
import StakeClient from './StakeClient';

export const metadata = {
  title: 'Stake — Base Gold Reserve',
  description:
    'Stake BGLD into the Base Gold Reserve vault to earn auto-compounding rewards. Lock from 1–30 days. Withdraw anytime after the term.',
};

export default function StakePage() {
  return <StakeClient />;
}
