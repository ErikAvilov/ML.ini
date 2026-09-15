import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel build machines are typically 2 cores / 8GB — cap workers to avoid OOM
  // during "Collecting page data" (default can spawn ~15 workers).
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;
