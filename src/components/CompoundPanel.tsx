'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCompound } from '@/hooks/useCompound';

const Step = ({ on, label }: { on: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`h-2 w-2 rounded-full ${on ? 'bg-gold' : 'bg-white/30'}`} />
    <span className={on ? 'text-gold' : 'text-white/70'}>{label}</span>
  </div>
);

export default function CompoundPanel() {
  const {
    phase, ethIn, bgldOut, error, txHash,
    compound, reset,
    autoEnabled, setAutoEnabled,
    isConnected,
  } = useCompound();

  const pct = (() => {
    switch (phase) {
      case 'routing': return 25;
      case 'swapping': return 60;
      case 'restaking': return 85;
      case 'done': return 100;
      default: return 0;
    }
  })();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-black/40 backdrop-blur-md p-6">
      <div className="pointer-events-none absolute -inset-1 rounded-2xl opacity-30 blur-3xl"
           style={{ background: 'radial-gradient(600px 200px at 50% -10%, rgba(212,175,55,.25), transparent)' }} />
      <div className="relative space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-xl font-bold text-gold tracking-wider">Smelt & Compound</h3>

          {/* Auto / Manual toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">Auto Compound</span>
            <button
              onClick={() => setAutoEnabled(!autoEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${autoEnabled ? 'bg-gold' : 'bg-white/20'}`}
              aria-pressed={autoEnabled}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-transform ${autoEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {!autoEnabled && (
          <button
            onClick={phase === 'idle' || phase === 'error' || phase === 'done' ? compound : undefined}
            disabled={!(phase === 'idle' || phase === 'error' || phase === 'done')}
            className={`rounded-xl px-4 py-2 font-semibold ${phase === 'idle' || phase === 'error' || phase === 'done'
              ? 'bg-gold text-black hover:bg-[#e6c964]' : 'bg-white/10 text-white/60 cursor-not-allowed'}`}
          >
            {phase === 'idle' && 'Start Compound'}
            {phase === 'routing' && 'Routing…'}
            {phase === 'swapping' && 'Swapping ETH→BGLD…'}
            {phase === 'restaking' && 'Restaking…'}
            {phase === 'done' && 'Compound Again'}
            {phase === 'error' && 'Retry Compound'}
          </button>
        )}

        {/* Steps */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Step on={['routing','swapping','restaking','done'].includes(phase)} label="Route" />
          <Step on={['swapping','restaking','done'].includes(phase)} label="Swap ETH→BGLD" />
          <Step on={['restaking','done'].includes(phase)} label="Restake" />
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gold"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>

        {/* Readout */}
        <div className="flex items-center justify-between text-sm">
          <div className="opacity-80">ETH In: <span className="text-gold">{ethIn ? `${ethIn} ETH` : '—'}</span></div>
          <div className="opacity-80">BGLD Out: <span className="text-gold">{bgldOut ? `${bgldOut.toLocaleString()} BGLD` : '—'}</span></div>
        </div>

        {/* Ticker */}
        <AnimatePresence>
          {bgldOut > 0 && (
            <motion.div
              key={bgldOut}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              className="mt-2 rounded-xl border border-gold/20 bg-black/30 px-3 py-2 text-sm text-gold"
            >
              ⛏️ Buy Pressure: {ethIn} ETH → {bgldOut.toLocaleString()} BGLD
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto status */}
        <div className="text-xs text-white/60">
          Mode: {autoEnabled ? <span className="text-gold">Auto</span> : 'Manual'} {isConnected ? '' : '(connect wallet)'}
        </div>

        {/* Error/Receipt + Reset */}
        {error && <div className="mt-2 text-red-400 text-sm">Error: {error}</div>}
        {txHash && (
          <div className="mt-2 text-sm opacity-80">
            Tx: <a className="underline" href={`https://basescan.org/tx/${txHash}`} target="_blank">view on Basescan</a>
          </div>
        )}
        {(phase === 'done' || phase === 'error') && (
          <button onClick={reset} className="mt-1 text-xs text-white/70 underline">Reset</button>
        )}
      </div>
    </div>
  );
}
