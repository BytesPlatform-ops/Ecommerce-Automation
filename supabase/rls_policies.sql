-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Apply these policies in your Supabase SQL Editor.
-- These ensure that even if someone bypasses your application layer,
-- the database itself enforces access control.
--
-- NOTE: Your application uses Prisma with a direct DATABASE_URL connection,
-- which BYPASSES RLS by default (Prisma connects as the database owner).
-- These RLS policies protect against:
--   1. Direct Supabase client access (e.g., if anon key is used client-side)
--   2. Defense-in-depth if your application layer is compromised
--   3. Any future Supabase SDK usage in the app
-- ============================================================================

-- ============================================================================
-- STEP 1: Enable RLS on all tables
-- ============================================================================

ALTER TABLE "themes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "store_faqs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "store_privacy_sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "store_shipping_returns_sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "store_testimonials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;

-- Force RLS even for the table owner (optional but recommended)
ALTER TABLE "themes" FORCE ROW LEVEL SECURITY;
ALTER TABLE "stores" FORCE ROW LEVEL SECURITY;
ALTER TABLE "products" FORCE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "product_images" FORCE ROW LEVEL SECURITY;
ALTER TABLE "store_faqs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "store_privacy_sections" FORCE ROW LEVEL SECURITY;
ALTER TABLE "store_shipping_returns_sections" FORCE ROW LEVEL SECURITY;
ALTER TABLE "store_testimonials" FORCE ROW LEVEL SECURITY;
ALTER TABLE "orders" FORCE ROW LEVEL SECURITY;
ALTER TABLE "order_items" FORCE ROW LEVEL SECURITY;


-- ============================================================================
-- STEP 2: THEMES — Public read-only (themes are shared/global)
-- ============================================================================

CREATE POLICY "themes_public_read" ON "themes"
  FOR SELECT
  USING (true);

-- No INSERT/UPDATE/DELETE policies for anon/authenticated — admin only


-- ============================================================================
-- STEP 3: STORES — Public read, owner-only write
-- ============================================================================

-- Anyone can view store info (needed for storefront rendering)
CREATE POLICY "stores_public_read" ON "stores"
  FOR SELECT
  USING (true);

-- Only the owner can insert their own store
CREATE POLICY "stores_owner_insert" ON "stores"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "ownerId");

-- Only the owner can update their store
CREATE POLICY "stores_owner_update" ON "stores"
  FOR UPDATE
  USING (auth.uid()::text = "ownerId")
  WITH CHECK (auth.uid()::text = "ownerId");

-- Only the owner can delete their store
CREATE POLICY "stores_owner_delete" ON "stores"
  FOR DELETE
  USING (auth.uid()::text = "ownerId");


-- ============================================================================
-- STEP 4: PRODUCTS — Public read, store-owner-only write
-- ============================================================================

-- Anyone can view products (storefront)
CREATE POLICY "products_public_read" ON "products"
  FOR SELECT
  USING (true);

-- Only the store owner can insert products
CREATE POLICY "products_owner_insert" ON "products"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "products"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

-- Only the store owner can update products
CREATE POLICY "products_owner_update" ON "products"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "products"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

-- Only the store owner can delete products
CREATE POLICY "products_owner_delete" ON "products"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "products"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );


-- ============================================================================
-- STEP 5: PRODUCT VARIANTS — Public read, store-owner-only write
-- ============================================================================

CREATE POLICY "product_variants_public_read" ON "product_variants"
  FOR SELECT
  USING (true);

CREATE POLICY "product_variants_owner_insert" ON "product_variants"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "products" 
      JOIN "stores" ON "stores"."id" = "products"."storeId"
      WHERE "products"."id" = "product_variants"."productId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "product_variants_owner_update" ON "product_variants"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "products" 
      JOIN "stores" ON "stores"."id" = "products"."storeId"
      WHERE "products"."id" = "product_variants"."productId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "product_variants_owner_delete" ON "product_variants"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "products" 
      JOIN "stores" ON "stores"."id" = "products"."storeId"
      WHERE "products"."id" = "product_variants"."productId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );


-- ============================================================================
-- STEP 6: PRODUCT IMAGES — Public read, store-owner-only write
-- ============================================================================

CREATE POLICY "product_images_public_read" ON "product_images"
  FOR SELECT
  USING (true);

CREATE POLICY "product_images_owner_insert" ON "product_images"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "products" 
      JOIN "stores" ON "stores"."id" = "products"."storeId"
      WHERE "products"."id" = "product_images"."productId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "product_images_owner_update" ON "product_images"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "products" 
      JOIN "stores" ON "stores"."id" = "products"."storeId"
      WHERE "products"."id" = "product_images"."productId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "product_images_owner_delete" ON "product_images"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "products" 
      JOIN "stores" ON "stores"."id" = "products"."storeId"
      WHERE "products"."id" = "product_images"."productId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );


-- ============================================================================
-- STEP 7: STORE FAQs — Public read (published only), owner-only write
-- ============================================================================

CREATE POLICY "store_faqs_public_read" ON "store_faqs"
  FOR SELECT
  USING ("isPublished" = true);

-- Store owners can see all their FAQs (including unpublished)
CREATE POLICY "store_faqs_owner_read" ON "store_faqs"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_faqs"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "store_faqs_owner_insert" ON "store_faqs"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_faqs"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "store_faqs_owner_update" ON "store_faqs"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_faqs"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "store_faqs_owner_delete" ON "store_faqs"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_faqs"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );


-- ============================================================================
-- STEP 8: STORE PRIVACY SECTIONS — Public read, owner-only write
-- ============================================================================

CREATE POLICY "store_privacy_sections_public_read" ON "store_privacy_sections"
  FOR SELECT
  USING (true);

CREATE POLICY "store_privacy_sections_owner_insert" ON "store_privacy_sections"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_privacy_sections"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "store_privacy_sections_owner_update" ON "store_privacy_sections"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_privacy_sections"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "store_privacy_sections_owner_delete" ON "store_privacy_sections"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_privacy_sections"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );


-- ============================================================================
-- STEP 9: STORE SHIPPING/RETURNS — Public read, owner-only write
-- ============================================================================

CREATE POLICY "store_shipping_returns_public_read" ON "store_shipping_returns_sections"
  FOR SELECT
  USING (true);

CREATE POLICY "store_shipping_returns_owner_insert" ON "store_shipping_returns_sections"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_shipping_returns_sections"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "store_shipping_returns_owner_update" ON "store_shipping_returns_sections"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_shipping_returns_sections"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "store_shipping_returns_owner_delete" ON "store_shipping_returns_sections"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_shipping_returns_sections"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );


-- ============================================================================
-- STEP 10: STORE TESTIMONIALS — Public read (published only), owner-only write
-- ============================================================================

CREATE POLICY "store_testimonials_public_read" ON "store_testimonials"
  FOR SELECT
  USING ("isPublished" = true);

CREATE POLICY "store_testimonials_owner_read" ON "store_testimonials"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_testimonials"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "store_testimonials_owner_insert" ON "store_testimonials"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_testimonials"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "store_testimonials_owner_update" ON "store_testimonials"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_testimonials"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "store_testimonials_owner_delete" ON "store_testimonials"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "store_testimonials"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );


-- ============================================================================
-- STEP 11: ORDERS — Owner-only (store owner sees their store's orders)
-- ============================================================================

-- Store owners can view their orders
CREATE POLICY "orders_owner_read" ON "orders"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "orders"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

-- Orders are created by the system (webhook/server), not directly by users.
-- The service role or Prisma direct connection handles inserts.
-- No anon/authenticated INSERT policy needed.

-- Store owners can update order status (e.g., mark as shipped)
CREATE POLICY "orders_owner_update" ON "orders"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "stores" 
      WHERE "stores"."id" = "orders"."storeId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );


-- ============================================================================
-- STEP 12: ORDER ITEMS — Owner-only (same as orders)
-- ============================================================================

CREATE POLICY "order_items_owner_read" ON "order_items"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "orders" 
      JOIN "stores" ON "stores"."id" = "orders"."storeId"
      WHERE "orders"."id" = "order_items"."orderId" 
      AND "stores"."ownerId" = auth.uid()::text
    )
  );

-- No direct INSERT/UPDATE/DELETE for order items by authenticated users
