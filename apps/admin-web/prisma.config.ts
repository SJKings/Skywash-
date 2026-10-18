import "dotenv/config";
import { defineConfig } from "prisma/config";

// The Prisma CLI (migrate, studio, seed) prefers the direct (unpooled) Neon
// connection; the app itself uses DATABASE_URL through the Neon driver adapter.
// `prisma generate` needs no database, so an unset URL is fine at build time.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
