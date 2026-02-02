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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About {store.storeName}</h1>
        
        <div className="prose prose-lg max-w-none">
          {store.aboutText ? (
            <p className="text-lg leading-relaxed opacity-80">{store.aboutText}</p>
          ) : (
            <p className="text-lg leading-relaxed opacity-60 italic">
              This store hasn&apos;t added an about section yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
