/*
  Warnings:

  - A unique constraint covering the columns `[domain]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('Pending', 'Verifying', 'Securing', 'Live');

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "certificateGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "domainStatus" "DomainStatus" NOT NULL DEFAULT 'Pending';

-- CreateIndex
CREATE UNIQUE INDEX "stores_domain_key" ON "stores"("domain");
