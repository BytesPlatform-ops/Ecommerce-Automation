"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { validateDomainFormat, normalizeDomain, DOMAIN_STATUS } from "@/lib/domain-utils";
import { DomainStatus, StripeConnectStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import {
  getConnectedAccount,
  getAccountBalance,
  getAccountPayouts,
} from "@/lib/stripe";

export async function createProduct(
  storeId: string,
  data: { 
    name: string; 
    description?: string;
    price: number; 
    imageUrl?: string;
    imageUrls?: string[];
    variants?: Array<{
      sizeType: string;
      value?: string;
      unit: string;
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

  const primaryImageUrl = data.imageUrls?.[0] ?? data.imageUrl ?? null;

  const product = await prisma.product.create({
    data: {
      storeId,
      name: data.name,
      description: data.description || null,
      price: data.price,
      imageUrl: primaryImageUrl,
      images: data.imageUrls && data.imageUrls.length > 0 ? {
        create: data.imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
        })),
      } : undefined,
      variants: data.variants && data.variants.length > 0 ? {
        create: data.variants.map(v => ({
          sizeType: v.sizeType,
          value: v.value || null,
          unit: v.unit,
          stock: v.stock,
        })),
      } : undefined,
    },
    include: {
      variants: true,
    },
  });
  
  return {
    ...product,
    price: product.price.toString(),
  };
}

export async function updateProduct(
  productId: string,
  data: { 
    name: string; 
    description?: string;
    price: number; 
    imageUrl?: string;
    imageUrls?: string[];
    variants?: Array<{
      id?: string;
      sizeType: string;
      value?: string;
      unit: string;
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

  // Handle variant updates (delete old ones and create new ones for simplicity)
  if (data.variants !== undefined) {
    // Delete existing variants
    await prisma.productVariant.deleteMany({
      where: { productId },
    });
  }

  if (data.imageUrls !== undefined) {
    await prisma.productImage.deleteMany({
      where: { productId },
    });
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      description: data.description ?? undefined,
      price: data.price,
      imageUrl: primaryImageUrl,
      images: data.imageUrls && data.imageUrls.length > 0 ? {
        create: data.imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
        })),
      } : undefined,
      variants: data.variants && data.variants.length > 0 ? {
        create: data.variants.map(v => ({
          sizeType: v.sizeType,
          value: v.value || null,
          unit: v.unit,
          stock: v.stock,
        })),
      } : undefined,
    },
    include: {
      variants: true,
    },
  });
  
  return {
    ...product,
    price: product.price.toString(),
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

  const deletedProduct = await prisma.product.delete({
    where: { id: productId },
  });

  return {
    ...deletedProduct,
    price: deletedProduct.price.toString(),
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

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  const updateData: any = {
    storeName: data.storeName,
    aboutText: data.aboutText,
    themeId: data.themeId,
  };

  if (data.heroImageUrl !== undefined) {
    updateData.heroImageUrl = data.heroImageUrl;
  }

  if (data.heroHeadline !== undefined) {
    updateData.heroHeadline = data.heroHeadline;
  }

  if (data.heroDescription !== undefined) {
    updateData.heroDescription = data.heroDescription;
  }

  if (data.storeLogoUrl !== undefined) {
    updateData.storeLogoUrl = data.storeLogoUrl;
  }

  if (data.contactEmail !== undefined) {
    updateData.contactEmail = data.contactEmail;
  }

  if (data.contactPhone !== undefined) {
    updateData.contactPhone = data.contactPhone;
  }

  if (data.instagramUrl !== undefined) {
    updateData.instagramUrl = data.instagramUrl;
  }

  if (data.facebookUrl !== undefined) {
    updateData.facebookUrl = data.facebookUrl;
  }

  if (data.twitterUrl !== undefined) {
    updateData.twitterUrl = data.twitterUrl;
  }

  if (data.linkedinUrl !== undefined) {
    updateData.linkedinUrl = data.linkedinUrl;
  }

  if (data.youtubeUrl !== undefined) {
    updateData.youtubeUrl = data.youtubeUrl;
  }

  if (data.whatsappNumber !== undefined) {
    updateData.whatsappNumber = data.whatsappNumber;
  }

  if (data.supportedQueryTypes !== undefined) {
    updateData.supportedQueryTypes = data.supportedQueryTypes;
  }

  return await prisma.store.update({
    where: { id: storeId },
    data: updateData,
  });
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

  const lastFaq = await prisma.storeFaq.findFirst({
    where: { storeId },
    orderBy: { sortOrder: "desc" },
  });

  const faq = await prisma.storeFaq.create({
    data: {
      storeId,
      question: data.question.trim(),
      answer: data.answer.trim(),
      isPublished: data.isPublished ?? true,
      sortOrder: lastFaq ? lastFaq.sortOrder + 1 : 0,
    },
  });

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

  return await prisma.storeFaq.update({
    where: { id: faqId },
    data: updateData,
  });
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

  return await prisma.storeFaq.delete({
    where: { id: faqId },
  });
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

  const lastSection = await prisma.storePrivacySection.findFirst({
    where: { storeId },
    orderBy: { sortOrder: "desc" },
  });

  return await prisma.storePrivacySection.create({
    data: {
      storeId,
      heading: data.heading.trim(),
      content: data.content.trim(),
      sortOrder: lastSection ? lastSection.sortOrder + 1 : 0,
    },
  });
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

  return await prisma.storePrivacySection.update({
    where: { id: sectionId },
    data: updateData,
  });
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

  return await prisma.storePrivacySection.delete({
    where: { id: sectionId },
  });
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

  const lastTestimonial = await prisma.storeTestimonial.findFirst({
    where: { storeId },
    orderBy: { sortOrder: "desc" },
  });

  const testimonial = await prisma.storeTestimonial.create({
    data: {
      storeId,
      customerName: data.customerName.trim(),
      content: data.content.trim(),
      isPublished: data.isPublished ?? true,
      sortOrder: lastTestimonial ? lastTestimonial.sortOrder + 1 : 0,
    },
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

  return await prisma.storeTestimonial.update({
    where: { id: testimonialId },
    data: updateData,
  });
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

  return await prisma.storeTestimonial.delete({
    where: { id: testimonialId },
  });
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
  // Verify slug uniqueness
  const existingStore = await prisma.store.findUnique({
    where: { subdomainSlug: data.subdomainSlug },
  });

  if (existingStore) {
    throw new Error("This store name is already taken. Please choose another.");
  }

  return await prisma.store.create({
    data: {
      ownerId: userId,
      storeName: data.storeName,
      subdomainSlug: data.subdomainSlug,
      themeId: data.themeId,
    },
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

  return { success: true };
}

/**
 * Update domain status for a store (internal use by API routes)
 */
export async function updateDomainStatus(
  storeId: string,
  status: DomainStatus,
  certificateGeneratedAt?: Date
) {
  return await prisma.store.update({
    where: { id: storeId },
    data: {
      domainStatus: status,
      ...(certificateGeneratedAt && { certificateGeneratedAt }),
    },
  });
}

// ==================== STRIPE CONNECT ACTIONS ====================

/**
 * Save Stripe Connect account ID to store after OAuth
 */
export async function saveStripeConnectAccount(
  storeId: string,
  stripeConnectId: string
) {
  return await prisma.store.update({
    where: { id: storeId },
    data: {
      stripeConnectId,
      stripeConnectStatus: StripeConnectStatus.Active,
      stripeConnectedAt: new Date(),
    },
  });
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

  // Get Stripe account details
  const account = await getConnectedAccount(store.stripeConnectId);
  const balance = await getAccountBalance(store.stripeConnectId);
  const payouts = await getAccountPayouts(store.stripeConnectId, 5);

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
      for (const item of order.items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }
      console.log("[Order Created] Stock reduced for Completed order:", order.id);
    }

    console.log("[Order Created]", {
      orderId: order.id,
      storeId: order.storeId,
      amount: order.total,
      itemsCount: order.items.length
    });
    return order;
  } catch (error) {
    console.error("[Order Creation Failed]", {
      error: error instanceof Error ? error.message : String(error),
      storeId: data.storeId,
      paymentId: data.stripePaymentId,
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
  const updateData: any = {
    status: status as OrderStatus,
  };

  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus as PaymentStatus;
  }

  const updatedOrder = await prisma.order.update({
    where: { stripePaymentId },
    data: updateData,
    include: { items: true },
  });

  // Reduce stock when order is completed
  if (status === "Completed") {
    for (const item of updatedOrder.items) {
      if (item.variantId) {
        // If item has a variant, reduce variant stock
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }
  }

  return updatedOrder;
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
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, imageUrl: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit,
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

  const [totalOrders, totalRevenue, last7DaysOrders, last30DaysOrders] =
    await Promise.all([
      prisma.order.count({
        where: { storeId: store.id, status: OrderStatus.Completed },
      }),
      prisma.order.aggregate({
        where: { storeId: store.id, status: OrderStatus.Completed },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          storeId: store.id,
          status: OrderStatus.Completed,
          createdAt: { gte: last7Days },
        },
      }),
      prisma.order.count({
        where: {
          storeId: store.id,
          status: OrderStatus.Completed,
          createdAt: { gte: last30Days },
        },
      }),
    ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total?.toString() || "0",
    last7DaysOrders,
    last30DaysOrders,
  };
}
