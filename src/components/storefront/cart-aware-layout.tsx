"use client";

import { useCart } from "./cart-context";
import { useEffect, useState } from "react";

export function CartAwareLayout({ children }: { children: React.ReactNode }) {
  const { isCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isCartOpen) {
      // Prevent body scroll
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable body scroll
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isCartOpen, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
