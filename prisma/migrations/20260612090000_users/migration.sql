CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "passwordHash" TEXT NOT NULL,
  "publicKey" TEXT NOT NULL,
  "activeProjectId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "publicKey" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activeProjectId" TEXT;

UPDATE "User"
SET "publicKey" = 'wk_' || md5(random()::text || clock_timestamp()::text)
WHERE "publicKey" IS NULL OR "publicKey" = '';

ALTER TABLE "User" ALTER COLUMN "publicKey" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_publicKey_key" ON "User"("publicKey");
