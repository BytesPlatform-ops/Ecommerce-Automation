-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  "primaryHex" TEXT NOT NULL,
  "secondaryHex" TEXT NOT NULL,
  "fontFamily" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  "ownerId" TEXT NOT NULL,
  "subdomainSlug" TEXT UNIQUE NOT NULL,
  "storeName" TEXT NOT NULL,
  "aboutText" TEXT,
  "themeId" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("themeId") REFERENCES themes(id) ON DELETE SET NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("storeId") REFERENCES stores(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_stores_ownerId ON stores("ownerId");
CREATE INDEX idx_stores_themeId ON stores("themeId");
CREATE INDEX idx_products_storeId ON products("storeId");

-- Insert a default theme for testing
INSERT INTO themes (id, name, "primaryHex", "secondaryHex", "fontFamily", "createdAt")
VALUES (
  'default-theme-1',
  'Default',
  '#3B82F6',
  '#1F2937',
  'Inter',
  NOW()
);
