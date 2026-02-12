-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('StoreCreated', 'StoreUpdated', 'DomainUpdated', 'DomainStatusChanged', 'ProductCreated', 'ProductUpdated', 'ProductDeleted', 'StripeConnected', 'StripeDisconnected', 'OrderCreated', 'OrderStatusChanged', 'OrderShipped', 'FaqCreated', 'FaqUpdated', 'FaqDeleted', 'TestimonialCreated', 'TestimonialUpdated', 'TestimonialDeleted', 'PrivacySectionCreated', 'PrivacySectionUpdated', 'PrivacySectionDeleted', 'ShippingSectionCreated', 'ShippingSectionUpdated', 'ShippingSectionDeleted', 'LoginSuccess', 'LoginFailed', 'SignOut', 'CheckoutCreated', 'WebhookProcessed');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorId" TEXT,
    "storeId" TEXT,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_storeId_idx" ON "audit_logs"("storeId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_resourceId_idx" ON "audit_logs"("resourceType", "resourceId");
