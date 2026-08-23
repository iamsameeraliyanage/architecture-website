import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // the case-study plates are rendered point clouds — fine speckle that 75
    // stipples into mush, so they ask for 90 (components/CaseStudies). Next 16
    // only honours qualities declared here and warns on every other one.
    qualities: [75, 90],
  },
  experimental: {
    // the root layout sits inside [locale], so an unmatched URL never reaches
    // it — app/global-not-found.tsx is how the branded 404 gets rendered
    globalNotFound: true,
  },
};

export default nextConfig;
