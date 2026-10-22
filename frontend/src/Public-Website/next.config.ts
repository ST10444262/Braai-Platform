import type { NextConfig } from "next";

const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
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