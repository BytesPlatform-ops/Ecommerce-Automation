import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Prisma connection pool configuration
// For best results with serverless/pooling, ensure your DATABASE_URL 
// points to a connection pooler (e.g., Supabase Connection Pooler with PgBouncer)

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ==================== REVALIDATION HELPERS ====================

/**
 * Tag constants for Next.js cache revalidation.
 * Use with `unstable_cache` and `revalidateTag` to invalidate
 * cross-request cached data when mutations happen.
 */
export const CacheTags = {
  store: (slug: string) => `store:${slug}`,
  storeById: (id: string) => `store-id:${id}`,
  products: (storeId: string) => `products:${storeId}`,
  categories: (storeId: string) => `categories:${storeId}`,
  orders: (storeId: string) => `orders:${storeId}`,
  sections: (storeId: string) => `sections:${storeId}`,
} as const;
