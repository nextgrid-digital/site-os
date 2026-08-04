import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', '@base-ui/react'],
  },
};

export default nextConfig;
