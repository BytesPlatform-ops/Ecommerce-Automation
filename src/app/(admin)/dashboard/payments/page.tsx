import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import PaymentsContent from "@/components/dashboard/payments-content";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      storeName: true,
      stripeConnectId: true,
      stripeConnectStatus: true,
      stripeConnectedAt: true,
    },
  });

  if (!store) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6">
      <div className="dash-animate-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">Payments</h1>
        <p className="text-gray-500 mt-1">
          Manage your Stripe account and view transactions
        </p>
      </div>

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
