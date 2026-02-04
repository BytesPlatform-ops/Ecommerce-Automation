"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);
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
      quantity,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
        <div className="flex items-center border border-gray-300 rounded-lg w-fit">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

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
