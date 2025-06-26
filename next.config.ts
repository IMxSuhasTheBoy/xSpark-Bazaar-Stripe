import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  webpack: (config, { dev, isServer }) => {
    // Ensure proper source map generation
    if (!dev && !isServer) {
      config.devtool = "source-map";
    }
    return config;
  },
};

export default withPayload(nextConfig);
