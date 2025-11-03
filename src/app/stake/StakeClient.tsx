'use client';

import StakeForm from '@/components/StakeForm';

import PositionsPanel from '@/components/PositionsPanel';

type Props = {
  initialLockDays?: number;
};

export default function StakeClient({ initialLockDays = 7 }: Props) {
  return (
    <div className="space-y-10">
      <section className="max-w-3xl mx-auto px-4 pb-6">
        <StakeForm initialLockDays={initialLockDays} />
      </section>
      <section className="max-w-3xl mx-auto px-4 pb-4">
  <h1 className="text-2xl font-semibold text-amber-200 mb-3">Stake BGLD</h1>
  <p className="text-sm text-white/70 leading-relaxed mb-6">
    Lock your BGLD tokens in a vault to earn daily rewards. 
    Choose your staking duration — longer terms offer higher APRs.
    Rewards automatically accrue every block and can be compounded or withdrawn anytime 
    after your lock period ends.
  </p>
</section>


      {/* Restore the working “Your Vaults” panel under the Stake form */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <PositionsPanel />
      </section>
    </div>
  );
}
