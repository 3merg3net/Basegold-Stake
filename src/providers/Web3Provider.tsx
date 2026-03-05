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
import type { ReactNode } from 'react';

// --- ENV + chain resolution ---
const RAW_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'); // default Base mainnet
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org';
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'demo';

// Pick the chain based on env
const TARGET_CHAIN =
  RAW_CHAIN_ID === base.id ? base : RAW_CHAIN_ID === baseSepolia.id ? baseSepolia : base;

// Dev-time sanity warnings
if (process.env.NODE_ENV !== 'production') {
  if (!process.env.NEXT_PUBLIC_WALLETCONNECT_ID || WC_PROJECT_ID === 'demo') {
    // eslint-disable-next-line no-console
    console.warn(
      '[Web3] Using demo WalletConnect ID. Set NEXT_PUBLIC_WALLETCONNECT_ID for production.',
    );
  }
  if (!process.env.NEXT_PUBLIC_RPC_URL) {
    // eslint-disable-next-line no-console
    console.warn('[Web3] Using default RPC. Set NEXT_PUBLIC_RPC_URL to your Base RPC.');
  }
}

// RainbowKit + wagmi config
const config = getDefaultConfig({
  appName: 'Base Gold',
  projectId: WC_PROJECT_ID,
  chains: [TARGET_CHAIN],

  // Helps when multiple injected wallets exist (Zerion, Coinbase, Brave, etc.)
  multiInjectedProviderDiscovery: true,

  transports: {
    [TARGET_CHAIN.id]: http(RPC_URL, {
      // optional: keep this lean; viem will retry some things internally
      batch: true,
    }),
  },

  // For wallet stability, client-only is typically best.
  // If you absolutely need SSR, you can set this back to true,
  // but it can create edge cases for connector hydration.
  ssr: false,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({ overlayBlur: 'small' })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}