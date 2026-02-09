"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, X, Trash2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useCart } from "./cart-context";
import { useRouter, usePathname } from "next/navigation";

export function CartButton() {
  const { items, getItemCount, getTotal, updateQuantity, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Only render drawer after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const itemCount = getItemCount();
  const total = getTotal();

  function handleCheckout() {
    if (items.length === 0) return;

    // Navigate to shipping page instead of directly to checkout
    setIsCartOpen(false);
    const username = pathname.split("/")[2]; // Get username from pathname
    const shippingUrl = `/stores/${username}/shipping?storeId=${items[0].storeId}`;
    console.log("Navigating to:", shippingUrl);
    router.push(shippingUrl);
  }

  return (
    <>
      {/* Cart Button */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="relative p-1.5 sm:p-2 rounded-lg hover:bg-black/10 transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
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
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-50"
            style={{
              transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 300ms ease-in-out",
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <h2 className="text-base sm:text-lg font-semibold">Your Cart ({itemCount})</h2>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="relative w-16 sm:w-20 h-16 sm:h-20 bg-white rounded-lg overflow-hidden shrink-0">
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
                          <h3 className="font-medium text-xs sm:text-sm truncate">{item.name}</h3>
                          <p className="text-xs sm:text-sm font-bold mt-1" style={{ color: "var(--primary)" }}>
                            ${item.price.toFixed(2)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 sm:gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-0.5 sm:p-1 hover:bg-gray-200 rounded"
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <span className="text-xs sm:text-sm w-6 sm:w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-0.5 sm:p-1 hover:bg-gray-200 rounded"
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-0.5 sm:p-1 text-gray-400 hover:text-red-500"
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
                <div className="border-t p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-semibold">Total</span>
                    <span className="text-xl sm:text-2xl font-bold">${total.toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full py-3 sm:py-4 rounded-xl font-semibold text-white text-sm sm:text-base flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700"
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
