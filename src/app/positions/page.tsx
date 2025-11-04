import VaultsPanel from '@/components/VaultsPanel';

export const dynamic = 'force-static';

export default function VaultsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-amber-200 mb-3">
        Your BGLD Vaults
      </h1>

      <div className="text-sm text-white/70 leading-relaxed mb-8 space-y-2">
        <p>
          Here you can view and manage all of your active staking vaults. 
          Each vault represents a time-locked stake of your BGLD tokens earning passive yield.
        </p>
        <p>
          Use the <span className="text-amber-300 font-medium">Compound</span> button 
          to add your pending rewards back into the vault, 
          <span className="text-emerald-300 font-medium">Withdraw</span> when your term ends, 
          or <span className="text-rose-400 font-medium">Emergency Exit</span> if you need 
          early access (fees apply).
        </p>
        <p>
          Vaults automatically update after each transaction, and all data is read directly 
          from the Base chain.
        </p>
      </div>

      {/* Identical look and functionality to Stake page */}
      <VaultsPanel />
    </main>
  );
}
