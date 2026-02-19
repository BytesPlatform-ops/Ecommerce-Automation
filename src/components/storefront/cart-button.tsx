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
    
    // Extract username from pathname: /stores/[username] -> [username]
    const pathParts = pathname.split("/").filter(Boolean); // Remove empty strings
    const isStorePath = pathParts.length >= 2 && pathParts[0] === "stores";
    
    let shippingUrl: string;
    
    if (isStorePath) {
      // On main app with /stores/[username] path
      const username = pathParts[1];
      shippingUrl = `/stores/${username}/shipping?storeId=${items[0].storeId}`;
    } else {
      // On custom domain or root path - go directly to /shipping
      shippingUrl = `/shipping?storeId=${items[0].storeId}`;
    }
    
    console.log("[Checkout] Redirecting to:", shippingUrl, "from pathname:", pathname);
    router.push(shippingUrl);
  }

  return (
    <>
      {/* Cart Button */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="relative p-2.5 hover:bg-muted/80 rounded-xl transition-all duration-200"
        aria-label="Open cart"
      >
        <ShoppingBag className="h-[18px] w-[18px] text-foreground" strokeWidth={1.5} />
        {itemCount > 0 && (
          <span 
            className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm"
            style={{ backgroundColor: "var(--primary)", color: "white", animation: "scaleBounce 0.3s ease-out" }}
          >
            {itemCount > 99 ? "99" : itemCount}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isMounted && typeof window !== "undefined" && isCartOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] cart-overlay"
            onClick={() => setIsCartOpen(false)}
            style={{ overflowAnchor: 'none' }}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-screen w-full sm:max-w-[440px] bg-white z-[70] cart-drawer" style={{ overflowAnchor: 'none', boxShadow: '-8px 0 40px rgba(0,0,0,0.1)' }}>
            <div className="flex flex-col h-full" style={{ color: '#000000' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-900">Cart ({itemCount})</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
                {items.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
                      <ShoppingBag className="h-7 w-7 text-gray-300" strokeWidth={1} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Your cart is empty</p>
                    <p className="text-xs text-gray-500">Start adding items to your cart</p>
                  </div>
                ) : (
                  <div className="space-y-0 divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-4 py-5 first:pt-0">
                        {/* Image */}
                        <div className="cart-item-image relative w-[72px] h-[90px] bg-gray-50 shrink-0">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                              No img
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{item.name}</h3>
                          {item.variantInfo && (
                            <p className="text-xs text-gray-500 mb-1">{item.variantInfo}</p>
                          )}
                          <p className="text-sm text-gray-900 font-semibold">
                            ${item.price.toFixed(2)}
                          </p>

                          {/* Quantity */}
                          <div className="quantity-stepper mt-3">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                              className="px-3 py-2 hover:bg-gray-50 transition-colors duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center"
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            <span className="px-3 py-2 text-xs font-medium text-gray-900 min-w-[2.5rem] text-center border-x border-gray-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                              disabled={item.stock !== undefined && item.quantity >= item.stock}
                              className="px-3 py-2 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed min-w-[40px] min-h-[40px] flex items-center justify-center"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 self-start"
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
                <div className="border-t border-gray-100 px-6 py-6 space-y-5 shrink-0 bg-gray-50/50">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Subtotal</span>
                    <span className="text-xl font-serif tracking-tight text-gray-900">${total.toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full btn-luxury btn-primary-luxury !rounded-xl"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Checkout
                  </button>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors duration-300 py-1"
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