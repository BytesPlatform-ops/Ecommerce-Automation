"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-context";

export function MobileCartBar() {
  const { items, getItemCount, getTotal, setIsCartOpen, isCartOpen } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const itemCount = getItemCount();
  const total = getTotal();

  useEffect(() => {
    if (itemCount > 0) {
      // Small delay so the slide-up animation is visible
      const timer = setTimeout(() => {
        setIsVisible(true);
        if (!hasAnimated) setHasAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setHasAnimated(false);
    }
  }, [itemCount, hasAnimated]);

  // Don't render at all if no items or cart is open
  if ((itemCount === 0 && !isVisible) || isCartOpen) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="px-4 pb-4 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className={`
            w-full flex items-center justify-between
            rounded-2xl px-5 py-4
            shadow-[0_8px_30px_rgba(0,0,0,0.2)]
            transition-all duration-500 ease-out
            active:scale-[0.98]
            ${isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
          `}
          style={{
            backgroundColor: "var(--primary, #1A1A1A)",
            color: "white",
          }}
          aria-label={`View cart with ${itemCount} items`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <span
                className="absolute -top-2 -right-2 h-[18px] min-w-[18px] px-1 text-[10px] font-bold flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: "white",
                  color: "var(--primary, #1A1A1A)",
                }}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            </div>
            <span className="text-sm font-semibold tracking-wide">
              View Cart
            </span>
          </div>

          <span className="text-sm font-semibold">
            ${total.toFixed(2)}
          </span>
        </button>
      </div>
    </div>
  );
}
