import type { NextConfig } from "next";

const aiServerBaseUrl = (
  process.env.AI_API_SERVER_URL ?? "http://15.135.211.177:8001"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/ai-proxy/ai/:path*",
        destination: `${aiServerBaseUrl}/ai/:path*`,
      },
    ];
  },
};

export default nextConfig;
