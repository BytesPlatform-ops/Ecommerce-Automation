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
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <span className="section-badge mb-4 mx-auto">About</span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-8 font-medium tracking-tight">
            {store.storeName}
          </h1>
          
          <div className="accent-line w-16 mx-auto mb-10" />
          
          {store.aboutText ? (
            <div className="info-page-card-themed text-left">
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {store.aboutText}
              </p>
            </div>
          ) : (
            <div className="info-page-card-themed">
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
