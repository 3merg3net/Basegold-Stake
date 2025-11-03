// src/lib/abis/BaseGoldStaking.ts
// Live verified ABI for BaseGoldStaking on Base Mainnet
// Contract: 0x8d61b6ded9C30e4CA59A9eC503F9De6E5Bd5d0d4

const STAKING_ABI = [
  {
    "inputs": [
      { "internalType": "contract IERC20", "name": "_bgld", "type": "address" },
      { "internalType": "address", "name": "initialOwner", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" },
  { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" },
  { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "SafeERC20FailedOperation", "type": "error" },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint32", "name": "minBps", "type": "uint32" },
      { "indexed": false, "internalType": "uint32", "name": "maxBps", "type": "uint32" }
    ],
    "name": "AprBoundsUpdated",
    "type": "event"
  },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "bool", "name": "enabled", "type": "bool" }], "name": "AutoCompoundToggled", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "BgldSwept", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint32", "name": "throttleSeconds", "type": "uint32" }, { "indexed": false, "internalType": "uint32", "name": "autoIntervalSeconds", "type": "uint32" }], "name": "CompoundConfigUpdated", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "rewardsGross", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feeTaken", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint64", "name": "newStart", "type": "uint64" }], "name": "Compounded", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "principalReturned", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "rewardsPaid", "type": "uint256" }, { "indexed": false, "internalType": "uint32", "name": "feeBps", "type": "uint32" }], "name": "EmergencyExit", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint32", "name": "withdrawFeeBps", "type": "uint32" }, { "indexed": false, "internalType": "uint32", "name": "compoundFeeBps", "type": "uint32" }, { "indexed": false, "internalType": "address", "name": "feeSink", "type": "address" }], "name": "FeesUpdated", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint32", "name": "maxFeeBps", "type": "uint32" }], "name": "MaxPrincipalFeeUpdated", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint32", "name": "daysLocked", "type": "uint32" }, { "indexed": false, "internalType": "bool", "name": "autoCompound", "type": "bool" }], "name": "Staked", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "principal", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "rewards", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feeTaken", "type": "uint256" }], "name": "Withdrawn", "type": "event" },
  { "inputs": [], "name": "BGLD", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint32", "name": "daysLocked", "type": "uint32" }], "name": "aprForDays", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "aprMaxBps", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "aprMinBps", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "autoCompound", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "autoCompoundInterval", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "bgldBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "compound", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "compoundFeeBps", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "compoundThrottle", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "elapsed", "outputs": [{ "internalType": "uint256", "name": "secs", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "emergencyExit", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "feeSink", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "maxPrincipalFeeBps", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "nextId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "pendingRewards", "outputs": [{ "internalType": "uint256", "name": "vested", "type": "uint256" }, { "internalType": "uint256", "name": "total", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "positions", "outputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint64", "name": "start", "type": "uint64" }, { "internalType": "uint64", "name": "lastCompoundAt", "type": "uint64" }, { "internalType": "uint32", "name": "daysLocked", "type": "uint32" }, { "internalType": "bool", "name": "autoCompound", "type": "bool" }, { "internalType": "bool", "name": "closed", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "positionsOf", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "principalExitFeeBps", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "principal", "type": "uint256" }, { "internalType": "uint32", "name": "daysLocked", "type": "uint32" }], "name": "rewardForTerm", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

export default STAKING_ABI;
