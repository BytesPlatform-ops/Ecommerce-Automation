import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function StorefrontAboutPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Fetch store
  const store = await prisma.store.findUnique({
    where: { subdomainSlug: username },
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-16 sm:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-overline mb-4" style={{ color: "var(--primary)" }}>About</p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-8">
          {store.storeName}
        </h1>
        
        <div className="w-12 h-px bg-border mx-auto mb-8" />
        
        {store.aboutText ? (
          <p className="text-base leading-relaxed text-muted-foreground">
            {store.aboutText}
          </p>
        ) : (
          <p className="text-base leading-relaxed text-muted-foreground italic">
            This store hasn&apos;t added an about section yet.
          </p>
        )}
      </div>
    </div>
  );
}
