-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'Shipped';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "trackingNumber" TEXT;
