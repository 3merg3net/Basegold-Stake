'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContractPill({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/50 px-4 py-2">
        <span className="text-white/70 text-sm">Contract</span>
        <code className="text-amber-200 text-sm">{address}</code>
        <button
          onClick={copy}
          className="ml-2 inline-flex items-center gap-2 rounded-xl border border-amber-300/40 px-3 py-1 text-amber-200 hover:bg-amber-300/10 transition"
          aria-label="Copy contract address"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
            <path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/>
          </svg>
          <span className="text-sm">{copied ? 'Copied ✓' : 'Copy'}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: copied ? 1 : 0, y: copied ? 0 : -6 }}
        transition={{ duration: 0.18 }}
        className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg border border-amber-300/40 bg-black/80 px-3 py-1 text-xs text-amber-200 shadow-lg pointer-events-none"
        aria-live="polite"
      >
        Contract copied: {short}
      </motion.div>
    </div>
  );
}
