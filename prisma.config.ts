import { defineConfig } from "prisma/config";
import { getDatabaseUrl } from "./src/prisma/database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getDatabaseUrl() ?? "postgresql://user:password@localhost:5432/atpio_dev",
  },
});
