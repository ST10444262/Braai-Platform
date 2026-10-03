import type { NextConfig } from "next";

const backend = process.env.BACKEND_URL ?? "http://localhost:5282";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Proxy API calls through Next so the browser never talks to the API directly (no CORS needed)
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;