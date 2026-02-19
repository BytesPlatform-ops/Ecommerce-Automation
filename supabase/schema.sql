-- Bytescart Store Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- THEMES TABLE
-- Pre-built theme presets
-- ============================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  primary_hex TEXT NOT NULL,
  secondary_hex TEXT NOT NULL,
  accent_hex TEXT NOT NULL,
  background_hex TEXT NOT NULL,
  text_hex TEXT NOT NULL,
  font_family TEXT NOT NULL
);

-- ============================================
-- STORES TABLE
-- Each user can have one store
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  subdomain_slug TEXT NOT NULL UNIQUE,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  about_text TEXT,
  
  CONSTRAINT subdomain_slug_format CHECK (subdomain_slug ~ '^[a-z0-9-]+$')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_subdomain_slug ON stores(subdomain_slug);

-- ============================================
-- PRODUCTS TABLE
-- Products belong to a store
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- THEMES: Anyone can read (public), no one can modify via API
CREATE POLICY "Themes are viewable by everyone"
  ON themes FOR SELECT
  USING (true);

-- STORES: Public can read, owners can modify their own
CREATE POLICY "Stores are viewable by everyone"
  ON stores FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own store"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own store"
  ON stores FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own store"
  ON stores FOR DELETE
  USING (auth.uid() = owner_id);

-- PRODUCTS: Public can read, store owners can modify
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Store owners can create products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update their products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete their products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );
