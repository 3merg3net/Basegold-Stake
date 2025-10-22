// SERVER COMPONENT — ok to export metadata here
export const metadata = {
  title: 'Status – Base Gold',
  description: 'Current vault health, compounding activity, and network indicators.',
};

import StatusClient from './StatusClient';

export default function StatusPage() {
  return <StatusClient />;
}
