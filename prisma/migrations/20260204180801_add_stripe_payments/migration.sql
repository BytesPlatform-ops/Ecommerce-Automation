/*
  Warnings:

  - A unique constraint covering the columns `[stripeConnectId]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StripeConnectStatus" AS ENUM ('NotConnected', 'Pending', 'Active', 'Restricted');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Completed', 'Failed', 'Refunded');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "description" TEXT,
ADD COLUMN     "sku" TEXT;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "stripeConnectId" TEXT,
ADD COLUMN     "stripeConnectStatus" "StripeConnectStatus" NOT NULL DEFAULT 'NotConnected',
ADD COLUMN     "stripeConnectedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "stripePaymentId" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "OrderStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripePaymentId_key" ON "orders"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripeSessionId_key" ON "orders"("stripeSessionId");

-- CreateIndex
CREATE INDEX "orders_storeId_idx" ON "orders"("storeId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "stores_stripeConnectId_key" ON "stores"("stripeConnectId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
