"use client";

import { useState } from "react";
import { X, Sparkles, Check, Zap, Crown } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  limit: number;
}

export function UpgradeModal({ isOpen, onClose, currentCount, limit }: UpgradeModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingPeriod }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start checkout");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const monthlyPrice = "$49.99";
  const yearlyPrice = "$500";
  const yearlySavings = "$99.88";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Crown className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">Upgrade to Pro</h2>
          </div>
          <p className="text-white/80 text-sm">
            You&apos;ve reached {currentCount} of {limit} products on the Free plan.
            Upgrade to add up to 100 products.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-center gap-3 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                billingPeriod === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-emerald-600 font-semibold">Save {yearlySavings}</span>
            </button>
          </div>
        </div>

        {/* Price Display */}
        <div className="px-6 py-6 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              {billingPeriod === "monthly" ? monthlyPrice : yearlyPrice}
            </span>
            <span className="text-gray-500 text-lg">
              /{billingPeriod === "monthly" ? "mo" : "yr"}
            </span>
          </div>
          {billingPeriod === "yearly" && (
            <p className="text-sm text-emerald-600 mt-1 font-medium">
              That&apos;s just $41.67/mo — save {yearlySavings}/year
            </p>
          )}
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              "Up to 100 products",
              "Priority support",
              "All features included",
              "Custom domain + SSL",
              "Analytics dashboard",
              "Stripe payments",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} />
                </div>
                <span className="text-xs text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-base shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecting to Stripe...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Upgrade Now
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
