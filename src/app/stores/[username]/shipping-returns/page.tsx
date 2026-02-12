import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

export default async function StorefrontShippingReturnsPage({
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

  const sections = await prisma.storeShippingReturnsSection.findMany({
    where: { storeId: store.id },
    orderBy: { sortOrder: "asc" },
  });

  if (sections.length === 0) {
    notFound();
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50" />
      <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />
      <div className="container mx-auto px-4 py-12 relative">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 rounded-2xl border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-gray-500">Policies</p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mt-3">
              Shipping & Returns
            </h1>
            <p className="text-lg text-gray-600 mt-3 max-w-2xl">
              Learn about our shipping methods, delivery times, and return policies.
            </p>
          </div>

          <div className="grid gap-6">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="mt-1 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ backgroundColor: "var(--primary)", color: "white" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {section.heading}
                    </h2>
                    <div className="mt-3">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          p: ({ children }) => (
                            <p className="text-gray-700 leading-relaxed">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside text-gray-700 leading-relaxed space-y-1">
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
