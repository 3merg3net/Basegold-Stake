/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Ignore server/CLI/React-Native-only deps that some libs reference optionally
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false,
      'pino-abstract-transport': false,
      'sonic-boom': false,
      '@react-native-async-storage/async-storage': false,
      'react-native-ble-plx': false,
      'utf-8-validate': false,
      'bufferutil': false,
      'supports-color': false,
      // (add more here if Vercel mentions another optional module)
    };
    return config;
    // If you also see Node core module warnings, you can add:
    // config.resolve.fallback = { ...(config.resolve.fallback || {}), fs: false, net: false, tls: false, path: false };
  },
  experimental: {
    optimizePackageImports: ['lucide-react'], // optional perf polish
  },
};

export default nextConfig;
