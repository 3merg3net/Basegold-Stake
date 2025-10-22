export const metadata = {
  title: 'Terms of Use – Base Gold',
  description: 'Short-form disclaimer for Base Gold staking.',
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 prose prose-invert prose-headings:text-gold">
      <h1 className="text-gold text-4xl font-bold mb-6">Base Gold – Terms</h1>

      <p className="opacity-90">
        Base Gold is a decentralized smart-contract protocol on Base. By using the app, you acknowledge that all
        interactions are self-directed and at your own risk. Crypto assets are volatile; smart contract transactions are irreversible. Nothing here is financial, legal, or tax advice. Always do your own
        research and never stake more than you can afford. By proceeding, you agree that Base Gold contributors
        are not liable for losses or errors arising from your use of the protocol.
      </p>

      <p className="text-xs text-white/60 mt-8">
        Questions? <a className="text-gold underline" href="https://x.com/BaseReserveGold" target="_blank">@BaseReserveGold</a>
      </p>
    </main>
  );
}
