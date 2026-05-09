import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-remove-scroll-bar/constants": path.resolve(
        process.cwd(),
        "node_modules/react-remove-scroll-bar/dist/es2019/constants.js",
      ),
      "react-remove-scroll-bar": path.resolve(
        process.cwd(),
        "node_modules/react-remove-scroll-bar/dist/es2019/index.js",
      ),
    };

    return config;
  },
};

export default nextConfig;
