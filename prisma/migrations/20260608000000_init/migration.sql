CREATE TABLE "Project" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "brief" TEXT NOT NULL,
  "schema" JSONB NOT NULL,
  "gadget" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "responseCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Response" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "answers" JSONB NOT NULL,
  "sourceUrl" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "projectId" TEXT,
  "actor" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Response_projectId_idx" ON "Response"("projectId");
CREATE INDEX "Response_createdAt_idx" ON "Response"("createdAt");
CREATE INDEX "AuditEvent_projectId_idx" ON "AuditEvent"("projectId");
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

ALTER TABLE "Response"
ADD CONSTRAINT "Response_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
