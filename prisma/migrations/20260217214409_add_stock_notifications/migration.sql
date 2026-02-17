-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LowStock');

-- CreateTable
CREATE TABLE "stock_notifications" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'LowStock',
    "affectedItems" JSONB NOT NULL,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_notifications_storeId_idx" ON "stock_notifications"("storeId");

-- CreateIndex
CREATE INDEX "stock_notifications_storeId_isDismissed_idx" ON "stock_notifications"("storeId", "isDismissed");

-- CreateIndex
CREATE INDEX "stock_notifications_storeId_createdAt_idx" ON "stock_notifications"("storeId", "createdAt");

-- AddForeignKey
ALTER TABLE "stock_notifications" ADD CONSTRAINT "stock_notifications_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
