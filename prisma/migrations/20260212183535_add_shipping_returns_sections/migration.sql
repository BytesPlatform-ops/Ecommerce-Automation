-- CreateTable
CREATE TABLE "store_shipping_returns_sections" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_shipping_returns_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_shipping_returns_sections_storeId_idx" ON "store_shipping_returns_sections"("storeId");

-- CreateIndex
CREATE INDEX "store_shipping_returns_sections_storeId_sortOrder_idx" ON "store_shipping_returns_sections"("storeId", "sortOrder");

-- AddForeignKey
ALTER TABLE "store_shipping_returns_sections" ADD CONSTRAINT "store_shipping_returns_sections_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
