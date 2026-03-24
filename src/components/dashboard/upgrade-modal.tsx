"use client";

import { useState } from "react";
import { X, Check, Zap, Crown, Star, Shield, RefreshCw } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  limit: number;
}

const FEATURES = [
  { label: "Up to 100 products", highlight: false },
  { label: "Custom domain + SSL", highlight: false },
  { label: "Advanced analytics", highlight: false },
  { label: "Priority support", highlight: false },
  { label: "Stripe payments", highlight: false },
  { label: "Remove branding", highlight: true },
];

export function UpgradeModal({ isOpen, onClose, currentCount, limit }: UpgradeModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
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

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const usedPercent = Math.min(Math.round((currentCount / limit) * 100), 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md max-h-[85vh] my-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">

        {/* ── Hero Header ── */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 px-5 pt-4 pb-6 text-white">
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex items-center justify-center h-7 w-7 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>

          {/* Crown badge */}
          <div className="relative mb-2 inline-flex">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Crown className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="absolute -top-1.5 -right-3 px-1.5 py-0.5 text-[9px] font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-md uppercase tracking-wide">
              Pro
            </span>
          </div>

          <h2 className="text-lg font-black leading-tight mb-0.5">
            Unlock Your Full Store Potential
          </h2>
          <p className="text-white/75 text-xs leading-relaxed">
            You&apos;re using <span className="text-white font-bold">{currentCount}/{limit}</span> product slots. Go Pro and scale to 100 products.
          </p>

          {/* Usage bar */}
          <div className="mt-2">
            <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-white/60">{usedPercent}% of free plan used</p>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* ── Billing Toggle ── */}
          <div className="px-5 -mt-3 relative z-10">
            <div className="flex items-center p-1 bg-gray-100 rounded-xl shadow-sm">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  billingPeriod === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  billingPeriod === "yearly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Yearly
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-100 text-emerald-700 rounded-full">
                  SAVE 17%
                </span>
              </button>
            </div>
          </div>

          {/* ── Pricing ── */}
          <div className="px-5 pt-2 pb-1 text-center">
            <div className="flex items-end justify-center gap-1">
              <span className="text-3xl font-black text-gray-900 tracking-tight">
                {billingPeriod === "monthly" ? "$30" : "$25"}
              </span>
              <span className="text-gray-400 font-medium mb-1.5 text-sm">/mo</span>
            </div>
            {billingPeriod === "yearly" ? (
              <p className="text-xs text-emerald-600 font-semibold">
                Billed $300/yr · Save $60 vs monthly
              </p>
            ) : (
              <p className="text-xs text-gray-400">Billed monthly · Cancel anytime</p>
            )}
          </div>

          {/* ── Features ── */}
          <div className="px-5 py-2">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {FEATURES.map(({ label, highlight }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`shrink-0 h-4 w-4 rounded-full flex items-center justify-center ${highlight ? "bg-gradient-to-br from-violet-500 to-indigo-600" : "bg-emerald-100"}`}>
                    <Check className={`h-2.5 w-2.5 ${highlight ? "text-white" : "text-emerald-600"}`} strokeWidth={3} />
                  </div>
                  <span className={`text-[11px] font-medium ${highlight ? "text-violet-700 font-semibold" : "text-gray-600"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Social proof ── */}
          <div className="mx-5 mb-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 px-3 py-2">
            <div className="flex -space-x-1.5 shrink-0">
              {["bg-violet-400", "bg-indigo-400", "bg-pink-400"].map((c, i) => (
                <div key={i} className={`h-6 w-6 rounded-full ${c} border-2 border-white flex items-center justify-center`}>
                  <span className="text-[8px] font-bold text-white">{["JK", "AM", "ST"][i]}</span>
                </div>
              ))}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-[10px] text-gray-600 leading-snug">
                <span className="font-semibold text-gray-800">500+ store owners</span> trust Pro
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* ── Sticky CTA Footer ── */}
        <div className="shrink-0 px-5 pt-2 pb-4 bg-white border-t border-gray-100">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="upgrade-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white font-bold text-sm shadow-lg shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 fill-current" />
                {billingPeriod === "yearly" ? "Get Pro — Best Value" : "Upgrade to Pro"}
              </>
            )}
          </button>

          {/* Trust row */}
          <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Secure
            </span>
            <span className="h-2.5 w-px bg-gray-200" />
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Cancel anytime
            </span>
            <span className="h-2.5 w-px bg-gray-200" />
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
