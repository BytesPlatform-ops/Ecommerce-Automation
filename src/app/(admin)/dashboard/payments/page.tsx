import { redirect } from "next/navigation";
import { getAuthUser, getOwnerStore } from "@/lib/admin-cache";
import { getSubscriptionStatus } from "@/lib/actions";
import PaymentsContent from "@/components/dashboard/payments-content";
import { SubscriptionManagement } from "@/components/dashboard/subscription-management";

export default async function PaymentsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Deduplicated via React cache() — shared with layout
  const store = await getOwnerStore(user.id);

  if (!store) {
    redirect("/onboarding");
  }

  const subscriptionStatus = await getSubscriptionStatus(store.id);

  return (
    <div className="space-y-6">
      <div className="dash-animate-in">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">Payments</h1>
        <p className="text-gray-500 mt-1">
          Manage your Stripe account and view transactions
        </p>
      </div>

      {/* Platform Subscription Management */}
      <SubscriptionManagement subscriptionStatus={subscriptionStatus} />

      <PaymentsContent
        storeId={store.id}
        initialStripeStatus={{
          isConnected: !!store.stripeConnectId,
          status: store.stripeConnectStatus,
          connectedAt: store.stripeConnectedAt?.toISOString() || null,
        }}
      />
    </div>
  );
}
