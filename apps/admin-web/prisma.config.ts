import "dotenv/config";
import { defineConfig } from "prisma/config";
import { databaseUrl } from "./lib/database-url";

// Used by the Prisma CLI (migrate, studio, seed). DATABASE_URL_UNPOOLED is
// preferred when a provider gives a separate direct connection.
// `prisma generate` needs no database, so an unset URL is fine at build time.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED || databaseUrl(),
  },
});
