'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { base, baseSepolia } from 'wagmi/chains';
import { ReactNode, useMemo } from 'react';

const RAW_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 84532); // default sepolia for safety
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'demo';

// Resolve target chain from env CHAIN_ID
const TARGET_CHAIN = RAW_CHAIN_ID === base.id
  ? base
  : RAW_CHAIN_ID === baseSepolia.id
    ? baseSepolia
    : baseSepolia; // defensive fallback

// Basic env sanity checks in dev
if (process.env.NODE_ENV !== 'production') {
  if (!process.env.NEXT_PUBLIC_WALLETCONNECT_ID || WC_PROJECT_ID === 'demo') {
    // eslint-disable-next-line no-console
    console.warn('[Web3] Using demo WalletConnect ID. Set NEXT_PUBLIC_WALLETCONNECT_ID for production.');
  }
  if (!process.env.NEXT_PUBLIC_RPC_URL) {
    // eslint-disable-next-line no-console
    console.warn('[Web3] Using default RPC. Set NEXT_PUBLIC_RPC_URL for your provider.');
  }
}

const config = getDefaultConfig({
  appName: 'Base Gold',
  projectId: WC_PROJECT_ID,
  chains: [TARGET_CHAIN],
  transports: {
    [TARGET_CHAIN.id]: http(RPC_URL),
  },
  ssr: true,
});

const qc = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  // memo to avoid re-creating the theme every render
  const theme = useMemo(() => lightTheme({ overlayBlur: 'small' }), []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={qc}>
        <RainbowKitProvider theme={theme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
