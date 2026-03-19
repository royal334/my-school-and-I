import type { NextConfig } from "next";

const nextConfig: any = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    proxyClientMaxBodySize: "50mb",
  },
};

export default nextConfig;
