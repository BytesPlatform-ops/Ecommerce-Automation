# Product Variants & Descriptions Implementation Guide

## Overview
This guide explains the new product variant system that allows you to add flexible sizing, volume descriptions, and product details to your store.

## What's New

### 1. **Product Descriptions**
- Each product now has an optional description field
- Supports rich text with line breaks and formatting
- Displays on the product detail page in the storefront
- Can be up to 5000+ characters

### 2. **Product Variants System**
A flexible system for managing different sizes, volumes, and variations of products:

#### Variant Components:
- **Size Type**: Category that determines what units are available
- **Value**: Numeric or string value (e.g., "500" for 500ml)
- **Unit**: Measurement unit (ml, L, XS, S, M, L, XL, cm, etc.)
- **Stock**: Available inventory for this specific variant

#### Available Size Types:
| Type | Use Case | Example Units |
|------|----------|---------------|
| **VOLUME** | Liquids, beverages | ml, L |
| **WEIGHT** | Products by weight | g, kg |
| **APPAREL_ALPHA** | Clothing sizes | XS, S, M, L, XL, XXL |
| **APPAREL_NUMERIC** | Jeans, pants | 28, 30, 32, 34, 36, 38, 40, 42 |
| **FOOTWEAR** | Shoes | US 6, US 7, US 8... US 13 |
| **DIMENSION** | Measurements | cm, m, in, ft |
| **COUNT** | Quantity packs | pcs, pack |
| **STORAGE** | Digital storage | GB, TB |

## How to Use

### Adding a Product with Variants

#### Step 1: Create/Edit Product
1. Go to Dashboard → Products → Add Product
2. **Fill Basic Info:**
   - Product Name (required)
   - Description (optional) - Write detailed product info here
   - Price (required)
   - Product Image (optional)

#### Step 2: Add Variants
1. Click the **"Add Variant"** button
2. **Select Size Type** based on product:
   - Liquid product? Choose **VOLUME**
   - Clothing item? Choose **APPAREL_ALPHA** or **APPAREL_NUMERIC**
   - Shoe? Choose **FOOTWEAR**
   - etc.

3. **Fill in Details:**
   - **Value**: Optional - numeric value (e.g., "500" for 500ml)
   - **Unit**: Select from dropdown based on Size Type
   - **Stock**: How many units available for this variant

#### Step 3: Examples

**Example 1: Coffee Bottle (VOLUME)**
```
Type: VOLUME
Value: 500
Unit: ML
Stock: 25
→ Display: "500 ml"
```

**Example 2: T-Shirt (APPAREL_ALPHA)**
```
Type: APPAREL_ALPHA
Value: (leave empty)
Unit: M
Stock: 10
→ Display: "M"
```

**Example 3: Jeans (APPAREL_NUMERIC)**
```
Type: APPAREL_NUMERIC
Value: (leave empty)
Unit: 32
Stock: 8
→ Display: "32"
```

**Example 4: Running Shoe (FOOTWEAR)**
```
Type: FOOTWEAR
Value: (leave empty)
Unit: US 10
Stock: 5
→ Display: "US 10"
```

### Managing Variants
- Edit existing variants by editing the product
- Remove variants with the trash icon
- Variants can be added/removed/updated at any time
- Stock levels are managed per variant

## Customer Experience

### Product Page Display
1. **Description**: Shows your detailed product description at the top
2. **Variant Selector**: Displays all available variants as buttons
   - Label shows "Size", "Volume", "Shoe Size", etc. (auto-determined)
   - Out-of-stock variants appear dimmed
   - Stock count shows below the selector
3. **Quantity**: Customer selects how many to buy
4. **Add to Cart**: Adds the selected variant to cart

### Shopping Features
- Different variants of same product are tracked separately in cart
- Stock limit enforced per variant
- Variant info (size, volume, etc.) saved with order

## Database Schema

### New Enums
```prisma
enum SizeType {
  VOLUME
  WEIGHT
  APPAREL_ALPHA
  APPAREL_NUMERIC
  FOOTWEAR
  DIMENSION
  COUNT
  STORAGE
}

enum Unit {
  // Volume: ML, L
  // Weight: G, KG
  // Apparel: XS, S, M, L_SIZE, XL, XXL
  // Numeric: SIZE_28 through SIZE_42
  // Footwear: US_6 through US_13
  // Dimension: CM, METER, INCH, FEET
  // Count: PCS, PACK
  // Storage: GB, TB
}
```

### New Relations
- **Product** now has:
  - `description: String?` (Text field, supports line breaks)
  - `variants: ProductVariant[]` (One-to-many relationship)

- **ProductVariant** (New Model):
  - `id`: Unique identifier
  - `productId`: Reference to product
  - `sizeType`: Category of variant
  - `value`: Numeric/string value
  - `unit`: Measurement unit
  - `stock`: Inventory count
  - `createdAt/updatedAt`: Timestamps

- **OrderItem** updated:
  - `variantId?`: Reference to specific variant
  - `variantInfo?`: Snapshot of variant details (e.g., "500 ml")

## API Changes

### Creating a Product
```typescript
const result = await createProduct(storeId, {
  name: "Product Name",
  description: "Product description", // NEW
  price: 29.99,
  imageUrl: "...",
  variants: [ // NEW
    {
      sizeType: "VOLUME",
      value: "500",
      unit: "ML",
      stock: 25
    }
  ]
});
```

### Updating a Product
```typescript
await updateProduct(productId, {
  name: "Updated Name",
  description: "Updated description", // NEW
  price: 39.99,
  imageUrl: "...",
  variants: [ // NEW - replaces all variants
    {
      sizeType: "VOLUME",
      value: "1",
      unit: "L",
      stock: 15
    }
  ]
});
```

## Component Changes

### New Component: ProductVariantSelector
- Location: `src/components/storefront/product-variant-selector.tsx`
- Handles variant selection UI
- Manages quantity for selected variant
- Integrates with cart system

### Updated Components:
- **ProductForm**: Now includes description and variant management
- **CartContext**: Enhanced to track variants separately
- **ProductDetailPage**: Shows description and variant selector

## Migration Info
- Migration applied: `20260205231834_add_product_variants`
- Existing products still work (variants are optional)
- No data loss - all previous product info preserved
- Description field is optional for backward compatibility

## Tips & Best Practices

### 1. **Descriptions**
- Be detailed but concise
- Include key features, benefits, and specifications
- Use line breaks for readability
- Mention any important care instructions

### 2. **Variants**
- Create a variant for EVERY size/option available
- Update stock regularly
- Use consistent naming (e.g., always "US" for shoe sizes)
- Group similar variants together

### 3. **Pricing**
- Price is per product, not per variant
- All variants of a product share the same price
- Consider different variant sizes when setting price

### 4. **Stock Management**
- Track stock per variant separately
- Sync with physical inventory regularly
- Set stock to 0 for discontinued variants (don't delete)

## Troubleshooting

### Variants Don't Show in Checkout
- Verify stock > 0 for variants
- Check that variant was properly saved
- Clear browser cache

### Unit Dropdown Empty
- Make sure Size Type is selected first
- Different size types have different available units
- Can't mix units across types

### Missing Description on Product Page
- Description is optional - if left blank, generic text shows
- Check that description was saved when editing
- Refresh page to see latest version

## Future Enhancements
- Variant-specific pricing
- Variant galleries (different images per size)
- Bulk variant import/export
- Variant rebalancing tools
- Size recommendations
