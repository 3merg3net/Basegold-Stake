'use client';

import { ReactNode } from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains'; // ✅ use wagmi/chains (not viem/chains)
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ---- Env switches ----
const TARGET = (process.env.NEXT_PUBLIC_CHAIN || 'base').toLowerCase(); // 'base' | 'basesepolia'
const WALLETCONNECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'bgld-stake';

// Optional RPC overrides
const RPC_BASE =
  process.env.NEXT_PUBLIC_RPC_BASE || 'https://mainnet.base.org';
const RPC_BASE_SEPOLIA =
  process.env.NEXT_PUBLIC_RPC_BASESEPOLIA || 'https://sepolia.base.org';

// Choose exactly one chain; cast as const to satisfy RainbowKit's tuple type
const CHAINS =
  TARGET === 'basesepolia' ? ([baseSepolia] as const) : ([base] as const);

const config = getDefaultConfig({
  appName: 'Base Gold Staking',
  projectId: WALLETCONNECT_ID,
  chains: CHAINS, // ✅ now a readonly tuple of RainbowKitChain(s)
  transports: {
    [base.id]: http(RPC_BASE),
    [baseSepolia.id]: http(RPC_BASE_SEPOLIA),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({ accentColor: '#d4af37' })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
