import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContactSection } from "@/components/storefront/contact-section";

export default async function StorefrontContactPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const store = await prisma.store.findUnique({
    where: { subdomainSlug: username },
  });

  if (!store) {
    notFound();
  }

  const hasContactDetails = Boolean(
    (store as any).contactEmail ||
      (store as any).contactPhone ||
      (store as any).whatsappNumber
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border py-12 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-overline mb-3" style={{ color: "var(--primary)" }}>
            Contact
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
            {store.storeName}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Reach the team directly for product questions, custom orders, and support.
          </p>
        </div>
      </section>

      {hasContactDetails ? (
        <ContactSection
          storeId={store.id}
          storeName={store.storeName}
          contactEmail={(store as any).contactEmail}
          contactPhone={(store as any).contactPhone}
          whatsappNumber={(store as any).whatsappNumber}
          instagramUrl={(store as any).instagramUrl}
          facebookUrl={(store as any).facebookUrl}
          twitterUrl={(store as any).twitterUrl}
          linkedinUrl={(store as any).linkedinUrl}
          youtubeUrl={(store as any).youtubeUrl}
          supportedQueryTypes={(store as any).supportedQueryTypes}
        />
      ) : (
        <section className="py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                This store has not shared contact details yet.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
