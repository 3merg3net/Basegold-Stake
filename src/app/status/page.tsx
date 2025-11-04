// src/app/status/page.tsx
import StatusClient from '@/components/StatusClient';

export const metadata = {
  title: 'Protocol Status | Base Gold Reserve',
  description: 'Live health metrics of the BGLD staking protocol on Base.',
};

export default function Page() {
  return <StatusClient />;
}
