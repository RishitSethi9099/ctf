import type { NextConfig } from "next";

// next.config.ts
const nextConfig = {
  // Add this to disable Turbopack
  experimental: {
    turbo: undefined, // Disable Turbopack
  },
  // ... rest of your config
};

export default nextConfig;
