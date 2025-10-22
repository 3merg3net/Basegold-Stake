// SERVER COMPONENT — no props/typing so it can’t conflict with any PageProps constraint
export const metadata = {
  title: 'Stake – Base Gold',
  description: 'Stake BGLD into the Base Gold vault and start compounding.',
};

import StakeClient from './StakeClient';

export default function StakePage() {
  return <StakeClient />; // client reads ?lock= via useSearchParams
}
