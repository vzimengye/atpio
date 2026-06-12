import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "@/prisma/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("A Postgres connection URL is required to use Prisma storage.");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
