import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { getStoreBySlug } from "@/lib/store-cache";

export default async function StorefrontShippingReturnsPage({
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

  const sections = await prisma.storeShippingReturnsSection.findMany({
    where: { storeId: store.id },
    orderBy: { sortOrder: "asc" },
  });

  if (sections.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="info-page-header-themed mb-10 sm:mb-12 animate-fade-in-up">
            <span className="section-badge mb-3">Policies</span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mt-2 font-medium tracking-tight">
              Shipping & Returns
            </h1>
            <p className="text-base text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              Learn about our shipping methods, delivery times, and return policies.
            </p>
          </div>

          <div className="grid gap-5 stagger-children">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="info-page-card-themed"
              >
                <div className="flex items-start gap-5">
                  <div
                    className="info-page-number mt-0.5"
                    style={{ backgroundColor: "var(--primary)", color: "white" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                      {section.heading}
                    </h2>
                    <div className="mt-3">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          p: ({ children }) => (
                            <p className="text-muted-foreground leading-relaxed">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1.5">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside text-muted-foreground leading-relaxed space-y-1.5">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => <li>{children}</li>,
                        }}
                      >
                        {section.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
