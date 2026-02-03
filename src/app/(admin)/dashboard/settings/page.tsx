import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { DomainSettings } from "@/components/dashboard/domain-settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
  });

  if (!store) {
    redirect("/onboarding");
  }

  // Prepare store data for domain settings component
  const domainStore = {
    id: store.id,
    domain: store.domain,
    domainStatus: store.domainStatus,
    certificateGeneratedAt: store.certificateGeneratedAt,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store details and custom domain</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Store Details Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Details</h2>
          <SettingsForm store={store} />
        </div>

        {/* Custom Domain Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <DomainSettings store={domainStore} />
        </div>
      </div>
    </div>
  );
}
