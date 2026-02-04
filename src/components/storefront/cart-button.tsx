"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, X, Trash2, Minus, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "./cart-context";

export function CartButton() {
  const { items, getItemCount, getTotal, updateQuantity, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Only render drawer after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const itemCount = getItemCount();
  const total = getTotal();

  async function handleCheckout() {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: items[0].storeId,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        {/* Clear cart before redirecting */}
        clearCart();
        setIsCartOpen(false);
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <>
      {/* Cart Button */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 rounded-lg hover:bg-black/10 transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>

      {/* Cart Drawer Overlay and Drawer - Portal to body */}
      {isMounted && typeof window !== "undefined" && isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsCartOpen(false)}
          />
          <div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50"
            style={{
              transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 300ms ease-in-out",
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Your Cart ({itemCount})</h2>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No image
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          <p className="text-sm font-bold mt-1" style={{ color: "var(--primary)" }}>
                            ${item.price.toFixed(2)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t p-4 space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
