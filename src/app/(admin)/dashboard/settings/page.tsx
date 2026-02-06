import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SettingsPageContent } from "@/components/dashboard/settings-page-content";

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

  return <SettingsPageContent store={store} domainStore={domainStore} />;
}
