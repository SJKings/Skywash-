import type { NextConfig } from "next";

// Booking lookups go to the admin-web API. Proxying them through this site
// keeps the browser on one origin, so no CORS setup is needed.
const API_URL = process.env.SKYWASH_API_URL ?? "https://skywash-admin-web.vercel.app";

/** The site's own domain. */
const SITE_URL = "https://skywash.space";

// Other production hosts of this project send visitors to SITE_URL. The
// vercel.app ones stay attached in Vercel: app 1.0.0 links to
// skywash-ng.vercel.app/privacy. Temporary (307) so nothing is cached for good.
const OTHER_HOSTS = [
  { host: "www.skywash.space", permanent: true },
  { host: "skywash-ng.vercel.app", permanent: false },
  { host: "skywash-website-ruddy.vercel.app", permanent: false },
];

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
  async redirects() {
    return OTHER_HOSTS.map(({ host, permanent }) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${SITE_URL}/:path*`,
      permanent,
    }));
  },
  async rewrites() {
    return [{ source: "/api/bookings/:code", destination: `${API_URL}/api/bookings/:code` }];
  },
};

export default nextConfig;
