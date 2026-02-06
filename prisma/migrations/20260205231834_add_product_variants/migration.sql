-- CreateEnum
CREATE TYPE "SizeType" AS ENUM ('VOLUME', 'WEIGHT', 'APPAREL_ALPHA', 'APPAREL_NUMERIC', 'FOOTWEAR', 'DIMENSION', 'COUNT', 'STORAGE');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('ML', 'L', 'G', 'KG', 'XS', 'S', 'M', 'L_SIZE', 'XL', 'XXL', 'SIZE_28', 'SIZE_30', 'SIZE_32', 'SIZE_34', 'SIZE_36', 'SIZE_38', 'SIZE_40', 'SIZE_42', 'US_6', 'US_7', 'US_8', 'US_9', 'US_10', 'US_11', 'US_12', 'US_13', 'CM', 'METER', 'INCH', 'FEET', 'PCS', 'PACK', 'GB', 'TB');

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "variantId" TEXT,
ADD COLUMN     "variantInfo" TEXT;

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sizeType" "SizeType",
    "value" TEXT,
    "unit" "Unit",
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex
CREATE INDEX "order_items_variantId_idx" ON "order_items"("variantId");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
