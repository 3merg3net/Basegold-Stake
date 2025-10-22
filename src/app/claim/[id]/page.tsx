// @ts-nocheck
// Server component. No types imported. No "use client".

export const metadata = {
  title: 'Claim Details – Base Gold',
  description: 'View details for a specific claim.',
};

export default function ClaimDetailPage(props) {
  const { params } = props || {};
  const id = params?.id ?? '—';
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 text-white">
      <h1 className="text-3xl font-bold text-gold mb-4">Claim #{id}</h1>
      <p className="text-white/70">
        Placeholder route. Wire to real claim data later.
      </p>
    </main>
  );
}
