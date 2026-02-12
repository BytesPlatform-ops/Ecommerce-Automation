"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, X } from "lucide-react";

/**
 * Handles checkout success callback
 * Verifies the session and creates order if it doesn't exist
 */
function CheckoutSuccessHandlerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");
    const storeId = searchParams.get("store_id");

    if (checkout === "success" && sessionId && storeId) {
      verifySession(sessionId, storeId);
    }
  }, [searchParams]);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (status === "success" && !dismissed) {
      const dismissTimer = setTimeout(() => {
        setDismissed(true);
      }, 4000);

      return () => clearTimeout(dismissTimer);
    }
  }, [status, dismissed]);

  async function verifySession(sessionId: string, storeId: string) {
    setStatus("verifying");
    setMessage("Processing your order...");

    try {
      const response = await fetch("/api/payments/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, storeId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setMessage("Order confirmed! Thank you for your purchase.");
        
        // Clean up URL after notification is dismissed
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("checkout");
          url.searchParams.delete("session_id");
          url.searchParams.delete("store_id");
          router.replace(url.pathname);
        }, 5000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to verify order");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("Failed to verify order. Please contact support.");
    }
  }

  if (!status || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    url.searchParams.delete("session_id");
    url.searchParams.delete("store_id");
    router.replace(url.pathname);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-md animate-in slide-in-from-bottom">
      <div className={`p-4 rounded-lg shadow-lg border flex items-center justify-between ${
        status === "success" ? "bg-green-50 border-green-200" :
        status === "error" ? "bg-red-50 border-red-200" :
        "bg-blue-50 border-blue-200"
      }`}>
        <div className="flex items-center gap-3">
          {status === "verifying" && (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 flex-shrink-0" />
          )}
          {status === "success" && (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          )}
          {status === "error" && (
            <div className="h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              !
            </div>
          )}
          <p className={`text-sm font-medium ${
            status === "success" ? "text-green-800" :
            status === "error" ? "text-red-800" :
            "text-blue-800"
          }`}>
            {message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function CheckoutSuccessHandler() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessHandlerInner />
    </Suspense>
  );
}
