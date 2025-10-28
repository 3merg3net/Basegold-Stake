'use client';

import { useEffect, useMemo, useState } from 'react';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BGLD_ADDRESS, STAKING_ADDRESS, stakingAbi } from '@/lib/contracts';

export function useStaking() {
  const { address, chainId, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>('100'); // default input
  const [days, setDays]     = useState<number>(10);
  const [auto, setAuto]     = useState<boolean>(false);

  // allowance & balance
  const { data: allowance } = useReadContract({
    address: BGLD_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address ?? '0x0000000000000000000000000000000000000000', STAKING_ADDRESS],
    query: { enabled: !!address },
  });

  const { data: balance } = useReadContract({
    address: BGLD_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });

  // positions
  const { data: ids, refetch: refetchIds } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingAbi,
    functionName: 'positionsOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });

  const parsedAmount = useMemo(() => {
    try { return parseUnits(amount || '0', 18); } catch { return 0n; }
  }, [amount]);

  const needApproval = useMemo(() => {
    if (parsedAmount === 0n) return false;
    if (!allowance) return true;
    return (allowance as bigint) < parsedAmount;
  }, [allowance, parsedAmount]);

  // writes
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isMining, isSuccess: isMined } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isMined) refetchIds();
  }, [isMined, refetchIds]);

  const approve = () => {
    if (!parsedAmount) return;
    writeContract({
      address: BGLD_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [STAKING_ADDRESS, parsedAmount],
    });
  };

  const stake = () => {
    if (!parsedAmount) return;
    writeContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: 'stake',
      args: [parsedAmount, BigInt(days), auto],
    });
  };

  return {
    isConnected, chainId, address,
    amount, setAmount,
    days, setDays,
    auto, setAuto,
    balance: balance as bigint | undefined,
    allowance: allowance as bigint | undefined,
    ids: (ids as bigint[] | undefined) ?? [],
    needApproval,
    approve, stake,
    isPending: isPending || isMining,
    txHash,
  };
}
