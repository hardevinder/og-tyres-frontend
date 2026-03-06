import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Next 15 Turbopack config
  turbopack: {
    rules: {},
  },

  // ✅ Ignore TypeScript errors during production build
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Ignore ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Allow external image sources
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5055",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api-ogtire.edubridgeerp.in",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "laundry24.ca",
      },
      {
        protocol: "https",
        hostname: "www.laundry24.ca",
      },
      {
        protocol: "https",
        hostname: "laundry24.in",
      },
      {
        protocol: "https",
        hostname: "www.laundry24.in",
      },
    ],
  },
};

export default nextConfig;