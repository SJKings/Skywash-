import type { NextConfig } from "next";

// Booking lookups go to the admin-web API. Proxying them through this site
// keeps the browser on one origin, so no CORS setup is needed.
const API_URL = process.env.SKYWASH_API_URL ?? "https://skywash-admin-web.vercel.app";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [{ source: "/api/bookings/:code", destination: `${API_URL}/api/bookings/:code` }];
  },
};

export default nextConfig;
