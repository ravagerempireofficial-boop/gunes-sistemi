import type { NextConfig } from "next";

/**
 * `bun run build:site` ile derlendiğinde tamamen statik site üretir (out/ klasörü).
 * Bu klasör Netlify Drop, GitHub Pages, Cloudflare Pages gibi her yere yüklenebilir.
 */
const isStatic = process.env.npm_lifecycle_event === "build:site";

const nextConfig: NextConfig = {
  ...(isStatic
    ? { output: "export" as const, images: { unoptimized: true } }
    : { output: "standalone" }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
