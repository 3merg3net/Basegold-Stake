export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 84532);

export const ADDR = {
  BGLD: (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  STAKING: (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const;

// Minimal ABIs (only what UI calls/reads)
export const ABI = {
  ERC20: [
    { inputs:[{name:'owner',type:'address'},{name:'spender',type:'address'}], name:'allowance', outputs:[{type:'uint256'}], stateMutability:'view', type:'function' },
    { inputs:[{name:'spender',type:'address'},{name:'amount',type:'uint256'}], name:'approve', outputs:[{type:'bool'}], stateMutability:'nonpayable', type:'function' },
    { inputs:[{name:'account',type:'address'}], name:'balanceOf', outputs:[{type:'uint256'}], stateMutability:'view', type:'function' },
    { inputs:[], name:'decimals', outputs:[{type:'uint8'}], stateMutability:'view', type:'function' },
    { inputs:[], name:'symbol', outputs:[{type:'string'}], stateMutability:'view', type:'function' },
  ] as const,
  STAKING: [
    // reads
    { inputs:[{name:'id',type:'uint256'}], name:'positions', outputs:[
      {name:'owner',type:'address'},
      {name:'amount',type:'uint256'},
      {name:'startTimestamp',type:'uint256'},
      {name:'lockDays',type:'uint256'},
      {name:'autoCompound',type:'bool'},
      {name:'closed',type:'bool'},
    ], stateMutability:'view', type:'function' },
    { inputs:[{name:'id',type:'uint256'}], name:'pendingRewards', outputs:[
      {name:'vested',type:'uint256'},
      {name:'total',type:'uint256'},
    ], stateMutability:'view', type:'function' },
    { inputs:[{name:'daysLocked',type:'uint256'}], name:'aprForDays', outputs:[{type:'uint256'}], stateMutability:'view', type:'function' },
    { inputs:[{name:'account',type:'address'}], name:'positionsOf', outputs:[{type:'uint256[]'}], stateMutability:'view', type:'function' },
    // writes
    { inputs:[{name:'amount',type:'uint256'},{name:'daysLocked',type:'uint256'},{name:'autoCompound',type:'bool'}], name:'stake', outputs:[{type:'uint256'}], stateMutability:'nonpayable', type:'function' },
    { inputs:[{name:'id',type:'uint256'}], name:'claim', outputs:[], stateMutability:'nonpayable', type:'function' },
    { inputs:[{name:'id',type:'uint256'}], name:'compound', outputs:[], stateMutability:'nonpayable', type:'function' },
    { inputs:[{name:'id',type:'uint256'}], name:'withdraw', outputs:[], stateMutability:'nonpayable', type:'function' },
    { inputs:[{name:'id',type:'uint256'}], name:'emergencyExit', outputs:[], stateMutability:'nonpayable', type:'function' },
    { inputs:[{name:'id',type:'uint256'},{name:'flag',type:'bool'}], name:'setAutoCompound', outputs:[], stateMutability:'nonpayable', type:'function' },
  ] as const,
};
