-- CreateIndex
CREATE INDEX "products_storeId_deletedAt_idx" ON "products"("storeId", "deletedAt");
