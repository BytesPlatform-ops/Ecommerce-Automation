"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
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
    <div className="space-y-3">
      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className={`w-full flex items-center justify-center gap-3 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-md ${
          isAdded ? "bg-green-600" : ""
        }`}
        style={isAdded ? {} : { backgroundColor: "var(--primary)" }}
      >
        {isAdded ? (
          <>
            <Check className="h-5 w-5" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </>
        )}
      </button>

      {/* Show if already in cart */}
      {existingItem && !isAdded && (
        <p className="text-sm text-gray-500 text-center">
          Already {existingItem.quantity} in cart
        </p>
      )}
    </div>
  );
}
