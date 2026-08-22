import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // the root layout sits inside [locale], so an unmatched URL never reaches
    // it — app/global-not-found.tsx is how the branded 404 gets rendered
    globalNotFound: true,
  },
};

export default nextConfig;
