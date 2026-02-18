"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  productId: string;
  variantId?: string;
  variantInfo?: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock?: number;
  storeId: string;
  storeSlug: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  addToCart: (product: { id: string; name: string; price: number; imageUrl: string | null; variantId?: string; variantInfo?: string; stock?: number }, quantity: number, storeId: string, storeSlug: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
  getStoreId: () => string | null;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "ecommerce-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed);
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      // Dispatch custom event to notify other components of cart changes
      const event = new CustomEvent("cartUpdated", { detail: { items } });
      window.dispatchEvent(event);
    }
  }, [items, isHydrated]);

  function addItem(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
    setItems((prev) => {
      // Check if cart has items from a different store
      if (prev.length > 0 && prev[0].storeId !== item.storeId) {
        // Clear cart and add new item (can only buy from one store at a time)
        return [{ ...item, quantity: item.quantity || 1 }];
      }

      // For products with variants, check both productId and variantId
      const matchKey = item.variantId 
        ? (i: CartItem) => i.productId === item.productId && i.variantId === item.variantId
        : (i: CartItem) => i.productId === item.productId && !i.variantId;
      
      const existing = prev.find(matchKey);
      if (existing) {
        const newQty = existing.quantity + (item.quantity || 1);
        const cappedQty = item.stock !== undefined ? Math.min(newQty, item.stock) : newQty;
        return prev.map((i) =>
          matchKey(i)
            ? { ...i, quantity: cappedQty, stock: item.stock ?? i.stock }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }

  function addToCart(
    product: { 
      id: string; 
      name: string; 
      price: number; 
      imageUrl: string | null; 
      variantId?: string; 
      variantInfo?: string;
      stock?: number;
    }, 
    quantity: number,
    storeId: string,
    storeSlug: string
  ) {
    addItem({
      productId: product.id,
      variantId: product.variantId,
      variantInfo: product.variantInfo,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      storeId,
      storeSlug,
      quantity,
    });
  }

  function removeItem(productId: string, variantId?: string) {
    setItems((prev) => {
      if (variantId) {
        return prev.filter((i) => !(i.productId === productId && i.variantId === variantId));
      }
      return prev.filter((i) => i.productId !== productId);
    });
  }

  function updateQuantity(productId: string, quantity: number, variantId?: string) {
    if (quantity < 1) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (variantId) {
          if (i.productId === productId && i.variantId === variantId) {
            const capped = i.stock !== undefined ? Math.min(quantity, i.stock) : quantity;
            return { ...i, quantity: capped };
          }
          return i;
        }
        if (i.productId === productId) {
          const capped = i.stock !== undefined ? Math.min(quantity, i.stock) : quantity;
          return { ...i, quantity: capped };
        }
        return i;
      })
    );
  }

  function clearCart() {
    setItems([]);
  }

  function getItemCount() {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getTotal() {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function getStoreId() {
    return items.length > 0 ? items[0].storeId : null;
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getTotal,
        getStoreId,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
