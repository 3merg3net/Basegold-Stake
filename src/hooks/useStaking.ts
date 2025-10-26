'use client';

import { useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useEstimateGas, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';
import { ABI, ADDR, CHAIN_ID } from '@/lib/contracts';
import { parseUnits } from 'viem';

export function useStaking() {
  const chain = CHAIN_ID === base.id ? base : baseSepolia;
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  async function ensureChain() {
    if (!chainId || chainId !== chain.id) {
      await switchChainAsync({ chainId: chain.id });
    }
  }

  async function stake(amountStr: string, daysLocked: number, autoCompound: boolean) {
    await ensureChain();
    // Approve if needed is typically done in UI; this is just the stake call:
    const amount = parseUnits(amountStr || '0', 18);
    return writeContractAsync({
      address: ADDR.STAKING,
      abi: ABI.STAKING,
      functionName: 'stake',
      args: [amount, BigInt(daysLocked), autoCompound],
    });
  }

  function approveIfNeeded(amountStr: string) {
    const amount = parseUnits(amountStr || '0', 18);
    return writeContractAsync({
      address: ADDR.BGLD,
      abi: ABI.ERC20,
      functionName: 'approve',
      args: [ADDR.STAKING, amount],
    });
  }

  function claim(id: bigint) {
    return writeContractAsync({
      address: ADDR.STAKING,
      abi: ABI.STAKING,
      functionName: 'claim',
      args: [id],
    });
  }

  function compound(id: bigint) {
    return writeContractAsync({
      address: ADDR.STAKING,
      abi: ABI.STAKING,
      functionName: 'compound',
      args: [id],
    });
  }

  function withdraw(id: bigint) {
    return writeContractAsync({
      address: ADDR.STAKING,
      abi: ABI.STAKING,
      functionName: 'withdraw',
      args: [id],
    });
  }

  function emergencyExit(id: bigint) {
    return writeContractAsync({
      address: ADDR.STAKING,
      abi: ABI.STAKING,
      functionName: 'emergencyExit',
      args: [id],
    });
  }

  return {
    chain,
    address,
    stake,
    approveIfNeeded,
    claim,
    compound,
    withdraw,
    emergencyExit,
  };
}
