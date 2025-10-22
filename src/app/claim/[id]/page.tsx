// No "use client" here — this is a server component.
// Do NOT import PageProps or any custom Props type.

export const metadata = {
  title: 'Claim Details – Base Gold',
  description: 'View details for a specific claim.',
};

export default function ClaimDetailPage(
  { params }: { params: { id: string } } // <— plain inline type
) {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 text-white">
      <h1 className="text-3xl font-bold text-gold mb-4">Claim #{params.id}</h1>
      <p className="text-white/70">
        This is a placeholder page for a specific claim. Wire it to real data later or remove this route.
      </p>
    </main>
  );
}
