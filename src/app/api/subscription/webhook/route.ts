import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe, constructWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction } from "@/lib/audit";
import { secureLog } from "@/lib/security";
import { SubscriptionTier } from "@prisma/client";

const GRACE_PERIOD_DAYS = 14;
const PRO_PRODUCT_LIMIT = 100;
const FREE_PRODUCT_LIMIT = 15;

/**
 * Helper: Extract current_period_end from a Stripe Subscription.
 * In Stripe API v2026, current_period_end lives on SubscriptionItem, not Subscription.
 */
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date {
  const item = subscription.items?.data?.[0];
  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000);
  }
  // Fallback to cancel_at or now + 30 days
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000);
  }
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

/**
 * Helper: Extract subscription ID from an Invoice.
 * In Stripe API v2026, subscription is at invoice.parent.subscription_details.subscription.
 */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const subDetails = invoice.parent?.subscription_details;
  if (subDetails?.subscription) {
    return typeof subDetails.subscription === "string"
      ? subDetails.subscription
      : subDetails.subscription.id;
  }
  return null;
}

/**
 * Subscription webhook — handles platform subscription lifecycle events.
 * This is SEPARATE from the existing Connect/marketplace webhook at /api/payments/webhook.
 * 
 * Configure in Stripe Dashboard:
 *   Endpoint URL: https://<domain>/api/subscription/webhook
 *   Events: checkout.session.completed, customer.subscription.updated,
 *           customer.subscription.deleted, invoice.paid, invoice.payment_failed
 *   Signing secret → STRIPE_PLATFORM_WEBHOOK_SECRET env var
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_PLATFORM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_PLATFORM_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Subscription webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    secureLog.info("Subscription webhook event received", {
      type: event.type,
      id: event.id,
    });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        secureLog.info("Unhandled subscription webhook event", { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing subscription webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ==================== EVENT HANDLERS ====================

/**
 * checkout.session.completed (mode=subscription)
 * Fired when a customer completes the Stripe Checkout and the subscription is created.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") return;

  const storeId = session.metadata?.storeId;
  if (!storeId) {
    console.error("No storeId in checkout session metadata");
    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!customerId || !subscriptionId) {
    console.error("Missing customer or subscription ID in checkout session");
    return;
  }

  // Fetch the full subscription to get period end
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await prisma.store.update({
    where: { id: storeId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripeSubscriptionStatus: subscription.status,
      subscriptionTier: SubscriptionTier.PRO,
      productLimit: PRO_PRODUCT_LIMIT,
      subscriptionCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    },
  });

  await logAudit({
    action: AuditAction.SubscriptionCreated,
    actorId: null,
    storeId,
    resourceType: "Subscription",
    resourceId: subscriptionId,
    metadata: {
      customerId,
      status: subscription.status,
      priceId: subscription.items.data[0]?.price?.id,
      interval: subscription.items.data[0]?.price?.recurring?.interval,
    },
  });

  secureLog.info("Subscription activated", { storeId, subscriptionId });
}

/**
 * customer.subscription.updated
 * Fired when the subscription status changes (e.g., past_due, active after retry, plan change).
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const storeId = subscription.metadata?.storeId;
  if (!storeId) {
    // Try to find store by subscription ID
    const store = await prisma.store.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      select: { id: true },
    });
    if (!store) {
      console.error("No store found for subscription", subscription.id);
      return;
    }
    await updateStoreSubscription(store.id, subscription);
    return;
  }

  await updateStoreSubscription(storeId, subscription);
}

/**
 * customer.subscription.deleted
 * Fired when the subscription is canceled (immediately or at period end).
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const storeId = subscription.metadata?.storeId;
  let resolvedStoreId = storeId;

  if (!resolvedStoreId) {
    const store = await prisma.store.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      select: { id: true },
    });
    if (!store) {
      console.error("No store found for deleted subscription", subscription.id);
      return;
    }
    resolvedStoreId = store.id;
  }

  // Set grace period: current_period_end + 14 days
  const periodEnd = getSubscriptionPeriodEnd(subscription);
  const graceEnd = new Date(periodEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  await prisma.store.update({
    where: { id: resolvedStoreId },
    data: {
      stripeSubscriptionStatus: "canceled",
      subscriptionTier: SubscriptionTier.FREE,
      productLimit: FREE_PRODUCT_LIMIT,
      subscriptionCurrentPeriodEnd: graceEnd,
    },
  });

  await logAudit({
    action: AuditAction.SubscriptionCanceled,
    actorId: null,
    storeId: resolvedStoreId,
    resourceType: "Subscription",
    resourceId: subscription.id,
    metadata: {
      periodEnd: periodEnd.toISOString(),
      graceEnd: graceEnd.toISOString(),
    },
  });

  secureLog.info("Subscription canceled with grace period", {
    storeId: resolvedStoreId,
    graceEnd: graceEnd.toISOString(),
  });
}

/**
 * invoice.paid
 * Confirms subscription renewal was successful.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const store = await prisma.store.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    select: { id: true },
  });

  if (!store) return;

  // Fetch updated subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await prisma.store.update({
    where: { id: store.id },
    data: {
      stripeSubscriptionStatus: "active",
      subscriptionTier: SubscriptionTier.PRO,
      productLimit: PRO_PRODUCT_LIMIT,
      subscriptionCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    },
  });

  secureLog.info("Subscription invoice paid", { storeId: store.id, subscriptionId });
}

/**
 * invoice.payment_failed
 * Sets subscription to past_due so the dashboard can show a warning.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const store = await prisma.store.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    select: { id: true },
  });

  if (!store) return;

  await prisma.store.update({
    where: { id: store.id },
    data: {
      stripeSubscriptionStatus: "past_due",
    },
  });

  secureLog.info("Subscription payment failed", { storeId: store.id, subscriptionId });
}

// ==================== HELPERS ====================

async function updateStoreSubscription(storeId: string, subscription: Stripe.Subscription) {
  const isActive = ["active", "trialing"].includes(subscription.status);

  await prisma.store.update({
    where: { id: storeId },
    data: {
      stripeSubscriptionStatus: subscription.status,
      subscriptionTier: isActive ? SubscriptionTier.PRO : undefined,
      productLimit: isActive ? PRO_PRODUCT_LIMIT : undefined,
      subscriptionCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    },
  });

  await logAudit({
    action: AuditAction.SubscriptionUpdated,
    actorId: null,
    storeId,
    resourceType: "Subscription",
    resourceId: subscription.id,
    metadata: {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  secureLog.info("Subscription updated", { storeId, status: subscription.status });
}
