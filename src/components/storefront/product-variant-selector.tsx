"use client";

import { useState } from "react";
import { useCart } from "./cart-context";
import { useRouter } from "next/navigation";

type Variant = {
  id: string;
  sizeType: string | null;
  value: string | null;
  unit: string | null;
  price: number | string | null;
  stock: number;
};

interface ProductVariantSelectorProps {
  variants: Variant[];
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
  storeId: string;
  storeSlug: string;
}

// Helper function to format variant display
function formatVariant(variant: Variant): string {
  const parts = [];
  
  if (variant.value) {
    parts.push(variant.value);
  }
  
  if (variant.unit) {
    // Format unit for display
    const unitLabel = variant.unit
      .replace("L_SIZE", "L")
      .replace("SIZE_", "")
      .replace("US_", "US ");
    parts.push(unitLabel);
  }
  
  return parts.join(" ");
}

// Helper function to get variant type label
function getVariantTypeLabel(sizeType: string | null): string {
  if (!sizeType) return "Size";
  
  const labels: Record<string, string> = {
    VOLUME: "Volume",
    WEIGHT: "Weight",
    APPAREL_ALPHA: "Size",
    APPAREL_NUMERIC: "Size",
    FOOTWEAR: "Shoe Size",
    DIMENSION: "Dimension",
    COUNT: "Quantity",
    STORAGE: "Storage",
  };
  
  return labels[sizeType] || "Size";
}

// Helper function to get the effective price (variant price or product price)
function getEffectivePrice(variantPrice: number | string | null, productPrice: number): number {
  if (variantPrice !== null && variantPrice !== undefined && variantPrice !== "") {
    const price = typeof variantPrice === "string" ? parseFloat(variantPrice) : variantPrice;
    return isNaN(price) ? productPrice : price;
  }
  return productPrice;
}

export function ProductVariantSelector({
  variants,
  product,
  storeId,
  storeSlug,
}: ProductVariantSelectorProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const variantTypeLabel = getVariantTypeLabel(selectedVariant?.sizeType || null);
  const effectivePrice = selectedVariant ? getEffectivePrice(selectedVariant.price, product.price) : product.price;

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addToCart(
      {
        ...product,
        price: effectivePrice,
        variantId: selectedVariant.id,
        variantInfo: formatVariant(selectedVariant),
      },
      quantity,
      storeId,
      storeSlug
    );

    // Optional: Show success message or navigate to cart
    router.refresh();
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity(quantity + 1);
    }
  };

  if (variants.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* Variant Selector */}
      <div>
        <label className="text-overline mb-4 block" style={{ color: "var(--primary)" }}>
          {variantTypeLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isSelected = variant.id === selectedVariantId;
            const isOutOfStock = variant.stock === 0;
            
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => !isOutOfStock && setSelectedVariantId(variant.id)}
                disabled={isOutOfStock}
                className={`
                  px-5 py-2.5 text-sm tracking-wide transition-all duration-200 border
                  ${
                    isSelected
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground"
                  }
                  ${isOutOfStock ? "opacity-30 cursor-not-allowed line-through" : ""}
                `}
              >
                {formatVariant(variant)}
              </button>
            );
          })}
        </div>
        
        {/* Stock info */}
        {selectedVariant && (
          <p className="text-xs text-muted-foreground mt-3">
            {selectedVariant.stock > 0 ? (
              <span>{selectedVariant.stock} in stock</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>
        )}
      </div>

      {/* Price Display */}
      {selectedVariant && (
        <div>
          <p 
            className="text-xl sm:text-2xl font-medium"
            style={{ color: "var(--primary)" }}
          >
            ${effectivePrice.toFixed(2)}
          </p>
          {selectedVariant.price && selectedVariant.price !== null && selectedVariant.price !== "" ? (
            <p className="text-xs text-muted-foreground mt-1">
              Variant-specific price
            </p>
          ) : null}
        </div>
      )}

      {/* Quantity and Add to Cart */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Quantity */}
        <div className="flex items-center gap-4">
          <span className="text-overline">Qty</span>
          <div className="flex items-center border border-border">
            <button
              type="button"
              onClick={handleDecrease}
              className="px-3.5 py-2.5 hover:bg-muted transition-colors duration-200 text-muted-foreground"
            >
              −
            </button>
            <span className="px-4 py-2.5 text-sm text-foreground min-w-[3rem] text-center border-x border-border">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={!selectedVariant || quantity >= selectedVariant.stock}
              className="px-3.5 py-2.5 hover:bg-muted transition-colors duration-200 text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          className="flex-1 btn-luxury btn-primary-luxury disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
