"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { validateDomainFormat, normalizeDomain, DOMAIN_STATUS } from "@/lib/domain-utils";
import { DomainStatus, StripeConnectStatus, OrderStatus, PaymentStatus, Prisma, SizeType, Unit } from "@prisma/client";
import { sanitizeUrl, secureLog, sanitizeString } from "@/lib/security";
import { logAudit, AuditAction } from "@/lib/audit";
import { z } from "zod";
import crypto from "crypto";
import { revalidateTag } from "next/cache";
import { CacheTags } from "@/lib/prisma";
import {
  getConnectedAccount,
  getAccountBalance,
  getAccountPayouts,
} from "@/lib/stripe";

// ==================== CACHE REVALIDATION HELPER ====================

/** Invalidate all storefront caches for a store after any mutation */
function revalidateStore(slug: string, storeId: string) {
  revalidateTag(CacheTags.store(slug), "default");
  revalidateTag(CacheTags.storeById(storeId), "default");
  revalidateTag(CacheTags.sections(storeId), "default");
  revalidateTag(CacheTags.products(storeId), "default");
}

// ==================== STOCK NOTIFICATION HELPER ====================

interface LowStockItem {
  productId: string;
  productName: string;
  currentStock: number;
  variantInfo?: string;
}

/**
 * Check if any products have fallen to 10 or below stock
 * Creates or updates an aggregated notification if low stock items exist
 */
async function checkAndNotifyLowStock(storeId: string) {
  try {
    // Get all products and variants for this store with stock <= 10
    const lowStockProducts = await prisma.product.findMany({
      where: {
        storeId,
        stock: { lte: 10 },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        product: { storeId, deletedAt: null },
        stock: { lte: 10 },
      },
      select: {
        id: true,
        product: { select: { id: true, name: true } },
        sizeType: true,
        value: true,
        unit: true,
        stock: true,
      },
    });

    // Compile affected items
    const affectedItems: LowStockItem[] = [];

    // Add base products
    lowStockProducts.forEach((product) => {
      affectedItems.push({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
      });
    });

    // Add variants
    lowStockVariants.forEach((variant) => {
      const variantInfo = variant.sizeType ? `${variant.sizeType}${variant.value ? `: ${variant.value}` : ''}${variant.unit ? ` ${variant.unit}` : ''}` : undefined;
      affectedItems.push({
        productId: variant.product.id,
        productName: `${variant.product.name}${variantInfo ? ` (${variantInfo})` : ''}`,
        currentStock: variant.stock,
        variantInfo,
      });
    });

    // If there are low stock items, create or update notification
    if (affectedItems.length > 0) {
      // Find existing non-dismissed notification
      const existingNotification = await prisma.stockNotification.findFirst({
        where: {
          storeId,
          isDismissed: false,
        },
      });

      if (existingNotification) {
        // Update existing notification with new affected items
        await prisma.stockNotification.update({
          where: { id: existingNotification.id },
          data: {
            affectedItems: affectedItems as unknown as Prisma.InputJsonValue,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new notification
        await prisma.stockNotification.create({
          data: {
            storeId,
            affectedItems: affectedItems as unknown as Prisma.InputJsonValue,
          },
        });
      }
    } else {
      // No low stock items - auto-dismiss any existing notification
      await prisma.stockNotification.updateMany({
        where: {
          storeId,
          isDismissed: false,
        },
        data: {
          isDismissed: true,
          dismissedAt: new Date(),
        },
      });
    }
  } catch (error) {
    secureLog.error("[Stock Notification] Error checking stock levels", error, { storeId });
    // Don't throw - notifications should not block order processing
  }
}

// ==================== ZOD SCHEMAS ====================

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).max(999999.99),
  stock: z.number().int().min(0).max(999999).optional().default(0),
  imageUrl: z.string().url().max(2048).optional(),
  imageUrls: z.array(z.string().url().max(2048)).max(20).optional(),
  variants: z.array(z.object({
    sizeType: z.string().max(50),
    value: z.string().max(100).optional(),
    unit: z.string().max(20),
    price: z.number().min(0).max(999999.99).optional(),
    stock: z.number().int().min(0).max(999999),
  })).max(100).optional(),
});

const updateStoreSchema = z.object({
  storeName: z.string().min(1).max(100).optional(),
  aboutText: z.string().max(10000).optional(),
  themeId: z.string().max(100).optional(),
  heroImageUrl: z.union([z.literal(""), z.string().url().max(2048), z.null()]).optional(),
  heroHeadline: z.string().max(200).nullable().optional(),
  heroDescription: z.string().max(1000).nullable().optional(),
  heroTextAlign: z.string().max(20).optional(),
  storeLogoUrl: z.union([z.literal(""), z.string().url().max(2048), z.null()]).optional(),
  contactEmail: z.string().email().max(254).nullable().optional(),
  contactPhone: z.string().max(30).nullable().optional(),
  instagramUrl: z.string().max(2048).nullable().optional(),
  facebookUrl: z.string().max(2048).nullable().optional(),
  twitterUrl: z.string().max(2048).nullable().optional(),
  linkedinUrl: z.string().max(2048).nullable().optional(),
  youtubeUrl: z.string().max(2048).nullable().optional(),
  whatsappNumber: z.string().max(30).nullable().optional(),
  supportedQueryTypes: z.string().max(500).nullable().optional(),
});

const faqSchema = z.object({
  question: z.string().min(1).max(1000),
  answer: z.string().min(1).max(5000),
  isPublished: z.boolean().optional(),
});

const testimonialSchema = z.object({
  customerName: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  isPublished: z.boolean().optional(),
});

const sectionSchema = z.object({
  heading: z.string().min(1).max(500),
  content: z.string().min(1).max(10000),
});

export async function createProduct(
  storeId: string,
  data: { 
    name: string; 
    description?: string;
    price: number;
    stock?: number;
    imageUrl?: string;
    imageUrls?: string[];
    variants?: Array<{
      sizeType: string;
      value?: string;
      unit: string;
      price?: number;
      stock: number;
    }>;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  // Validate input
  const validated = createProductSchema.parse(data);

  const primaryImageUrl = validated.imageUrls?.[0] ?? validated.imageUrl ?? null;

  const product = await prisma.product.create({
    data: {
      storeId,
      name: sanitizeString(validated.name, 200),
      description: validated.description ? sanitizeString(validated.description, 5000) : null,
      price: validated.price,
      stock: validated.stock ?? 0,
      imageUrl: primaryImageUrl,
      images: validated.imageUrls && validated.imageUrls.length > 0 ? {
        create: validated.imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
        })),
      } : undefined,
      variants: validated.variants && validated.variants.length > 0 ? {
        create: validated.variants.map(v => ({
          sizeType: v.sizeType as SizeType,
          value: v.value || null,
          unit: v.unit as Unit,
          price: v.price ?? null,
          stock: v.stock,
        })),
      } : undefined,
    },
    include: {
      variants: true,
    },
  });

  await logAudit({
    action: AuditAction.ProductCreated,
    actorId: user.id,
    storeId,
    resourceType: "Product",
    resourceId: product.id,
    metadata: { name: product.name },
  });

  // Invalidate storefront cache so new product appears
  revalidateTag(CacheTags.store(store.subdomainSlug), "default");
  revalidateTag(CacheTags.products(storeId), "default");
  
  return {
    ...product,
    price: product.price.toString(),
    variants: product.variants.map(v => ({
      ...v,
      price: v.price ? v.price.toString() : null,
    })),
  };
}

export async function updateProduct(
  productId: string,
  data: { 
    name: string; 
    description?: string;
    price: number;
    stock?: number;
    imageUrl?: string;
    imageUrls?: string[];
    variants?: Array<{
      id?: string;
      sizeType: string;
      value?: string;
      unit: string;
      price?: number;
      stock: number;
    }>;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify product ownership via store
  const existingProduct = await prisma.product.findFirst({
    where: { id: productId },
    include: { 
      store: true,
      variants: true,
    },
  });

  if (!existingProduct || existingProduct.store.ownerId !== user.id) {
    throw new Error("Product not found or unauthorized");
  }

  const primaryImageUrl = data.imageUrls
    ? (data.imageUrls[0] ?? null)
    : (data.imageUrl ?? undefined);

  // Handle variant updates only if variants data has actually changed
  if (data.variants !== undefined) {
    // Check if variants have actually changed
    const existingVariantIds = new Set(existingProduct.variants.map(v => v.id));
    const newVariantIds = new Set(data.variants.filter(v => v.id).map(v => v.id));
    
    // Only process if variants have been added, removed, or modified
    const hasVariantsChanged = 
      data.variants.length !== existingProduct.variants.length ||
      data.variants.some(nv => {
        if (!nv.id) return true; // New variant added
        const existing = existingProduct.variants.find(ev => ev.id === nv.id);
        // Check if any property changed
        return !existing || 
               existing.sizeType !== nv.sizeType ||
               existing.value !== (nv.value || null) ||
               existing.unit !== nv.unit ||
               Number(existing.price || 0) !== (nv.price || 0) ||
               existing.stock !== nv.stock;
      });

    if (hasVariantsChanged) {
      const newVariantIdsSet = new Set(data.variants.filter(v => v.id).map(v => v.id));
      
      // Update existing variants that are being modified
      for (const variantData of data.variants.filter(v => v.id)) {
        await prisma.productVariant.update({
          where: { id: variantData.id },
          data: {
            sizeType: variantData.sizeType as SizeType,
            value: variantData.value || null,
            unit: variantData.unit as Unit,
            price: variantData.price ?? null,
            stock: variantData.stock,
          },
        });
      }
      
      // Create new variants (those without an id)
      const newVariants = data.variants.filter(v => !v.id);
      if (newVariants.length > 0) {
        await prisma.productVariant.createMany({
          data: newVariants.map(v => ({
            productId,
            sizeType: v.sizeType as SizeType,
            value: v.value || null,
            unit: v.unit as Unit,
            price: v.price ?? null,
            stock: v.stock,
          })),
        });
      }
      
      // Only delete variants that exist in the product but aren't in the new list
      // AND don't have any order items referencing them
      const variantsToDelete = existingProduct.variants.filter(v => !newVariantIdsSet.has(v.id));
      
      for (const variant of variantsToDelete) {
        // Check if this variant has any order items
        const orderItemCount = await prisma.orderItem.count({
          where: { variantId: variant.id },
        });
        
        // Only delete if no orders reference it
        if (orderItemCount === 0) {
          await prisma.productVariant.delete({
            where: { id: variant.id },
          });
        }
      }
    }
  }

  if (data.imageUrls !== undefined) {
    await prisma.productImage.deleteMany({
      where: { productId },
    });
  }

  // Validate input
  const validated = createProductSchema.parse(data);

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: sanitizeString(validated.name, 200),
      description: validated.description ? sanitizeString(validated.description, 5000) : undefined,
      price: validated.price,
      stock: validated.stock ?? undefined,
      imageUrl: primaryImageUrl,
      images: validated.imageUrls && validated.imageUrls.length > 0 ? {
        create: validated.imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
        })),
      } : undefined,
    },
    include: {
      variants: true,
    },
  });

  await logAudit({
    action: AuditAction.ProductUpdated,
    actorId: user.id,
    storeId: existingProduct.storeId,
    resourceType: "Product",
    resourceId: product.id,
    metadata: { name: product.name },
  });

  // Invalidate storefront cache
  revalidateTag(CacheTags.store(existingProduct.store.subdomainSlug), "default");
  revalidateTag(CacheTags.products(existingProduct.storeId), "default");
  
  return {
    ...product,
    price: product.price.toString(),
    variants: product.variants.map(v => ({
      ...v,
      price: v.price ? v.price.toString() : null,
    })),
  };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify product ownership via store
  const product = await prisma.product.findFirst({
    where: { id: productId },
    include: { store: true },
  });

  if (!product || product.store.ownerId !== user.id) {
    throw new Error("Product not found or unauthorized");
  }

  try {
    // Soft delete: set deletedAt timestamp instead of removing the record.
    // This preserves order history while hiding the product from the storefront.
    const softDeletedProduct = await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });

    await logAudit({
      action: AuditAction.ProductDeleted,
      actorId: user.id,
      storeId: product.storeId,
      resourceType: "Product",
      resourceId: productId,
      metadata: { name: product.name, softDelete: true },
    });

    // Invalidate storefront cache
    revalidateTag(CacheTags.store(product.store.subdomainSlug), "default");
    revalidateTag(CacheTags.products(product.storeId), "default");

    return {
      ...softDeletedProduct,
      price: softDeletedProduct.price.toString(),
    };
  } catch (error: any) {
    // Handle database connection errors
    if (error.message?.includes("database server") || error.message?.includes("connection") || error.message?.includes("ECONNREFUSED")) {
      throw new Error(
        "Database connection error. Please check your database is running and try again."
      );
    }
    
    // Handle other Prisma errors
    if (error.code) {
      console.error(`Prisma error code ${error.code}:`, error.message);
      throw new Error("An error occurred while deleting the product. Please try again.");
    }
    
    throw error;
  }
}

export async function restoreProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify product ownership via store
  const product = await prisma.product.findFirst({
    where: { id: productId },
    include: { store: true },
  });

  if (!product || product.store.ownerId !== user.id) {
    throw new Error("Product not found or unauthorized");
  }

  if (!product.deletedAt) {
    throw new Error("Product is not deleted");
  }

  const restoredProduct = await prisma.product.update({
    where: { id: productId },
    data: { deletedAt: null },
  });

  await logAudit({
    action: AuditAction.ProductUpdated,
    actorId: user.id,
    storeId: product.storeId,
    resourceType: "Product",
    resourceId: productId,
    metadata: { name: product.name, action: "restored" },
  });

  // Invalidate storefront cache
  revalidateTag(CacheTags.store(product.store.subdomainSlug), "default");
  revalidateTag(CacheTags.products(product.storeId), "default");

  return {
    ...restoredProduct,
    price: restoredProduct.price.toString(),
  };
}

export async function updateStore(
  storeId: string,
  data: { 
    storeName?: string; 
    aboutText?: string; 
    themeId?: string; 
    heroImageUrl?: string | null;
    heroHeadline?: string | null;
    heroDescription?: string | null;
    heroTextAlign?: string;
    storeLogoUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    twitterUrl?: string | null;
    linkedinUrl?: string | null;
    youtubeUrl?: string | null;
    whatsappNumber?: string | null;
    supportedQueryTypes?: string | null;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Validate input
  const validated = updateStoreSchema.parse(data);

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  const updateData: any = {
    storeName: validated.storeName ? sanitizeString(validated.storeName, 100) : undefined,
    aboutText: validated.aboutText ? sanitizeString(validated.aboutText, 10000) : undefined,
    themeId: validated.themeId,
  };

  if (validated.heroImageUrl !== undefined) {
    updateData.heroImageUrl = validated.heroImageUrl === "" ? null : validated.heroImageUrl;
  }

  if (validated.heroHeadline !== undefined) {
    updateData.heroHeadline = validated.heroHeadline;
  }

  if (validated.heroDescription !== undefined) {
    updateData.heroDescription = validated.heroDescription;
  }

  if (validated.heroTextAlign !== undefined) {
    updateData.heroTextAlign = validated.heroTextAlign;
  }

  if (validated.storeLogoUrl !== undefined) {
    updateData.storeLogoUrl = validated.storeLogoUrl === "" ? null : validated.storeLogoUrl;
  }

  if (validated.contactEmail !== undefined) {
    updateData.contactEmail = validated.contactEmail;
  }

  if (validated.contactPhone !== undefined) {
    updateData.contactPhone = validated.contactPhone;
  }

  if (validated.instagramUrl !== undefined) {
    updateData.instagramUrl = validated.instagramUrl ? sanitizeUrl(validated.instagramUrl) : null;
  }

  if (validated.facebookUrl !== undefined) {
    updateData.facebookUrl = validated.facebookUrl ? sanitizeUrl(validated.facebookUrl) : null;
  }

  if (validated.twitterUrl !== undefined) {
    updateData.twitterUrl = validated.twitterUrl ? sanitizeUrl(validated.twitterUrl) : null;
  }

  if (validated.linkedinUrl !== undefined) {
    updateData.linkedinUrl = validated.linkedinUrl ? sanitizeUrl(validated.linkedinUrl) : null;
  }

  if (validated.youtubeUrl !== undefined) {
    updateData.youtubeUrl = validated.youtubeUrl ? sanitizeUrl(validated.youtubeUrl) : null;
  }

  if (validated.whatsappNumber !== undefined) {
    updateData.whatsappNumber = validated.whatsappNumber;
  }

  if (validated.supportedQueryTypes !== undefined) {
    updateData.supportedQueryTypes = validated.supportedQueryTypes;
  }

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: updateData,
  });

  await logAudit({
    action: AuditAction.StoreUpdated,
    actorId: user.id,
    storeId,
    resourceType: "Store",
    resourceId: storeId,
  });

  // Invalidate storefront cache
  revalidateTag(CacheTags.store(updatedStore.subdomainSlug), "default");
  revalidateTag(CacheTags.storeById(storeId), "default");

  return updatedStore;
}

export async function createStoreFaq(
  storeId: string,
  data: {
    question: string;
    answer: string;
    isPublished?: boolean;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  // Validate input
  const validated = faqSchema.parse(data);

  const lastFaq = await prisma.storeFaq.findFirst({
    where: { storeId },
    orderBy: { sortOrder: "desc" },
  });

  const faq = await prisma.storeFaq.create({
    data: {
      storeId,
      question: sanitizeString(validated.question, 1000),
      answer: sanitizeString(validated.answer, 5000),
      isPublished: validated.isPublished ?? true,
      sortOrder: lastFaq ? lastFaq.sortOrder + 1 : 0,
    },
  });

  await logAudit({
    action: AuditAction.FaqCreated,
    actorId: user.id,
    storeId,
    resourceType: "StoreFaq",
    resourceId: faq.id,
  });

  revalidateTag(CacheTags.sections(storeId), "default");
  return faq;
}

export async function updateStoreFaq(
  faqId: string,
  data: {
    question?: string;
    answer?: string;
    isPublished?: boolean;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const faq = await prisma.storeFaq.findFirst({
    where: { id: faqId },
    include: { store: true },
  });

  if (!faq || faq.store.ownerId !== user.id) {
    throw new Error("FAQ not found or unauthorized");
  }

  const updateData: {
    question?: string;
    answer?: string;
    isPublished?: boolean;
  } = {};

  if (data.question !== undefined) {
    updateData.question = data.question.trim();
  }

  if (data.answer !== undefined) {
    updateData.answer = data.answer.trim();
  }

  if (data.isPublished !== undefined) {
    updateData.isPublished = data.isPublished;
  }

  const updatedFaq = await prisma.storeFaq.update({
    where: { id: faqId },
    data: updateData,
  });

  await logAudit({
    action: AuditAction.FaqUpdated,
    actorId: user.id,
    storeId: faq.storeId,
    resourceType: "StoreFaq",
    resourceId: faqId,
  });

  revalidateTag(CacheTags.sections(faq.storeId), "default");
  return updatedFaq;
}

export async function deleteStoreFaq(faqId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const faq = await prisma.storeFaq.findFirst({
    where: { id: faqId },
    include: { store: true },
  });

  if (!faq || faq.store.ownerId !== user.id) {
    throw new Error("FAQ not found or unauthorized");
  }

  const deleted = await prisma.storeFaq.delete({
    where: { id: faqId },
  });

  await logAudit({
    action: AuditAction.FaqDeleted,
    actorId: user.id,
    storeId: faq.storeId,
    resourceType: "StoreFaq",
    resourceId: faqId,
  });

  revalidateTag(CacheTags.sections(faq.storeId), "default");
  return deleted;
}

export async function reorderStoreFaqs(storeId: string, orderedIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  if (orderedIds.length === 0) {
    return { success: true };
  }

  const faqs = await prisma.storeFaq.findMany({
    where: { id: { in: orderedIds }, storeId },
    select: { id: true },
  });

  if (faqs.length !== orderedIds.length) {
    throw new Error("One or more FAQs could not be reordered");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.storeFaq.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  return { success: true };
}

export async function createStorePrivacySection(
  storeId: string,
  data: {
    heading: string;
    content: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  // Validate input
  const validated = sectionSchema.parse(data);

  const lastSection = await prisma.storePrivacySection.findFirst({
    where: { storeId },
    orderBy: { sortOrder: "desc" },
  });

  const section = await prisma.storePrivacySection.create({
    data: {
      storeId,
      heading: sanitizeString(validated.heading, 500),
      content: sanitizeString(validated.content, 10000),
      sortOrder: lastSection ? lastSection.sortOrder + 1 : 0,
    },
  });

  await logAudit({
    action: AuditAction.PrivacySectionCreated,
    actorId: user.id,
    storeId,
    resourceType: "StorePrivacySection",
    resourceId: section.id,
  });

  revalidateTag(CacheTags.sections(storeId), "default");
  return section;
}

export async function updateStorePrivacySection(
  sectionId: string,
  data: {
    heading?: string;
    content?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const section = await prisma.storePrivacySection.findFirst({
    where: { id: sectionId },
    include: { store: true },
  });

  if (!section || section.store.ownerId !== user.id) {
    throw new Error("Privacy section not found or unauthorized");
  }

  const updateData: { heading?: string; content?: string } = {};

  if (data.heading !== undefined) {
    updateData.heading = data.heading.trim();
  }

  if (data.content !== undefined) {
    updateData.content = data.content.trim();
  }

  const updatedSection = await prisma.storePrivacySection.update({
    where: { id: sectionId },
    data: updateData,
  });

  await logAudit({
    action: AuditAction.PrivacySectionUpdated,
    actorId: user.id,
    storeId: section.storeId,
    resourceType: "StorePrivacySection",
    resourceId: sectionId,
  });

  return updatedSection;
}

export async function deleteStorePrivacySection(sectionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const section = await prisma.storePrivacySection.findFirst({
    where: { id: sectionId },
    include: { store: true },
  });

  if (!section || section.store.ownerId !== user.id) {
    throw new Error("Privacy section not found or unauthorized");
  }

  const deleted = await prisma.storePrivacySection.delete({
    where: { id: sectionId },
  });

  await logAudit({
    action: AuditAction.PrivacySectionDeleted,
    actorId: user.id,
    storeId: section.storeId,
    resourceType: "StorePrivacySection",
    resourceId: sectionId,
  });

  return deleted;
}

export async function reorderStorePrivacySections(
  storeId: string,
  orderedIds: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  if (orderedIds.length === 0) {
    return { success: true };
  }

  const sections = await prisma.storePrivacySection.findMany({
    where: { id: { in: orderedIds }, storeId },
    select: { id: true },
  });

  if (sections.length !== orderedIds.length) {
    throw new Error("One or more privacy sections could not be reordered");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.storePrivacySection.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  return { success: true };
}

// Shipping & Returns Section Actions
export async function createStoreShippingReturnsSection(
  storeId: string,
  data: {
    heading: string;
    content: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  // Validate input
  const validated = sectionSchema.parse(data);

  const lastSection = await prisma.storeShippingReturnsSection.findFirst({
    where: { storeId },
    orderBy: { sortOrder: "desc" },
  });

  const section = await prisma.storeShippingReturnsSection.create({
    data: {
      storeId,
      heading: sanitizeString(validated.heading, 500),
      content: sanitizeString(validated.content, 10000),
      sortOrder: lastSection ? lastSection.sortOrder + 1 : 0,
    },
  });

  await logAudit({
    action: AuditAction.ShippingSectionCreated,
    actorId: user.id,
    storeId,
    resourceType: "StoreShippingReturnsSection",
    resourceId: section.id,
  });

  return section;
}

export async function updateStoreShippingReturnsSection(
  sectionId: string,
  data: {
    heading?: string;
    content?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const section = await prisma.storeShippingReturnsSection.findFirst({
    where: { id: sectionId },
    include: { store: true },
  });

  if (!section || section.store.ownerId !== user.id) {
    throw new Error("Shipping & Returns section not found or unauthorized");
  }

  const updateData: { heading?: string; content?: string } = {};

  if (data.heading !== undefined) {
    updateData.heading = data.heading.trim();
  }

  if (data.content !== undefined) {
    updateData.content = data.content.trim();
  }

  const updatedSection = await prisma.storeShippingReturnsSection.update({
    where: { id: sectionId },
    data: updateData,
  });

  await logAudit({
    action: AuditAction.ShippingSectionUpdated,
    actorId: user.id,
    storeId: section.storeId,
    resourceType: "StoreShippingReturnsSection",
    resourceId: sectionId,
  });

  return updatedSection;
}

export async function deleteStoreShippingReturnsSection(sectionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const section = await prisma.storeShippingReturnsSection.findFirst({
    where: { id: sectionId },
    include: { store: true },
  });

  if (!section || section.store.ownerId !== user.id) {
    throw new Error("Shipping & Returns section not found or unauthorized");
  }

  const deleted = await prisma.storeShippingReturnsSection.delete({
    where: { id: sectionId },
  });

  await logAudit({
    action: AuditAction.ShippingSectionDeleted,
    actorId: user.id,
    storeId: section.storeId,
    resourceType: "StoreShippingReturnsSection",
    resourceId: sectionId,
  });

  return deleted;
}

export async function reorderStoreShippingReturnsSections(
  storeId: string,
  orderedIds: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  if (orderedIds.length === 0) {
    return { success: true };
  }

  const sections = await prisma.storeShippingReturnsSection.findMany({
    where: { id: { in: orderedIds }, storeId },
    select: { id: true },
  });

  if (sections.length !== orderedIds.length) {
    throw new Error("One or more shipping & returns sections could not be reordered");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.storeShippingReturnsSection.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  return { success: true };
}

export async function createStoreTestimonial(
  storeId: string,
  data: {
    customerName: string;
    content: string;
    isPublished?: boolean;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  // Validate input
  const validated = testimonialSchema.parse(data);

  const lastTestimonial = await prisma.storeTestimonial.findFirst({
    where: { storeId },
    orderBy: { sortOrder: "desc" },
  });

  const testimonial = await prisma.storeTestimonial.create({
    data: {
      storeId,
      customerName: sanitizeString(validated.customerName, 200),
      content: sanitizeString(validated.content, 5000),
      isPublished: validated.isPublished ?? true,
      sortOrder: lastTestimonial ? lastTestimonial.sortOrder + 1 : 0,
    },
  });

  await logAudit({
    action: AuditAction.TestimonialCreated,
    actorId: user.id,
    storeId,
    resourceType: "StoreTestimonial",
    resourceId: testimonial.id,
  });

  return testimonial;
}

export async function updateStoreTestimonial(
  testimonialId: string,
  data: {
    customerName?: string;
    content?: string;
    isPublished?: boolean;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const testimonial = await prisma.storeTestimonial.findFirst({
    where: { id: testimonialId },
    include: { store: true },
  });

  if (!testimonial || testimonial.store.ownerId !== user.id) {
    throw new Error("Testimonial not found or unauthorized");
  }

  const updateData: {
    customerName?: string;
    content?: string;
    isPublished?: boolean;
  } = {};

  if (data.customerName !== undefined) {
    updateData.customerName = data.customerName.trim();
  }

  if (data.content !== undefined) {
    updateData.content = data.content.trim();
  }

  if (data.isPublished !== undefined) {
    updateData.isPublished = data.isPublished;
  }

  const updatedTestimonial = await prisma.storeTestimonial.update({
    where: { id: testimonialId },
    data: updateData,
  });

  await logAudit({
    action: AuditAction.TestimonialUpdated,
    actorId: user.id,
    storeId: testimonial.storeId,
    resourceType: "StoreTestimonial",
    resourceId: testimonialId,
  });

  return updatedTestimonial;
}

export async function deleteStoreTestimonial(testimonialId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const testimonial = await prisma.storeTestimonial.findFirst({
    where: { id: testimonialId },
    include: { store: true },
  });

  if (!testimonial || testimonial.store.ownerId !== user.id) {
    throw new Error("Testimonial not found or unauthorized");
  }

  const deleted = await prisma.storeTestimonial.delete({
    where: { id: testimonialId },
  });

  await logAudit({
    action: AuditAction.TestimonialDeleted,
    actorId: user.id,
    storeId: testimonial.storeId,
    resourceType: "StoreTestimonial",
    resourceId: testimonialId,
  });

  return deleted;
}

export async function reorderStoreTestimonials(
  storeId: string,
  orderedIds: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  if (orderedIds.length === 0) {
    return { success: true };
  }

  const testimonials = await prisma.storeTestimonial.findMany({
    where: { id: { in: orderedIds }, storeId },
    select: { id: true },
  });

  if (testimonials.length !== orderedIds.length) {
    throw new Error("One or more testimonials could not be reordered");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.storeTestimonial.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  return { success: true };
}

export async function getProduct(productId: string) {
  return await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      storeId: true,
      name: true,
      description: true,
      sku: true,
      price: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getUserStore() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return await prisma.store.findFirst({
    where: { ownerId: user.id },
    include: { theme: true },
  });
}

export async function createStore(
  userId: string,
  data: { storeName: string; subdomainSlug: string; themeId: string }
) {
  // Verify the caller is actually this user (prevent IDOR)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    throw new Error("Not authenticated or user mismatch");
  }

  // Check if user already has a store (one store per user)
  const existingUserStore = await prisma.store.findFirst({
    where: { ownerId: userId },
  });

  if (existingUserStore) {
    throw new Error("You already have a store. Only one store per account is allowed.");
  }

  // Verify slug uniqueness
  const existingStore = await prisma.store.findUnique({
    where: { subdomainSlug: data.subdomainSlug },
  });

  if (existingStore) {
    throw new Error("This store name is already taken. Please choose another.");
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9][a-z0-9-]{1,}[a-z0-9]$/;
  if (!slugRegex.test(data.subdomainSlug)) {
    throw new Error("Store slug must contain only lowercase letters, numbers, and hyphens.");
  }

  return await prisma.store.create({
    data: {
      ownerId: userId,
      storeName: data.storeName.trim().slice(0, 100),
      subdomainSlug: data.subdomainSlug.slice(0, 50),
      themeId: data.themeId,
    },
  }).then(async (store) => {
    await logAudit({
      action: AuditAction.StoreCreated,
      actorId: userId,
      storeId: store.id,
      resourceType: "Store",
      resourceId: store.id,
      metadata: { storeName: store.storeName, slug: store.subdomainSlug },
    });
    return store;
  });
}

/**
 * Update the custom domain for a store
 * Sets the domain and resets status to Pending
 */
export async function updateStoreDomain(
  storeId: string,
  domain: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    return { success: false, error: "Store not found or unauthorized" };
  }

  // If removing domain
  if (!domain) {
    await prisma.store.update({
      where: { id: storeId },
      data: {
        domain: null,
        domainStatus: DomainStatus.Pending,
        certificateGeneratedAt: null,
      },
    });
    return { success: true };
  }

  // Validate and normalize domain
  const normalizedDomain = normalizeDomain(domain);
  const validation = validateDomainFormat(normalizedDomain);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Check if domain is already used by another store
  const existingStore = await prisma.store.findFirst({
    where: {
      domain: normalizedDomain,
      id: { not: storeId },
    },
  });

  if (existingStore) {
    return { success: false, error: "This domain is already in use by another store" };
  }

  // Update store with new domain
  await prisma.store.update({
    where: { id: storeId },
    data: {
      domain: normalizedDomain,
      domainStatus: DomainStatus.Pending,
      certificateGeneratedAt: null,
    },
  });

  await logAudit({
    action: AuditAction.DomainUpdated,
    actorId: user.id,
    storeId,
    resourceType: "Store",
    resourceId: storeId,
    metadata: { domain: normalizedDomain },
  });

  return { success: true };
}

/**
 * Update domain status for a store.
 * Requires authentication and store ownership verification.
 */
export async function updateDomainStatus(
  storeId: string,
  status: DomainStatus,
  certificateGeneratedAt?: Date
) {
  if (!storeId || !status) {
    throw new Error("Missing required parameters");
  }

  // Auth guard: verify the caller owns this store
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  return await prisma.store.update({
    where: { id: storeId },
    data: {
      domainStatus: status,
      ...(certificateGeneratedAt && { certificateGeneratedAt }),
    },
  }).then(async (updated) => {
    await logAudit({
      action: AuditAction.DomainStatusChanged,
      actorId: user.id,
      storeId,
      resourceType: "Store",
      resourceId: storeId,
      metadata: { status, previousStatus: store.domainStatus },
    });
    return updated;
  });
}

// ==================== STRIPE CONNECT ACTIONS ====================

/**
 * Save Stripe Connect account ID to store after OAuth.
 * Requires authentication and store ownership verification.
 */
export async function saveStripeConnectAccount(
  storeId: string,
  stripeConnectId: string
) {
  // Validate inputs
  if (!storeId || !stripeConnectId) {
    throw new Error("Missing required parameters");
  }

  // Auth guard: verify the caller owns this store
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  const result = await prisma.store.update({
    where: { id: storeId },
    data: {
      stripeConnectId,
      stripeConnectStatus: StripeConnectStatus.Active,
      stripeConnectedAt: new Date(),
    },
  });

  await logAudit({
    action: AuditAction.StripeConnected,
    actorId: user.id,
    storeId,
    resourceType: "Store",
    resourceId: storeId,
    metadata: { stripeConnectId },
  });

  return result;
}

/**
 * Disconnect Stripe account from store
 */
export async function disconnectStripeAccount(storeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    return { success: false, error: "Store not found or unauthorized" };
  }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      stripeConnectId: null,
      stripeConnectStatus: StripeConnectStatus.NotConnected,
      stripeConnectedAt: null,
    },
  });

  await logAudit({
    action: AuditAction.StripeDisconnected,
    actorId: user.id,
    storeId,
    resourceType: "Store",
    resourceId: storeId,
  });

  return { success: true };
}

/**
 * Get Stripe account status and details for the current user's store
 */
export async function getStripeAccountStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      stripeConnectId: true,
      stripeConnectStatus: true,
      stripeConnectedAt: true,
    },
  });

  if (!store) {
    return null;
  }

  if (!store.stripeConnectId) {
    return {
      storeId: store.id,
      isConnected: false,
      status: store.stripeConnectStatus,
    };
  }

  // Get Stripe account details — parallelize independent API calls
  const [account, balance, payouts] = await Promise.all([
    getConnectedAccount(store.stripeConnectId),
    getAccountBalance(store.stripeConnectId),
    getAccountPayouts(store.stripeConnectId, 5),
  ]);

  return {
    storeId: store.id,
    isConnected: true,
    status: store.stripeConnectStatus,
    connectedAt: store.stripeConnectedAt,
    account: account
      ? {
          id: account.id,
          email: account.email,
          businessProfile: account.business_profile,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        }
      : null,
    balance: balance
      ? {
          available: balance.available.map((b) => ({
            amount: b.amount,
            currency: b.currency,
          })),
          pending: balance.pending.map((b) => ({
            amount: b.amount,
            currency: b.currency,
          })),
        }
      : null,
    recentPayouts: payouts.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      arrivalDate: new Date(p.arrival_date * 1000),
    })),
  };
}

export async function getStripePendingCharges(accountId: string, limit = 50) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Verify the account belongs to the user's store
  const store = await prisma.store.findFirst({
    where: { 
      ownerId: user.id,
      stripeConnectId: accountId,
    },
  });

  if (!store) {
    return [];
  }

  // Import and call getPendingCharges (server-side only)
  const { getPendingCharges } = await import("@/lib/stripe");
  return await getPendingCharges(accountId, limit);
}

// ==================== ORDER ACTIONS ====================

/**
 * Create an order from a successful payment
 */
export async function createOrder(data: {
  storeId: string;
  stripePaymentId: string;
  stripeSessionId: string;
  customerEmail: string;
  customerName?: string;
  total: number;
  currency: string;
  items: Array<{
    productId: string;
    variantId: string | null;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  initialStatus?: "Pending" | "Completed";
  shippingInfo?: {
    shippingFirstName?: string;
    shippingLastName?: string;
    shippingCompany?: string;
    shippingAddress?: string;
    shippingApartment?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingZipCode?: string;
    shippingCountry?: string;
    shippingPhone?: string;
  };
}) {
  try {
    const order = await prisma.order.create({
      data: {
        storeId: data.storeId,
        stripePaymentId: data.stripePaymentId,
        stripeSessionId: data.stripeSessionId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        total: data.total / 100, // Convert from cents to dollars
        currency: data.currency,
        status: data.initialStatus === "Completed" ? OrderStatus.Completed : OrderStatus.Pending,
        // Add shipping information
        shippingFirstName: data.shippingInfo?.shippingFirstName,
        shippingLastName: data.shippingInfo?.shippingLastName,
        shippingCompany: data.shippingInfo?.shippingCompany,
        shippingAddress: data.shippingInfo?.shippingAddress,
        shippingApartment: data.shippingInfo?.shippingApartment,
        shippingCity: data.shippingInfo?.shippingCity,
        shippingState: data.shippingInfo?.shippingState,
        shippingZipCode: data.shippingInfo?.shippingZipCode,
        shippingCountry: data.shippingInfo?.shippingCountry,
        shippingPhone: data.shippingInfo?.shippingPhone,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice / 100, // Convert from cents to dollars
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Reduce stock when order is created as Completed (e.g., via verify-session)
    if (data.initialStatus === "Completed") {
      try {
        const variantItems = order.items.filter((item) => item.variantId);
        const baseProductItems = order.items.filter((item) => !item.variantId);
        
        secureLog.info("[Order Created] Stock reduction started", {
          orderId: order.id,
          variantItems: variantItems.length,
          baseProductItems: baseProductItems.length,
          allItems: order.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        });
        
        // Update variant stocks
        if (variantItems.length > 0) {
          // Batch fetch all variant stocks in one query
          const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantItems.map((i) => i.variantId!) } },
            select: { id: true, stock: true },
          });
          const stockMap = new Map(variants.map((v) => [v.id, v.stock]));

          secureLog.info("[Order Created] Variants found", {
            orderId: order.id,
            variantCount: variants.length,
            variants: variants.map((v) => ({ id: v.id, stock: v.stock })),
          });

          const updatesToApply = variantItems
            .filter((item) => {
              const stock = stockMap.get(item.variantId!) ?? 0;
              return Math.min(item.quantity, stock) > 0;
            })
            .map((item) => {
              const stock = stockMap.get(item.variantId!) ?? 0;
              const decrementBy = Math.min(item.quantity, stock);
              secureLog.info("[Stock Update] Decrementing variant", {
                variantId: item.variantId,
                currentStock: stock,
                quantity: item.quantity,
                decrementBy,
              });
              return prisma.productVariant.update({
                where: { id: item.variantId! },
                data: { stock: { decrement: decrementBy } },
              });
            });

          if (updatesToApply.length > 0) {
            await prisma.$transaction(updatesToApply);
            secureLog.info("[Order Created] Variant stock reduced", {
              orderId: order.id,
              updatesApplied: updatesToApply.length,
            });
          }
        }
        
        // Update base product stocks
        if (baseProductItems.length > 0) {
          const products = await prisma.product.findMany({
            where: { id: { in: baseProductItems.map((i) => i.productId) } },
            select: { id: true, stock: true },
          });
          const stockMap = new Map(products.map((p) => [p.id, p.stock]));

          secureLog.info("[Order Created] Base products found", {
            orderId: order.id,
            productCount: products.length,
            products: products.map((p) => ({ id: p.id, stock: p.stock })),
          });

          const updatesToApply = baseProductItems
            .filter((item) => {
              const stock = stockMap.get(item.productId) ?? 0;
              return Math.min(item.quantity, stock) > 0;
            })
            .map((item) => {
              const stock = stockMap.get(item.productId) ?? 0;
              const decrementBy = Math.min(item.quantity, stock);
              secureLog.info("[Stock Update] Decrementing base product", {
                productId: item.productId,
                currentStock: stock,
                quantity: item.quantity,
                decrementBy,
              });
              return prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: decrementBy } },
              });
            });

          if (updatesToApply.length > 0) {
            await prisma.$transaction(updatesToApply);
            secureLog.info("[Order Created] Base product stock reduced", {
              orderId: order.id,
              updatesApplied: updatesToApply.length,
            });
          }
        }
        secureLog.info("[Order Created] Stock reduction completed", {
          orderId: order.id,
          baseProducts: baseProductItems.length,
          variants: variantItems.length,
        });
      } catch (stockError) {
        secureLog.error("[Order Created] Stock reduction error", stockError, {
          orderId: order.id,
        });
        throw stockError;
      }
      
      // Check for low stock and create notification if needed
      await checkAndNotifyLowStock(order.storeId);
    }

    await logAudit({
      action: AuditAction.OrderCreated,
      actorId: null, // Called from webhook/verify-session, no authenticated user
      storeId: order.storeId,
      resourceType: "Order",
      resourceId: order.id,
      metadata: { status: order.status, total: Number(order.total), itemsCount: order.items.length },
    });

    secureLog.info("[Order Created]", {
      orderId: order.id,
      storeId: order.storeId,
      itemsCount: order.items.length,
    });
    return order;
  } catch (error) {
    secureLog.error("[Order Creation Failed]", error, {
      storeId: data.storeId,
    });
    throw error;
  }
}

/**
 * Update order status and payment status, reduce stock if order is completed
 */
export async function updateOrderStatus(
  stripePaymentId: string,
  status: "Pending" | "Completed" | "Failed" | "Refunded",
  paymentStatus?: "Pending" | "Paid" | "Settled" | "Refunded"
) {
  secureLog.info("[Order Status Update] Attempting to update", {
    stripePaymentId,
    status,
    paymentStatus,
  });

  const updateData: any = {
    status: status as OrderStatus,
  };

  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus as PaymentStatus;
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { stripePaymentId },
      data: updateData,
      include: { items: true },
    });

    secureLog.info("[Order Status Update] Order updated successfully", {
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      itemCount: updatedOrder.items.length,
    });

    // Reduce stock when order is completed (batched — avoids N+1)
    if (status === "Completed") {
      try {
        const variantItems = updatedOrder.items.filter((item) => item.variantId);
        const baseProductItems = updatedOrder.items.filter((item) => !item.variantId);
        
        secureLog.info("[Order Status Update] Stock reduction started", {
          orderId: updatedOrder.id,
          variantItems: variantItems.length,
          baseProductItems: baseProductItems.length,
          allItems: updatedOrder.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        });
        
        // Update variant stocks
        if (variantItems.length > 0) {
          const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantItems.map((i) => i.variantId!) } },
            select: { id: true, stock: true },
          });
          const stockMap = new Map(variants.map((v) => [v.id, v.stock]));

          secureLog.info("[Order Status Update] Variants found", {
            orderId: updatedOrder.id,
            variantCount: variants.length,
            variants: variants.map((v) => ({ id: v.id, stock: v.stock })),
          });

          const updatesToApply = variantItems
            .filter((item) => {
              const stock = stockMap.get(item.variantId!) ?? 0;
              return Math.min(item.quantity, stock) > 0;
            })
            .map((item) => {
              const stock = stockMap.get(item.variantId!) ?? 0;
              const decrementBy = Math.min(item.quantity, stock);
              secureLog.info("[Stock Update] Decrementing variant", {
                variantId: item.variantId,
                currentStock: stock,
                quantity: item.quantity,
                decrementBy,
              });
              return prisma.productVariant.update({
                where: { id: item.variantId! },
                data: { stock: { decrement: decrementBy } },
              });
            });

          if (updatesToApply.length > 0) {
            await prisma.$transaction(updatesToApply);
            secureLog.info("[Order Status Update] Variant stock reduced", {
              orderId: updatedOrder.id,
              updatesApplied: updatesToApply.length,
            });
          }
        }
        
        // Update base product stocks
        if (baseProductItems.length > 0) {
          const products = await prisma.product.findMany({
            where: { id: { in: baseProductItems.map((i) => i.productId) } },
            select: { id: true, stock: true },
          });
          const stockMap = new Map(products.map((p) => [p.id, p.stock]));

          secureLog.info("[Order Status Update] Base products found", {
            orderId: updatedOrder.id,
            productCount: products.length,
            products: products.map((p) => ({ id: p.id, stock: p.stock })),
          });

          const updatesToApply = baseProductItems
            .filter((item) => {
              const stock = stockMap.get(item.productId) ?? 0;
              return Math.min(item.quantity, stock) > 0;
            })
            .map((item) => {
              const stock = stockMap.get(item.productId) ?? 0;
              const decrementBy = Math.min(item.quantity, stock);
              secureLog.info("[Stock Update] Decrementing base product", {
                productId: item.productId,
                currentStock: stock,
                quantity: item.quantity,
                decrementBy,
              });
              return prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: decrementBy } },
              });
            });

          if (updatesToApply.length > 0) {
            await prisma.$transaction(updatesToApply);
            secureLog.info("[Order Status Update] Base product stock reduced", {
              orderId: updatedOrder.id,
              updatesApplied: updatesToApply.length,
            });
          }
        }
        secureLog.info("[Order Status Update] Stock reduction completed", {
          orderId: updatedOrder.id,
          baseProducts: baseProductItems.length,
          variants: variantItems.length,
        });
      } catch (stockError) {
        secureLog.error("[Order Status Update] Stock reduction error", stockError, {
          orderId: updatedOrder.id,
        });
        throw stockError;
      }
      
      // Check for low stock and create notification if needed
      await checkAndNotifyLowStock(updatedOrder.storeId);
    }

    await logAudit({
      action: AuditAction.OrderStatusChanged,
      actorId: null, // Called from webhook/verify-session
      storeId: updatedOrder.storeId,
      resourceType: "Order",
      resourceId: updatedOrder.id,
      metadata: { status, paymentStatus, previousStatus: "Pending" },
    });

    return updatedOrder;
  } catch (error) {
    secureLog.error("[Order Status Update] Failed to update order", error, {
      stripePaymentId,
    });
    throw error;
  }
}

/**
 * Mark an order as shipped and send shipping confirmation email
 * @param orderId The order ID to mark as shipped
 * @param trackingNumber Optional tracking number/information provided by the owner
 */
export async function markOrderAsShipped(orderId: string, trackingNumber?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    // Fetch the order with store info to verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: {
          select: { id: true, ownerId: true, storeName: true },
        },
        items: {
          select: {
            productName: true,
            variantInfo: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (order.store.ownerId !== user.id) {
      return { success: false, message: "Unauthorized" };
    }

    if (order.status === "Shipped") {
      return { success: false, message: "Order is already marked as shipped" };
    }

    const shippedAt = new Date();

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.Shipped,
        trackingNumber: trackingNumber || null,
        shippedAt,
      },
    });

    console.log("[Mark as Shipped] Order updated:", {
      orderId: updatedOrder.id,
      trackingNumber,
      shippedAt,
    });

    await logAudit({
      action: AuditAction.OrderShipped,
      actorId: user.id,
      storeId: order.store.id,
      resourceType: "Order",
      resourceId: orderId,
      metadata: { trackingNumber },
    });

    // Send shipping confirmation email
    const { sendShippingConfirmationEmail } = await import("@/lib/email");
    
    const emailResult = await sendShippingConfirmationEmail({
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      storeName: order.store.storeName,
      trackingNumber,
      items: order.items.map((item) => ({
        productName: item.productName,
        variantInfo: item.variantInfo,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
      })),
      shippingAddress: {
        firstName: order.shippingFirstName || undefined,
        lastName: order.shippingLastName || undefined,
        address: order.shippingAddress || undefined,
        apartment: order.shippingApartment || undefined,
        city: order.shippingCity || undefined,
        state: order.shippingState || undefined,
        zipCode: order.shippingZipCode || undefined,
        country: order.shippingCountry || undefined,
      },
    });

    if (!emailResult.success) {
      console.warn("[Mark as Shipped] Email failed but order was updated:", emailResult.message);
    }

    return {
      success: true,
      message: "Order marked as shipped",
      trackingNumber: trackingNumber || null,
      shippedAt: shippedAt.toISOString(),
      emailSent: emailResult.success,
    };
  } catch (error) {
    console.error("[Mark as Shipped] Failed:", {
      orderId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark order as shipped",
    };
  }
}

/**
 * Get orders for the current user's store with optional date filter
 */
export async function getStoreOrders(options?: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });

  if (!store) {
    return [];
  }

  const whereClause: {
    storeId: string;
    createdAt?: { gte?: Date; lte?: Date };
  } = {
    storeId: store.id,
  };

  if (options?.startDate || options?.endDate) {
    whereClause.createdAt = {};
    if (options.startDate) {
      whereClause.createdAt.gte = options.startDate;
    }
    if (options.endDate) {
      whereClause.createdAt.lte = options.endDate;
    }
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    select: {
      id: true,
      customerEmail: true,
      customerName: true,
      total: true,
      currency: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      trackingNumber: true,
      shippedAt: true,
      shippingFirstName: true,
      shippingLastName: true,
      shippingCompany: true,
      shippingAddress: true,
      shippingApartment: true,
      shippingCity: true,
      shippingState: true,
      shippingZipCode: true,
      shippingCountry: true,
      shippingPhone: true,
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          unitPrice: true,
          variantInfo: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit || 50,
  });

  return orders.map((order) => ({
    ...order,
    total: order.total.toString(),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toString(),
    })),
  }));
}

/**
 * Get order statistics for the current user's store
 */
export async function getOrderStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });

  if (!store) {
    return null;
  }

  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Use aggregation + count queries instead of loading all orders into memory
  const [aggregate, totalCount, last7Count, last30Count] = await Promise.all([
    prisma.order.aggregate({
      where: { storeId: store.id, status: OrderStatus.Completed },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: { storeId: store.id, status: OrderStatus.Completed },
    }),
    prisma.order.count({
      where: { storeId: store.id, status: OrderStatus.Completed, createdAt: { gte: last7Days } },
    }),
    prisma.order.count({
      where: { storeId: store.id, status: OrderStatus.Completed, createdAt: { gte: last30Days } },
    }),
  ]);

  return {
    totalOrders: totalCount,
    totalRevenue: (Number(aggregate._sum.total) || 0).toFixed(2),
    last7DaysOrders: last7Count,
    last30DaysOrders: last30Count,
  };
}
