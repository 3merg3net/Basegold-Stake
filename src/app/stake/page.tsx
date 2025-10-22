export const metadata = {
  title: 'Stake – Base Gold',
  description: 'Stake BGLD into the Base Gold vault and start compounding.',
};

import StakeClient from './StakeClient';

export default function StakePage({ searchParams }: { searchParams: { lock?: string } }) {
  const initialLock = Number(searchParams?.lock || '0');
  return <StakeClient initialLockDays={initialLock} />;
}
