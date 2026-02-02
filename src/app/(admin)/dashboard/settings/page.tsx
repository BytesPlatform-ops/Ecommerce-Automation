import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/settings-form";

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store details</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
        <SettingsForm store={store} />
      </div>
    </div>
  );
}
