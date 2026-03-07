export const metadata = {
  title: 'Terms — Base Gold Reserve',
  description:
    'Terms of use for the Base Gold Reserve protocol interface and legacy V1 vault system.',
};

export default function TermsPage() {
  return (
    <main className="min-h-[60vh] px-6 py-10 max-w-4xl mx-auto text-white">
      {/* Header */}
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-amber-300">
          Terms of Use
        </h1>
        <p className="mt-3 text-white/70 max-w-2xl mx-auto">
          These Terms govern your use of the Base Gold Reserve interface and related protocol pages.
          By interacting with the interface or reviewing protocol information, you acknowledge the
          risks of blockchain systems and the transitional status of the legacy V1 vault system.
        </p>
      </section>

      {/* Current Status Summary */}
      <section className="mb-8">
        <div className="rounded-2xl border border-white/12 bg-black/40 px-5 py-5">
          <h2 className="text-lg font-semibold text-amber-300 mb-2">
            Current Protocol Status
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm leading-relaxed">
            <li>V1 vault interactions are temporarily paused in the interface.</li>
            <li>Existing V1 balances remain visible onchain.</li>
            <li>The protocol is preparing a migration to a new V2 vault architecture.</li>
            <li>Migration details and updated mechanics will be published separately.</li>
            <li>The interface may change as the transition progresses.</li>
          </ul>
        </div>
      </section>

      {/* Terms content */}
      <section className="space-y-8 leading-relaxed text-white/80">
        <div>
          <h3 className="text-xl font-semibold text-white">1. Interface Access</h3>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>
              The Base Gold Reserve interface is provided as an informational and interaction layer for
              Base Gold protocol components.
            </li>
            <li>
              The interface may expose contract state, balances, vault references, market data, and status
              updates, but it does not guarantee uninterrupted functionality.
            </li>
            <li>
              During protocol transition periods, some actions may be removed, disabled, or replaced.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">2. Legacy V1 Vaults</h3>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>
              V1 vaults are considered a legacy generation of the Base Gold Reserve system.
            </li>
            <li>
              Existing V1 balances may remain visible through the interface and onchain while the protocol
              completes migration planning.
            </li>
            <li>
              Availability of interface actions does not alter or override underlying contract state.
            </li>
            <li>
              Users are responsible for independently verifying contract addresses, balances, and transaction
              details before taking any onchain action.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">
            3. Migration & Protocol Changes
          </h3>
          <p className="mt-2">
            The Base Gold Reserve may transition from V1 to a newer V2 architecture with updated mechanics,
            reserve design, incentives, and interface behavior. During this process, the team may revise
            how the protocol is presented, what actions are available in the interface, and how migration
            updates are communicated.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">4. No Guarantee of Interface Availability</h3>
          <p className="mt-2">
            The protocol interface may be updated, paused, restricted, redesigned, or partially disabled at
            any time for operational, technical, legal, or migration-related reasons. Temporary interface
            restrictions do not necessarily reflect removal of underlying onchain state.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">5. Risks</h3>
          <p className="mt-2">
            Interacting with blockchain systems involves risk, including but not limited to smart-contract
            risk, market volatility, liquidity risk, interface limitations, wallet errors, chain congestion,
            and third-party dependencies. Users should not rely solely on the interface for critical decisions
            and should independently review onchain state where relevant.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">6. Forward-Looking Statements</h3>
          <p className="mt-2">
            References to V2, migration, future mechanics, or ecosystem expansion are forward-looking and may
            change as development progresses. Nothing in the interface or documentation should be interpreted
            as a guarantee of timing, implementation, or economic outcome.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">7. Updates to These Terms</h3>
          <p className="mt-2">
            These Terms may be updated to reflect changes in protocol design, interface functionality,
            migration planning, legal considerations, or other operational needs. Continued use of the
            interface after updates constitutes acceptance of the revised Terms.
          </p>
        </div>
      </section>

      <div className="mt-12 text-center text-sm text-white/65 italic">
        “Transparency remains. Architecture evolves.”
      </div>
    </main>
  );
}