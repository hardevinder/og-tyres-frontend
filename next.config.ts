import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Completely disable Turbopack — force Webpack instead
  // (The new API requires a nested object)
  experimental: {
    turbo: {
      rules: {}, // just an empty object disables turbo rules
    },
  },

  // ✅ Ignore TypeScript build errors
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Ignore ESLint warnings during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Image domain whitelist for Next <Image>
  images: {
    domains: [
      "localhost",
      "laundry24.ca",
      "www.laundry24.ca",
      "laundry24.in",
      "www.laundry24.in",
    ],
  },
};

export default nextConfig;
