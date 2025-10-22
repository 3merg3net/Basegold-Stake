'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
// import { waitForTransactionReceipt } from 'wagmi/actions'
// import VAULT from '@/lib/abis/Vault.json';

type Phase = 'idle' | 'routing' | 'swapping' | 'restaking' | 'done' | 'error';

const DEMO = true;               // flip false when wiring contracts
const AUTO_KEY = 'bgld:autoCompound';
const AUTO_INTERVAL_MS = 60_000; // demo: every 60s (change to your cadence)

export function useCompound() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [phase, setPhase] = useState<Phase>('idle');
  const [ethIn, setEthIn] = useState(0);
  const [bgldOut, setBgldOut] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto compound state (persisted)
  const [autoEnabled, setAutoEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(AUTO_KEY);
    return saved ? saved === '1' : false;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTO_KEY, autoEnabled ? '1' : '0');
    }
  }, [autoEnabled]);

  const compound = useCallback(async () => {
    setError(null); setTxHash(null); setEthIn(0); setBgldOut(0);
    try {
      setPhase('routing');
      const demoEth = +(Math.random() * 0.6 + 0.2).toFixed(3);
      const demoBgld = Math.floor(Math.random() * 250_000 + 50_000);

      await sleep(600);
      setPhase('swapping'); setEthIn(demoEth);

      await sleep(900);
      setPhase('restaking'); setBgldOut(demoBgld);

      if (!DEMO) {
        // const hash = await writeContractAsync({
        //   address: '0xYourVault' as `0x${string}`,
        //   abi: VAULT as any,
        //   functionName: 'compoundAll',
        //   args: [],
        // });
        // setTxHash(hash as string);
        // await waitForTransactionReceipt(config, { hash });
      }

      await sleep(600);
      setPhase('done');
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'Compound failed');
      setPhase('error');
    }
  }, [/* writeContractAsync */]);

  const reset = useCallback(() => {
    setPhase('idle'); setError(null); setTxHash(null); setEthIn(0); setBgldOut(0);
  }, []);

  // Auto loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!autoEnabled || !isConnected) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(() => {
      // only kick off if idle/done/error to avoid overlapping runs
      setPhase(p => {
        const runnable = p === 'idle' || p === 'done' || p === 'error';
        if (runnable) compound();
        return p;
      });
    }, AUTO_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoEnabled, isConnected, compound]);

  return {
    isConnected,
    phase, ethIn, bgldOut, txHash, error,
    compound, reset,
    autoEnabled, setAutoEnabled,
  };
}

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}
