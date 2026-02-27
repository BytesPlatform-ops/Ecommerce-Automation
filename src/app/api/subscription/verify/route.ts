import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { SubscriptionTier } from "@prisma/client";
import { logAudit, AuditAction } from "@/lib/audit";
import { secureLog } from "@/lib/security";
import Stripe from "stripe";

const PRO_PRODUCT_LIMIT = 100;

/**
 * Helper: Extract current_period_end from a Stripe Subscription.
 * In Stripe API v2026, current_period_end lives on SubscriptionItem, not Subscription.
 */
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date {
  const item = subscription.items?.data?.[0];
  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000);
  }
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000);
  }
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

/**
 * POST /api/subscription/verify
 * 
 * Called after the user returns from Stripe Checkout to verify the payment
 * and update the subscription tier. This serves as a fallback in case the
 * webhook was not received or failed.
 * 
 * Body: { sessionId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body as { sessionId?: string };

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // Find user's store
    const store = await prisma.store.findFirst({
      where: { ownerId: user.id },
      select: {
        id: true,
        subscriptionTier: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // If already PRO and active, no need to verify
    if (
      store.subscriptionTier === "PRO" &&
      store.stripeSubscriptionStatus === "active"
    ) {
      return NextResponse.json({
        success: true,
        message: "Already on Pro plan",
        tier: "PRO",
      });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to this store
    if (session.metadata?.storeId !== store.id) {
      return NextResponse.json(
        { error: "Session does not match your store" },
        { status: 403 }
      );
    }

    // Check the payment status
    if (session.payment_status !== "paid") {
      return NextResponse.json({
        success: false,
        message: "Payment not completed",
        paymentStatus: session.payment_status,
      });
    }

    // Session is paid — get the subscription details
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    if (!subscriptionId || !customerId) {
      return NextResponse.json(
        { error: "Missing subscription or customer ID in session" },
        { status: 500 }
      );
    }

    // Fetch the full subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the store to PRO
    await prisma.store.update({
      where: { id: store.id },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripeSubscriptionStatus: subscription.status,
        subscriptionTier: SubscriptionTier.PRO,
        productLimit: PRO_PRODUCT_LIMIT,
        subscriptionCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
      },
    });

    // Log the activation (only if it wasn't already set by webhook)
    if (store.stripeSubscriptionId !== subscriptionId) {
      await logAudit({
        action: AuditAction.SubscriptionCreated,
        actorId: user.id,
        storeId: store.id,
        resourceType: "Subscription",
        resourceId: subscriptionId,
        metadata: {
          customerId,
          status: subscription.status,
          source: "verify-fallback",
          priceId: subscription.items.data[0]?.price?.id,
          interval: subscription.items.data[0]?.price?.recurring?.interval,
        },
      });
    }

    secureLog.info("Subscription verified and activated via fallback", {
      storeId: store.id,
      subscriptionId,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription activated",
      tier: "PRO",
    });
  } catch (error) {
    console.error("Subscription verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify subscription" },
      { status: 500 }
    );
  }
}
