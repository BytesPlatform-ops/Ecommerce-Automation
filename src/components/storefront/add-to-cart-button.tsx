"use client";

import { useState } from "react";
import { Check } from "lucide-react";
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
  const isOutOfStock = stock === 0;

  const existingItem = items.find((i) => i.productId === product.id);

  function handleAddToCart() {
    if (isOutOfStock) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      storeId,
      storeSlug,
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }

  return (
    <div className="space-y-2">
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
