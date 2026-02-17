import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma, CacheTags } from "@/lib/prisma";
import { headers } from "next/headers";

// ==================== CROSS-REQUEST CACHED QUERIES ====================
// unstable_cache persists data across requests (ISR-like).
// React cache() deduplicates within a single request.

const STORE_CACHE_TTL = 60; // seconds — revalidate every 60s

/**
 * Fetch store by slug — cached across requests for up to STORE_CACHE_TTL seconds.
 * Products are limited to the latest 50 with their first 5 images each.
 */
const _getStoreBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      return prisma.store.findUnique({
        where: { subdomainSlug: slug },
        include: {
          theme: true,
          products: {
            where: { deletedAt: null }, // Exclude soft-deleted products
            orderBy: { createdAt: "desc" },
            take: 50, // cap products per store
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
                take: 5, // cap images per product
              },
            },
          },
          testimonials: {
            where: { isPublished: true },
            orderBy: { sortOrder: "asc" },
          },
          shippingLocations: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    },
    [`store-${slug}`],
    {
      tags: [CacheTags.store(slug)],
      revalidate: STORE_CACHE_TTL,
    }
  )();

/**
 * Public wrapper — React `cache()` deduplicates within a single request
 * so layout.tsx and page.tsx share the same promise.
 */
export const getStoreBySlug = cache(async (slug: string) => {
  return _getStoreBySlug(slug);
});

/**
 * Cached section counts — deduped per request, cached across requests.
 */
const _getStoreSectionCounts = (storeId: string) =>
  unstable_cache(
    async () => {
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
    },
    [`sections-${storeId}`],
    {
      tags: [CacheTags.sections(storeId)],
      revalidate: STORE_CACHE_TTL,
    }
  )();

export const getStoreSectionCounts = cache(async (storeId: string) => {
  return _getStoreSectionCounts(storeId);
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
