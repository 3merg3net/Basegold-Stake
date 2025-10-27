// src/lib/abis/BaseGoldStaking.ts
import type { Abi } from 'viem';

export const STAKING_ABI = [
  // --- Core writes ---
  {
    type: 'function',
    name: 'stake',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'daysLocked', type: 'uint32' },
      { name: 'autoCompound', type: 'bool' },
    ],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
  { type: 'function', name: 'compound', stateMutability: 'nonpayable', inputs: [{ name: 'id', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'withdraw', stateMutability: 'nonpayable', inputs: [{ name: 'id', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'emergencyExit', stateMutability: 'nonpayable', inputs: [{ name: 'id', type: 'uint256' }], outputs: [] },

  // --- Views used by the UI ---
  { type: 'function', name: 'positionsOf', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256[]' }] },
  {
    type: 'function',
    name: 'positions',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'start', type: 'uint64' },
      { name: 'daysLocked', type: 'uint32' },
      { name: 'autoCompound', type: 'bool' },
      { name: 'closed', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'pendingRewards',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: 'vested', type: 'uint256' }, { name: 'total', type: 'uint256' }],
  },
  { type: 'function', name: 'userPositions', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }, { name: 'index', type: 'uint256' }], outputs: [{ type: 'uint256' }] },

  // Helpful reads (some are shown in UI / debug)
  { type: 'function', name: 'aprForDays', stateMutability: 'view', inputs: [{ name: 'daysLocked', type: 'uint32' }], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'elapsed', stateMutability: 'view', inputs: [{ name: 'id', type: 'uint256' }], outputs: [{ name: 'secs', type: 'uint256' }] },
  { type: 'function', name: 'principalExitFeeBps', stateMutability: 'view', inputs: [{ name: 'id', type: 'uint256' }], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'rewardForTerm', stateMutability: 'view', inputs: [{ name: 'principal', type: 'uint256' }, { name: 'daysLocked', type: 'uint32' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'termSeconds', stateMutability: 'pure', inputs: [{ name: 'daysLocked', type: 'uint32' }], outputs: [{ type: 'uint256' }] },

  // --- Events (for live refresh) ---
  {
    type: 'event',
    name: 'Staked',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'daysLocked', type: 'uint32', indexed: false },
      { name: 'autoCompound', type: 'bool', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Withdrawn',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'principal', type: 'uint256', indexed: false },
      { name: 'rewards', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Compounded',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'newAmount', type: 'uint256', indexed: false },
      { name: 'newStart', type: 'uint64', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EmergencyExit',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'principalReturned', type: 'uint256', indexed: false },
      { name: 'rewardsPaid', type: 'uint256', indexed: false },
      { name: 'feeBps', type: 'uint32', indexed: false },
    ],
    anonymous: false,
  },
] as const satisfies Abi;

export default STAKING_ABI;
