import type { NextConfig } from "next";

/** The public website (apps/website), home of the privacy policy. */
const WEBSITE_URL = process.env.SKYWASH_WEBSITE_URL ?? "https://skywash-ng.vercel.app";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The privacy policy moved to the website; keep the old link (already on
  // Google Play and in app 1.0.0) working. Runs before proxy.ts, so no login.
  async redirects() {
    return [{ source: "/privacy", destination: `${WEBSITE_URL}/privacy`, permanent: true }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
