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
}

export function AddToCartButton({ product, storeId, storeSlug }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const existingItem = items.find((i) => i.productId === product.id);

  function handleAddToCart() {
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
        className={`w-full btn-luxury transition-all duration-300 ${
          isAdded 
            ? "bg-foreground text-background" 
            : "btn-primary-luxury"
        }`}
        style={isAdded ? {} : { backgroundColor: "var(--primary)" }}
      >
        {isAdded ? (
          <>
            <Check className="h-4 w-4" strokeWidth={1.5} />
            Added
          </>
        ) : (
          "Add to Cart"
        )}
      </button>

      {existingItem && !isAdded && (
        <p className="text-xs text-muted-foreground text-center">
          {existingItem.quantity} in cart
        </p>
      )}
    </div>
  );
}
