import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'asqmjnphqdtjtoopikrv.supabase.co',
        pathname: '/**',
      },
    ],
    qualities: [75, 85, 90],
  },
};

export default nextConfig;