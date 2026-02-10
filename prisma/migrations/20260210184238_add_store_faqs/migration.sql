-- CreateTable
CREATE TABLE "store_faqs" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_faqs_storeId_idx" ON "store_faqs"("storeId");

-- CreateIndex
CREATE INDEX "store_faqs_storeId_sortOrder_idx" ON "store_faqs"("storeId", "sortOrder");

-- AddForeignKey
ALTER TABLE "store_faqs" ADD CONSTRAINT "store_faqs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
