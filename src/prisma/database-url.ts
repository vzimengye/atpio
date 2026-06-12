export function getDatabaseUrl() {
  return [
    process.env.DATABASE_URL,
    process.env.DATABASE_POSTGRES_PRISMA_URL,
    process.env.DATABASE_POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ].find((value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed !== "\"\"" && trimmed !== "''";
  });
}
