/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `stores` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'SubscriptionCreated';
ALTER TYPE "AuditAction" ADD VALUE 'SubscriptionUpdated';
ALTER TYPE "AuditAction" ADD VALUE 'SubscriptionCanceled';

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "productLimit" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "stripeSubscriptionStatus" TEXT,
ADD COLUMN     "subscriptionCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE';

-- CreateIndex
CREATE UNIQUE INDEX "stores_stripeCustomerId_key" ON "stores"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "stores_stripeSubscriptionId_key" ON "stores"("stripeSubscriptionId");
