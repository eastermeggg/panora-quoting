import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the local design-system workspace package (it ships TS/JSX source).
  transpilePackages: ["@panora/design-system"],
};

export default nextConfig;
