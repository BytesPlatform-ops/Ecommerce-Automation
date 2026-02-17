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

  // Parallelize independent section queries
  const [faqs, privacySections, shippingReturnsSections, testimonials, shippingLocations] = await Promise.all([
    prisma.storeFaq.findMany({
      where: { storeId: store.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.storePrivacySection.findMany({
      where: { storeId: store.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.storeShippingReturnsSection.findMany({
      where: { storeId: store.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.storeTestimonial.findMany({
      where: { storeId: store.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.storeShippingLocation.findMany({
      where: { storeId: store.id },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Prepare store data for domain settings component
  const domainStore = {
    id: store.id,
    domain: store.domain,
    domainStatus: store.domainStatus,
    certificateGeneratedAt: store.certificateGeneratedAt,
  };

  return (
    <SettingsPageContent
      store={store}
      domainStore={domainStore}
      faqs={faqs}
      privacySections={privacySections}
      shippingReturnsSections={shippingReturnsSections}
      testimonials={testimonials}
      shippingLocations={shippingLocations}
    />
  );
}
