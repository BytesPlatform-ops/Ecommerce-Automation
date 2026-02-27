"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * SubscriptionVerifier — auto-verifies the subscription after returning from Stripe Checkout.
 * This is a fallback mechanism in case the webhook was delayed or failed.
 * 
 * When the URL contains ?subscription=success&session_id=cs_xxx, this component
 * calls /api/subscription/verify to ensure the store is upgraded to PRO.
 */
export function SubscriptionVerifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const subscription = searchParams.get("subscription");
    const sessionId = searchParams.get("session_id");

    if (subscription === "success" && sessionId && !verifying && !verified) {
      setVerifying(true);

      fetch("/api/subscription/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (data.success) {
            setVerified(true);
            // Refresh the page to show updated subscription status (remove query params)
            router.replace("/dashboard");
            router.refresh();
          }
        })
        .catch((err) => {
          console.error("Subscription verification failed:", err);
        })
        .finally(() => {
          setVerifying(false);
        });
    }
  }, [searchParams, router, verifying, verified]);

  if (!verifying) return null;

  return (
    <div className="dash-animate-in bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
      <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-blue-700">
        Verifying your subscription...
      </p>
    </div>
  );
}
