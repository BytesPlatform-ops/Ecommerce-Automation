"use client";

import { useState } from "react";
import { UpgradeBanner } from "./upgrade-banner";
import { UpgradeModal } from "./upgrade-modal";

interface SubscriptionStatusData {
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
}

interface SubscriptionGateProps {
  subscriptionStatus: SubscriptionStatusData;
}

export function SubscriptionGate({ subscriptionStatus }: SubscriptionGateProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <>
      <UpgradeBanner
        tier={subscriptionStatus.tier}
        productCount={subscriptionStatus.productCount}
        productLimit={subscriptionStatus.productLimit}
        effectiveLimit={subscriptionStatus.effectiveLimit}
        isGracePeriod={subscriptionStatus.isGracePeriod}
        gracePeriodDaysLeft={subscriptionStatus.gracePeriodDaysLeft}
        subscriptionStatus={subscriptionStatus.subscriptionStatus}
        onUpgradeClick={() => setShowUpgradeModal(true)}
      />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentCount={subscriptionStatus.productCount}
        limit={subscriptionStatus.effectiveLimit}
      />
    </>
  );
}
