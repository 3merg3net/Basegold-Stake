'use client';
import { useCallback } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import VAULT from '@/lib/abis/Vault.json';

const VAULT_ADDR = process.env.NEXT_PUBLIC_VAULT as `0x${string}` | undefined;
const DEMO = (process.env.NEXT_PUBLIC_DEMO ?? 'true') === 'true';

export function useActions() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const stake = useCallback(async (amount:string, days:number) => {
    if (!address) return;
    if (DEMO) { alert(`Demo: staked ${amount} BGLD for ${days} days`); return; }
    await writeContractAsync({
      address: VAULT_ADDR!,
      abi: VAULT as any,
      functionName: 'stake',
      args: [/* parseUnits(amount,18) */ BigInt(0), days],
    });
  }, [address, writeContractAsync]);

  const compound = useCallback(async () => {
    if (DEMO) { alert('Demo: compound (ETH→BGLD buy + restake)'); return; }
    await writeContractAsync({
      address: VAULT_ADDR!,
      abi: VAULT as any,
      functionName: 'compoundAll',
      args: [],
    });
  }, [writeContractAsync]);

  return { stake, compound };
}
