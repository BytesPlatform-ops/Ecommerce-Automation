"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, X, Trash2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useCart } from "./cart-context";
import { useRouter, usePathname } from "next/navigation";

export function CartButton() {
  const { items, getItemCount, getTotal, updateQuantity, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const itemCount = getItemCount();
  const total = getTotal();

  function handleCheckout() {
    if (items.length === 0) return;
    setIsCartOpen(false);
    const username = pathname.split("/")[2];
    const shippingUrl = `/stores/${username}/shipping?storeId=${items[0].storeId}`;
    router.push(shippingUrl);
  }

  return (
    <>
      {/* Cart Button */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 hover:bg-muted rounded-sm transition-colors duration-200"
        aria-label="Open cart"
      >
        <ShoppingBag className="h-[18px] w-[18px] text-foreground" strokeWidth={1.5} />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-foreground text-background text-[10px] font-medium flex items-center justify-center rounded-full">
            {itemCount > 99 ? "99" : itemCount}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isMounted && typeof window !== "undefined" && isCartOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-full sm:max-w-[420px] bg-background border-l border-border z-50 animate-slide-in-right">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <h2 className="text-overline !text-foreground">Cart ({itemCount})</h2>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-sm transition-colors duration-200"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="h-8 w-8 mx-auto text-border mb-4" strokeWidth={1} />
                    <p className="text-sm text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-0 divide-y divide-border">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-4 py-5 first:pt-0">
                        {/* Image */}
                        <div className="relative w-16 h-20 bg-muted overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
                              No img
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm text-foreground truncate mb-1">{item.name}</h3>
                          {item.variantInfo && (
                            <p className="text-xs text-muted-foreground mb-1">{item.variantInfo}</p>
                          )}
                          <p className="text-sm text-muted-foreground font-medium">
                            ${item.price.toFixed(2)}
                          </p>

                          {/* Quantity */}
                          <div className="flex items-center gap-0 mt-3 border border-border inline-flex">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="px-2.5 py-1 hover:bg-muted transition-colors duration-200"
                            >
                              <Minus className="h-3 w-3" strokeWidth={1.5} />
                            </button>
                            <span className="px-3 py-1 text-xs text-foreground min-w-[2rem] text-center border-x border-border">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-2.5 py-1 hover:bg-muted transition-colors duration-200"
                            >
                              <Plus className="h-3 w-3" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200 self-start"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-border px-6 py-5 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-overline">Total</span>
                    <span className="text-lg font-serif tracking-tight">${total.toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full btn-luxury btn-primary-luxury"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Checkout
                  </button>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors duration-300 py-1"
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
