// Type-safe GA4 event tracking helpers.
// All functions no-op safely during SSR (window is undefined on server).

declare global {
  interface Window {
    gtag: (
      command: "event" | "js" | "config" | "set",
      action: string | Date,
      params?: Record<string, unknown>,
    ) => void;
  }
}

function safeGtag(action: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function")
    return;
  window.gtag("event", action, params);
}

/** Fired when a user completes sign-up */
export function trackSignup(userId: string) {
  safeGtag("sign_up", { method: "website", user_id: userId });
  safeGtag("store_created", { user_id: userId });
}

/** Fired when a product is added to the store catalog */
export function trackProductAdded(productId: string) {
  safeGtag("add_to_catalog", { product_id: productId });
}

/** Fired when a user initiates a Pro plan checkout */
export function trackProPayment(value = 49.99) {
  safeGtag("begin_checkout", {
    currency: "USD",
    value,
    page_location:
      typeof window !== "undefined" ? window.location.pathname : "",
  });
}

/** Fired after a successful Stripe subscription payment is confirmed */
export function trackPurchase(transactionId: string, amount: number) {
  safeGtag("purchase", {
    transaction_id: transactionId,
    value: amount,
    currency: "USD",
  });
}

/** Fired when a user clicks the View Demo Store button */
export function trackViewDemoStore() {
  safeGtag("view_demo_store", {
    page_location:
      typeof window !== "undefined" ? window.location.pathname : "",
  });
}
