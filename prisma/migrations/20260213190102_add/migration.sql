-- CreateIndex
CREATE INDEX "stores_domainStatus_idx" ON "stores"("domainStatus");

-- CreateIndex
CREATE INDEX "stores_domainStatus_domain_idx" ON "stores"("domainStatus", "domain");
