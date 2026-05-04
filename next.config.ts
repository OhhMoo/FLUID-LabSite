import type { NextConfig } from "next";

// GitHub Pages serves project repos at /<repo-name>/, so the build-time
// NEXT_PUBLIC_BASE_PATH controls every internal link and asset URL.
// The deploy workflow sets it from ${{ github.event.repository.name }};
// locally it's empty so dev still serves at "/".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
};

export default nextConfig;
