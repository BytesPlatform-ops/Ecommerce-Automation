"use client";

import { useState } from "react";
import { useCart } from "./cart-context";
import { useRouter } from "next/navigation";

type Variant = {
  id: string;
  sizeType: string | null;
  value: string | null;
  unit: string | null;
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

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addToCart(
      {
        ...product,
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
    <div className="space-y-6">
      {/* Variant Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {variantTypeLabel}
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
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
                  px-4 py-3 rounded-xl font-medium text-sm transition-all border-2
                  ${
                    isSelected
                      ? "border-current shadow-md scale-105"
                      : "border-gray-200 hover:border-gray-300"
                  }
                  ${isOutOfStock ? "opacity-40 cursor-not-allowed line-through" : ""}
                `}
                style={
                  isSelected
                    ? {
                        backgroundColor: "var(--primary)",
                        color: "white",
                        borderColor: "var(--primary)",
                      }
                    : {}
                }
              >
                {formatVariant(variant)}
              </button>
            );
          })}
        </div>
        
        {/* Stock info for selected variant */}
        {selectedVariant && (
          <p className="text-sm text-gray-600 mt-2">
            {selectedVariant.stock > 0 ? (
              <span className="text-green-600 font-medium">
                {selectedVariant.stock} units available
              </span>
            ) : (
              <span className="text-red-600 font-medium">Out of stock</span>
            )}
          </p>
        )}
      </div>

      {/* Quantity and Add to Cart */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Quantity Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Quantity:</span>
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={handleDecrease}
              className="px-4 py-2 hover:bg-gray-100 transition-colors font-bold text-gray-600"
            >
              −
            </button>
            <span className="px-6 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={!selectedVariant || quantity >= selectedVariant.stock}
              className="px-4 py-2 hover:bg-gray-100 transition-colors font-bold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          className="flex-1 px-8 py-4 rounded-xl font-bold text-lg text-white transition-all hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
