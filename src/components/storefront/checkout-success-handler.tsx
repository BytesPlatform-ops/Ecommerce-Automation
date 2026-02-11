"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

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
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");
    const storeId = searchParams.get("store_id");

    if (checkout === "success" && sessionId && storeId) {
      verifySession(sessionId, storeId);
    }
  }, [searchParams]);

  // Countdown timer for auto-dismiss
  useEffect(() => {
    if (status === "success" && !dismissed && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (status === "success" && !dismissed && countdown === 0) {
      handleDismiss();
    }
  }, [status, dismissed, countdown]);

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
        setCountdown(5);
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

  const handleDismiss = () => {
    setDismissed(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    url.searchParams.delete("session_id");
    url.searchParams.delete("store_id");
    router.replace(url.pathname);
  };

  if (!status || dismissed) return null;

  const isSuccess = status === "success";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pointer-events-none">
      <div className={`pointer-events-auto p-4 rounded-lg shadow-lg border animate-in slide-in-from-top ${
        status === "success" ? "bg-green-50 border-green-200" :
        status === "error" ? "bg-red-50 border-red-200" :
        "bg-blue-50 border-blue-200"
      }`}>
        <div className="flex items-center gap-3 min-w-max">
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
          {isSuccess && (
            <span className={`ml-3 text-xs font-semibold px-2 py-1 rounded-full ${
              countdown > 2 ? "bg-green-200 text-green-700" :
              countdown > 0 ? "bg-yellow-200 text-yellow-700" :
              "bg-gray-200 text-gray-700"
            }`}>
              {countdown}s
            </span>
          )}
        </div>
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
