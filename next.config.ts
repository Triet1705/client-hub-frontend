import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],

  turbopack: {},
};

export default nextConfig;
