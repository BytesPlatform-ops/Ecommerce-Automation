import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function StorefrontFaqPage({
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

  const faqs = await prisma.storeFaq.findMany({
    where: { storeId: store.id, isPublished: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50" />
      <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />
      <div className="container mx-auto px-4 py-12 relative">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 rounded-2xl border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-gray-500">Support</p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mt-3">
              {store.storeName} FAQ
            </h1>
            <p className="text-lg text-gray-600 mt-3 max-w-2xl">
              Quick answers to common questions. If you need more help, reach out to the store directly.
            </p>
          </div>

          {faqs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-10 text-center shadow-sm">
              <p className="text-lg text-gray-500">
                This store hasn&apos;t added any FAQs yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <details
                  key={faq.id}
                  className="group rounded-2xl border border-gray-200 bg-white/90 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <summary className="flex cursor-pointer items-start gap-4 p-6 list-none">
                    <div
                      className="mt-1 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ backgroundColor: "var(--primary)", color: "white" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{faq.question}</h2>
                      <p className="text-sm text-gray-500 mt-1">Click to view the answer</p>
                    </div>
                    <span className="mt-1 text-xl text-gray-400 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6 overflow-hidden transition-all duration-300 ease-out max-h-0 opacity-0 group-open:max-h-96 group-open:opacity-100">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
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
