// src/lib/abis/BaseGoldStaking.ts
import type { Abi } from "viem";

/**
 * Matches the on-chain interface:
 *   stake(uint256 amount, uint32 daysLocked, bool autoCompound)
 * plus the view/admin funcs we actually call in the app.
 */
const STAKING_ABI = [
  {
    type: "function",
    name: "stake",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "daysLocked", type: "uint32" },
      { name: "autoCompound", type: "bool" }
    ],
    outputs: [{ type: "uint256", name: "id" }]
  },
  { type: "function", name: "positionsOf", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256[]" }] },
  { type: "function", name: "positions", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [
      { name: "owner", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "start", type: "uint64" },
      { name: "daysLocked", type: "uint32" },
      { name: "autoCompound", type: "bool" },
      { name: "closed", type: "bool" }
    ]
  },
  { type: "function", name: "aprForDays", stateMutability: "view", inputs: [{ name: "daysLocked", type: "uint32" }], outputs: [{ type: "uint32" }] },
  { type: "function", name: "pendingRewards", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ type: "uint256", name: "vested" }, { type: "uint256", name: "total" }] },
  { type: "function", name: "principalExitFeeBps", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ type: "uint32" }] },

  { type: "function", name: "compound", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { type: "function", name: "emergencyExit", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] }
] as const satisfies Abi;

export default STAKING_ABI;
