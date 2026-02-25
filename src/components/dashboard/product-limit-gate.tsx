"use client";

import { useState } from "react";
import { Crown, Lock, ArrowRight, Zap } from "lucide-react";
import { UpgradeModal } from "./upgrade-modal";

interface ProductLimitGateProps {
  subscriptionStatus: {
    tier: string;
    productCount: number;
    productLimit: number;
    effectiveLimit: number;
    canAddProduct: boolean;
    subscriptionStatus: string | null;
    isGracePeriod: boolean;
    gracePeriodDaysLeft: number;
  };
}

export function ProductLimitGate({ subscriptionStatus }: ProductLimitGateProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-8 lg:p-12 text-center">
          {/* Lock Icon */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-violet-100 to-blue-100 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="h-10 w-10 text-violet-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Product Limit Reached
          </h2>

          <p className="text-gray-500 max-w-md mx-auto mb-2">
            You&apos;ve used all <span className="font-semibold text-gray-700">{subscriptionStatus.productCount}</span> of{" "}
            <span className="font-semibold text-gray-700">{subscriptionStatus.effectiveLimit}</span> product slots
            on the Free plan.
          </p>

          {subscriptionStatus.isGracePeriod && (
            <p className="text-amber-600 text-sm font-medium mb-4">
              Grace period: {subscriptionStatus.gracePeriodDaysLeft} day{subscriptionStatus.gracePeriodDaysLeft !== 1 ? "s" : ""} remaining
            </p>
          )}

          {/* Progress bar */}
          <div className="max-w-xs mx-auto mb-8">
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: "100%" }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {subscriptionStatus.productCount}/{subscriptionStatus.effectiveLimit} products
            </p>
          </div>

          {/* Upgrade CTA */}
          <div className="space-y-4">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all"
            >
              <Zap className="w-5 h-5" />
              Upgrade to Pro
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-xs text-gray-400">
              Get up to 100 products · Starting at $49.99/mo
            </p>
          </div>

          {/* Feature comparison */}
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="text-left p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Free Plan</p>
              <ul className="space-y-1.5 text-sm text-gray-500">
                <li>15 products</li>
                <li>Basic features</li>
                <li>Standard support</li>
              </ul>
            </div>
            <div className="text-left p-4 rounded-xl bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200">
              <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Pro Plan
              </p>
              <ul className="space-y-1.5 text-sm text-violet-700">
                <li className="font-semibold">100 products</li>
                <li>All features</li>
                <li>Priority support</li>
              </ul>
            </div>
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
