-- AlterTable
ALTER TABLE "stores" ADD COLUMN "activationEmail2SentAt" TIMESTAMP(3);
ALTER TABLE "stores" ADD COLUMN "activationEmail3SentAt" TIMESTAMP(3);
ALTER TABLE "stores" ADD COLUMN "activationEmail4SentAt" TIMESTAMP(3);
ALTER TABLE "stores" ADD COLUMN "activationEmail5SentAt" TIMESTAMP(3);
ALTER TABLE "stores" ADD COLUMN "activationEmail6SentAt" TIMESTAMP(3);
ALTER TABLE "stores" ADD COLUMN "activationEmail7SentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "stores_createdAt_idx" ON "stores"("createdAt");
