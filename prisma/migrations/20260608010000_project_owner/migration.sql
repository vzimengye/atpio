ALTER TABLE "Project" ADD COLUMN "ownerEmail" TEXT;
CREATE INDEX "Project_ownerEmail_idx" ON "Project"("ownerEmail");
