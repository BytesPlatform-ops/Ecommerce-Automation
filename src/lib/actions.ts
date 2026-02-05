"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { validateDomainFormat, normalizeDomain, DOMAIN_STATUS } from "@/lib/domain-utils";
import { DomainStatus, StripeConnectStatus, OrderStatus } from "@prisma/client";
import {
  getConnectedAccount,
  getAccountBalance,
  getAccountPayouts,
} from "@/lib/stripe";

export async function createProduct(
  storeId: string,
  data: { name: string; price: number; imageUrl?: string }
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

  const product = await prisma.product.create({
    data: {
      storeId,
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl || null,
    },
  });
  
  return {
    ...product,
    price: product.price.toString(),
  };
}

export async function updateProduct(
  productId: string,
  data: { name: string; price: number; imageUrl?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify product ownership via store
  const existingProduct = await prisma.product.findFirst({
    where: { id: productId },
    include: { store: true },
  });

  if (!existingProduct || existingProduct.store.ownerId !== user.id) {
    throw new Error("Product not found or unauthorized");
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl ?? undefined,
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
  data: { storeName?: string; aboutText?: string; themeId?: string }
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

  return await prisma.store.update({
    where: { id: storeId },
    data: {
      storeName: data.storeName,
      aboutText: data.aboutText,
      themeId: data.themeId,
    },
  });
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
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  initialStatus?: "Pending" | "Completed";
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
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
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
 * Update order status
 */
export async function updateOrderStatus(
  stripePaymentId: string,
  status: "Pending" | "Completed" | "Failed" | "Refunded"
) {
  return await prisma.order.update({
    where: { stripePaymentId },
    data: { status: status as OrderStatus },
  });
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
