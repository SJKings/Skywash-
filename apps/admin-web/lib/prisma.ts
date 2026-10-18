import { PrismaPg } from "@prisma/adapter-pg";
import { databaseUrl } from "@/lib/database-url";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Connections open lazily on the first query, so a missing connection string
// surfaces as a query error rather than breaking `next build`.
function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl() }),
  });
}

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
