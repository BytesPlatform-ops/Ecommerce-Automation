import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Cached store fetcher — React `cache()` deduplicates this across
 * layout.tsx and page.tsx within the same request, so the DB is hit only once.
 */
export const getStoreBySlug = cache(async (slug: string) => {
  return prisma.store.findUnique({
    where: { subdomainSlug: slug },
    include: {
      theme: true,
      products: {
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      },
      testimonials: {
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
});

/**
 * Cached section counts — fetched once per request, shared across layout + pages.
 */
export const getStoreSectionCounts = cache(async (storeId: string) => {
  const [faqCount, privacyCount, shippingReturnsCount] = await Promise.all([
    prisma.storeFaq.count({
      where: { storeId, isPublished: true },
    }),
    prisma.storePrivacySection.count({
      where: { storeId },
    }),
    prisma.storeShippingReturnsSection.count({
      where: { storeId },
    }),
  ]);

  return { faqCount, privacyCount, shippingReturnsCount };
});

/**
 * Cached custom domain check — avoids duplicate headers() calls.
 */
export const checkIsCustomDomain = cache(async () => {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const appDomain =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "";
  const isPlatform = isLocal || (appDomain && host.includes(appDomain));
  return !isPlatform;
});
