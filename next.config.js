/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false,
      'pino-abstract-transport': false,
      'sonic-boom': false,
      '@react-native-async-storage/async-storage': false,
      'react-native-ble-plx': false,
      'utf-8-validate': false,
      bufferutil: false,
      'supports-color': false,
    };
    return config;
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
