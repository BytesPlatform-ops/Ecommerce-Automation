"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { useCart } from "./cart-context";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
  storeId: string;
  storeSlug: string;
  stock?: number;
}

export function AddToCartButton({ product, storeId, storeSlug, stock = 0 }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = stock === 0;

  const existingItem = items.find((i) => i.productId === product.id && !i.variantId);

  function handleAddToCart() {
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      storeId,
      storeSlug,
      stock,
      quantity,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Quantity stepper */}
      {!isOutOfStock && (
        <div className="flex items-center gap-1.5 sm:gap-4">
          <span className="text-overline text-[10px] sm:text-sm">Qty</span>
          <div className="flex items-center border border-border rounded-md">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-1.5 py-1 sm:px-3.5 sm:py-2.5 hover:bg-muted transition-colors duration-200 text-muted-foreground min-w-[28px] min-h-[28px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
            >
              <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={1.5} />
            </button>
            <span className="px-1 py-1 sm:px-4 sm:py-2.5 text-[11px] sm:text-sm text-foreground min-w-[1.5rem] sm:min-w-[3rem] text-center border-x border-border">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              disabled={quantity >= stock}
              className="px-1.5 py-1 sm:px-3.5 sm:py-2.5 hover:bg-muted transition-colors duration-200 text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed min-w-[28px] min-h-[28px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
            >
              <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`w-full btn-luxury transition-all duration-300 ${
          isOutOfStock
            ? "opacity-50 cursor-not-allowed"
            : isAdded
            ? "bg-foreground text-background"
            : "btn-primary-luxury"
        }`}
        style={isAdded ? {} : { backgroundColor: isOutOfStock ? undefined : "var(--primary)" }}
      >
        {isOutOfStock ? (
          "Out of Stock"
        ) : isAdded ? (
          <>
            <Check className="h-4 w-4" strokeWidth={1.5} />
            Added
          </>
        ) : (
          "Add to Cart"
        )}
      </button>

      {isOutOfStock && (
        <p className="text-xs text-red-600 text-center font-medium">
          Out of stock
        </p>
      )}

      {existingItem && !isAdded && !isOutOfStock && (
        <p className="text-xs text-muted-foreground text-center">
          {existingItem.quantity} in cart
        </p>
      )}
    </div>
  );
}
