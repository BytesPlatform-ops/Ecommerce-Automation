import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store-cache";

export default async function StorefrontFaqPage({
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

  const faqs = await prisma.storeFaq.findMany({
    where: { storeId: store.id, isPublished: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="info-page-header mb-10 sm:mb-12">
            <p className="text-overline mb-3" style={{ color: "var(--primary)" }}>Support</p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mt-2 font-medium tracking-tight">
              {store.storeName} FAQ
            </h1>
            <p className="text-base text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              Quick answers to common questions. If you need more help, reach out to the store directly.
            </p>
          </div>

          {faqs.length === 0 ? (
            <div className="info-page-card text-center py-12">
              <p className="text-base text-muted-foreground">
                This store hasn&apos;t added any FAQs yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <details
                  key={faq.id}
                  className="faq-accordion group"
                >
                  <summary className="flex cursor-pointer items-start gap-5 p-6 list-none">
                    <div
                      className="info-page-number mt-0.5"
                      style={{ backgroundColor: "var(--primary)", color: "white" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground">{faq.question}</h2>
                      <p className="text-xs text-muted-foreground mt-1">Click to view the answer</p>
                    </div>
                    <span className="mt-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground text-sm transition-transform duration-200 group-open:rotate-45 shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6 overflow-hidden transition-all duration-300 ease-out max-h-0 opacity-0 group-open:max-h-96 group-open:opacity-100">
                    <div className="ml-[calc(2.5rem+1.25rem)] pt-1">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
