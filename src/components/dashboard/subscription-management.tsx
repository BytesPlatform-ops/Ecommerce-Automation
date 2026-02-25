"use client";

import { useState } from "react";
import { Crown, CreditCard, ExternalLink, Zap, Calendar, AlertTriangle } from "lucide-react";
import { UpgradeModal } from "./upgrade-modal";

interface SubscriptionManagementProps {
  subscriptionStatus: {
    tier: string;
    productCount: number;
    productLimit: number;
    effectiveLimit: number;
    canAddProduct: boolean;
    subscriptionStatus: string | null;
    isGracePeriod: boolean;
    gracePeriodDaysLeft: number;
    gracePeriodEnd: string | null;
    hasStripeCustomer: boolean;
  };
}

export function SubscriptionManagement({ subscriptionStatus }: SubscriptionManagementProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setPortalLoading(false);
    }
  };

  const isPro = subscriptionStatus.tier === "PRO";
  const isActive = subscriptionStatus.subscriptionStatus === "active";
  const isPastDue = subscriptionStatus.subscriptionStatus === "past_due";

  return (
    <>
      <div className="dash-animate-in bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              isPro
                ? "bg-gradient-to-br from-violet-500 to-blue-600"
                : "bg-gray-100"
            }`}>
              <Crown className={`h-5 w-5 ${isPro ? "text-white" : "text-gray-400"}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Platform Subscription</h2>
              <p className="text-sm text-gray-500">Your plan determines how many products you can add</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Plan */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Current Plan</p>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${isPro ? "text-violet-600" : "text-gray-900"}`}>
                  {isPro ? "Pro" : "Free"}
                </span>
                {isPro && isActive && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full uppercase">
                    Active
                  </span>
                )}
                {isPastDue && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full uppercase">
                    Past Due
                  </span>
                )}
                {subscriptionStatus.isGracePeriod && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full uppercase">
                    Grace Period
                  </span>
                )}
              </div>
            </div>

            {/* Product Usage */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Product Usage</p>
              <p className="text-xl font-bold text-gray-900">
                {subscriptionStatus.productCount}
                <span className="text-gray-400 font-normal text-base">/{subscriptionStatus.effectiveLimit}</span>
              </p>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    subscriptionStatus.productCount >= subscriptionStatus.effectiveLimit
                      ? "bg-red-500"
                      : subscriptionStatus.productCount >= subscriptionStatus.effectiveLimit - 3
                      ? "bg-amber-500"
                      : isPro
                      ? "bg-violet-500"
                      : "bg-gray-400"
                  }`}
                  style={{
                    width: `${Math.min(
                      (subscriptionStatus.productCount / subscriptionStatus.effectiveLimit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Grace Period / Status */}
            <div className="space-y-2">
              {subscriptionStatus.isGracePeriod ? (
                <>
                  <p className="text-xs font-medium text-amber-500 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Grace Period
                  </p>
                  <p className="text-xl font-bold text-amber-600">
                    {subscriptionStatus.gracePeriodDaysLeft} day{subscriptionStatus.gracePeriodDaysLeft !== 1 ? "s" : ""} left
                  </p>
                </>
              ) : isPro && subscriptionStatus.gracePeriodEnd ? (
                <>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Renews</p>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(subscriptionStatus.gracePeriodEnd).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</p>
                  <p className="text-sm font-medium text-gray-500">
                    {isPro ? "Subscribed" : "No active subscription"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
            {isPro || subscriptionStatus.hasStripeCustomer ? (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {portalLoading ? "Opening..." : "Manage Billing"}
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : null}

            {!isPro && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all"
              >
                <Zap className="w-4 h-4" />
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentCount={subscriptionStatus.productCount}
        limit={subscriptionStatus.effectiveLimit}
      />
    </>
  );
}
