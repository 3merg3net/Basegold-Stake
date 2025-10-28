import type { Address } from 'viem';

export const STAKING_ADDRESS = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').toLowerCase() as Address;
export const BGLD_ADDRESS    = (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').toLowerCase() as Address;

export const stakingAbi = [
  // events
  { type: 'event', name: 'Staked', inputs: [
      { indexed: false, name: 'id', type: 'uint256' },
      { indexed: true,  name: 'owner', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'days', type: 'uint256' },
      { indexed: false, name: 'autoCompound', type: 'bool' },
    ]},
  { type: 'event', name: 'Unstaked', inputs: [
      { indexed: false, name: 'id', type: 'uint256' },
      { indexed: true,  name: 'owner', type: 'address' },
      { indexed: false, name: 'principal', type: 'uint256' },
      { indexed: false, name: 'rewards', type: 'uint256' },
    ]},

  // reads
  { type: 'function', stateMutability: 'view', name: 'positionsOf', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256[]' }] },
  { type: 'function', stateMutability: 'view', name: 'positions', inputs: [{ name: 'id', type: 'uint256' }], outputs: [
      { type: 'address' }, // owner
      { type: 'uint256' }, // amount
      { type: 'uint256' }, // start
      { type: 'uint256' }, // days
      { type: 'bool'    }, // autoCompound
      { type: 'bool'    }, // closed
    ]},
  { type: 'function', stateMutability: 'view', name: 'pendingRewards', inputs: [{ name: 'id', type: 'uint256' }], outputs: [
      { type: 'uint256' }, // vested
      { type: 'uint256' }, // total
    ]},
  { type: 'function', stateMutability: 'view', name: 'aprForDays', inputs: [{ name: 'days', type: 'uint256' }], outputs: [{ type: 'uint256' }] },

  // writes
  { type: 'function', stateMutability: 'nonpayable', name: 'stake', inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'days', type: 'uint256' },
      { name: 'autoCompound', type: 'bool' },
    ], outputs: [] },
  { type: 'function', stateMutability: 'nonpayable', name: 'unstake', inputs: [{ name:'id', type:'uint256' }], outputs: [] },
  { type: 'function', stateMutability: 'nonpayable', name: 'emergencyExit', inputs: [{ name:'id', type:'uint256' }], outputs: [] },
] as const;
