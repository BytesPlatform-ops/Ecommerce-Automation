-- CreateTable
CREATE TABLE "store_testimonials" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_testimonials_storeId_idx" ON "store_testimonials"("storeId");

-- CreateIndex
CREATE INDEX "store_testimonials_storeId_sortOrder_idx" ON "store_testimonials"("storeId", "sortOrder");

-- AddForeignKey
ALTER TABLE "store_testimonials" ADD CONSTRAINT "store_testimonials_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
