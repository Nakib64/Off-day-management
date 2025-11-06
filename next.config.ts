import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Disable Lightning CSS to avoid Windows EPERM unlink issues
    optimizeCss: false,
  },
};

export default nextConfig;
