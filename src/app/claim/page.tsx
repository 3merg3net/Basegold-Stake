import ClaimDashboard from '@/components/ClaimDashboard';
import VaultStats from '@/components/VaultStats';

export const metadata = {
  title: 'Claim Dashboard – Base Gold',
  description: 'Select your staking lock, view APRs, and manage your vault claims.',
};

export default function ClaimPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-darkbg to-black text-white">
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h1 className="text-4xl font-bold text-gold mb-3 text-center">Claim Dashboard</h1>
        <p className="text-center text-gray-300 max-w-2xl mx-auto">
          Choose your lock duration, stake BGLD, and let the vault auto-compound rewards for you.
          You can always toggle manual or automatic compounding on the home page.
        </p>
      </section>

      <VaultStats />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <ClaimDashboard />
      </section>
    </main>
  );
}
