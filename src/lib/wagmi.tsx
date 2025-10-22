'use client';

import { RainbowKitProvider, getDefaultConfig, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig } from 'wagmi';
import { base } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const WC_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'bgld-stake'; // replace if you want

const config = getDefaultConfig({
  appName: 'Base Gold Staking',
  projectId: WC_ID,
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config as ReturnType<typeof createConfig>}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({ accentColor: '#d4af37' })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
