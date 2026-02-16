import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/store-cache";

export default async function StorefrontAboutPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Fetch store (cached — shared with layout.tsx)
  const store = await getStoreBySlug(username);

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-overline mb-4" style={{ color: "var(--primary)" }}>About</p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-8 font-medium tracking-tight">
            {store.storeName}
          </h1>
          
          <div className="w-10 h-1 rounded-full mx-auto mb-10" style={{ backgroundColor: "var(--primary)" }} />
          
          {store.aboutText ? (
            <div className="info-page-card text-left">
              <p className="text-base leading-relaxed text-muted-foreground">
                {store.aboutText}
              </p>
            </div>
          ) : (
            <div className="info-page-card">
              <p className="text-base leading-relaxed text-muted-foreground italic">
                This store hasn&apos;t added an about section yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
