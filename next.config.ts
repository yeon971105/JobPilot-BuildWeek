import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: process.env.JOBPILOT_SITES_STANDALONE === "true" ? "standalone" : undefined,
  logging: process.env.JOBPILOT_SITES_STANDALONE === "true" ? { browserToTerminal: false } : undefined,
};

export default nextConfig;
