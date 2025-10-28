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
import { ReactNode } from 'react';

const CHAIN = (process.env.NEXT_PUBLIC_CHAIN || 'basesepolia').toLowerCase();
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 84532);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'demo';

const target =
  CHAIN_ID === base.id ? base :
  CHAIN_ID === baseSepolia.id ? baseSepolia :
  baseSepolia;

const config = getDefaultConfig({
  appName: 'Base Gold',
  projectId: WC_PROJECT_ID,
  chains: [target],
  transports: {
    [target.id]: http(RPC_URL),
  },
  ssr: true,
});

const qc = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={qc}>
        <RainbowKitProvider theme={lightTheme({ overlayBlur: 'small' })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
