-- CreateTable
CREATE TABLE "store_shipping_locations" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "cities" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_shipping_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_shipping_locations_storeId_idx" ON "store_shipping_locations"("storeId");

-- CreateIndex
CREATE INDEX "store_shipping_locations_storeId_sortOrder_idx" ON "store_shipping_locations"("storeId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "store_shipping_locations_storeId_country_key" ON "store_shipping_locations"("storeId", "country");

-- AddForeignKey
ALTER TABLE "store_shipping_locations" ADD CONSTRAINT "store_shipping_locations_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
