"use client";

import { Crown, AlertTriangle, ArrowRight } from "lucide-react";

interface UpgradeBannerProps {
  tier: string;
  productCount: number;
  productLimit: number;
  effectiveLimit: number;
  isGracePeriod: boolean;
  gracePeriodDaysLeft: number;
  subscriptionStatus: string | null;
  onUpgradeClick: () => void;
}

export function UpgradeBanner({
  tier,
  productCount,
  productLimit,
  effectiveLimit,
  isGracePeriod,
  gracePeriodDaysLeft,
  subscriptionStatus,
  onUpgradeClick,
}: UpgradeBannerProps) {
  const usagePercent = Math.min((productCount / effectiveLimit) * 100, 100);
  const isNearLimit = productCount >= effectiveLimit - 3;
  const isAtLimit = productCount >= effectiveLimit;

  // Payment failed warning
  if (subscriptionStatus === "past_due") {
    return (
      <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-amber-900">Payment Failed</h3>
            <p className="text-xs text-amber-700 mt-0.5">
              Your last payment failed. Please update your billing information to keep your Pro features.
            </p>
          </div>
          <button
            onClick={onUpgradeClick}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Fix Payment
          </button>
        </div>
      </div>
    );
  }

  // Grace period warning
  if (isGracePeriod) {
    return (
      <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-amber-900">
              Pro Plan Expired — {gracePeriodDaysLeft} day{gracePeriodDaysLeft !== 1 ? "s" : ""} left
            </h3>
            <p className="text-xs text-amber-700 mt-0.5">
              Your grace period ends soon. After that, you won&apos;t be able to add new products beyond the free limit of 15.
              Existing products will remain visible.
            </p>
          </div>
          <button
            onClick={onUpgradeClick}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Resubscribe
          </button>
        </div>
      </div>
    );
  }

  // At limit — can't add more (only show for Free tier)
  if (tier === "FREE" && isAtLimit) {
    return (
      <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <Crown className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-900">Product Limit Reached</h3>
            <p className="text-xs text-red-700 mt-0.5">
              You&apos;ve used all {effectiveLimit} product slots. Upgrade to Pro for up to 100 products.
            </p>
            {/* Progress bar */}
            <div className="mt-2 w-full h-2 bg-red-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: "100%" }} />
            </div>
            <p className="text-xs text-red-500 mt-1">{productCount}/{effectiveLimit} products</p>
          </div>
          <button
            onClick={onUpgradeClick}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Upgrade <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Near limit — warning (Free tier only)
  if (tier === "FREE" && isNearLimit) {
    return (
      <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Crown className="h-5 w-5 text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-violet-900">Approaching Product Limit</h3>
            <p className="text-xs text-violet-700 mt-0.5">
              You&apos;re using {productCount} of {effectiveLimit} product slots. Upgrade to Pro for up to 100.
            </p>
            {/* Progress bar */}
            <div className="mt-2 w-full h-2 bg-violet-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-violet-500 mt-1">{productCount}/{effectiveLimit} products</p>
          </div>
          <button
            onClick={onUpgradeClick}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Upgrade <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Pro plan — show nice status badge
  if (tier === "PRO") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Crown className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-emerald-900">Pro Plan</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              {productCount}/{effectiveLimit} products used
            </p>
            {/* Progress bar */}
            <div className="mt-2 w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Free tier, not near limit — subtle usage indicator
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Crown className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Free Plan</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {productCount}/{effectiveLimit} products used
          </p>
          {/* Progress bar */}
          <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 rounded-full transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
        <button
          onClick={onUpgradeClick}
          className="flex-shrink-0 text-xs text-violet-600 font-medium hover:text-violet-700 transition-colors"
        >
          Upgrade →
        </button>
      </div>
    </div>
  );
}
