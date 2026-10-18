// Resolves the Postgres connection string.
//
// DATABASE_URL wins when set. Otherwise fall back to DATABASE_POSTGRES_URL, the
// name Vercel's Prisma Postgres integration uses when connected with the
// "DATABASE" environment variable prefix.
export function databaseUrl() {
  return process.env.DATABASE_URL || process.env.DATABASE_POSTGRES_URL || undefined;
}
