import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  getOrCreatePrices,
  createSubscriptionCheckoutSession,
} from "@/lib/stripe";

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

    // Parse body
    const body = await request.json();
    const { billingPeriod } = body as { billingPeriod: "monthly" | "yearly" };

    if (!billingPeriod || !["monthly", "yearly"].includes(billingPeriod)) {
      return NextResponse.json(
        { error: "Invalid billing period. Must be 'monthly' or 'yearly'." },
        { status: 400 }
      );
    }

    // Find user's store
    const store = await prisma.store.findFirst({
      where: { ownerId: user.id },
      select: {
        id: true,
        storeName: true,
        stripeCustomerId: true,
        subscriptionTier: true,
        stripeSubscriptionStatus: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Don't allow checkout if already subscribed and active
    if (
      store.subscriptionTier === "PRO" &&
      store.stripeSubscriptionStatus === "active"
    ) {
      return NextResponse.json(
        { error: "You already have an active Pro subscription." },
        { status: 400 }
      );
    }

    // Get or create Stripe prices
    const { monthlyPriceId, yearlyPriceId } = await getOrCreatePrices();
    const priceId = billingPeriod === "monthly" ? monthlyPriceId : yearlyPriceId;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const successUrl = `${baseUrl}/dashboard?subscription=success`;
    const cancelUrl = `${baseUrl}/dashboard?subscription=canceled`;

    // Create checkout session
    const session = await createSubscriptionCheckoutSession({
      storeId: store.id,
      storeName: store.storeName,
      email: user.email!,
      stripeCustomerId: store.stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl,
    });

    // If a new customer was created, save the ID now
    if (!store.stripeCustomerId && session.customer) {
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer.id;
      await prisma.store.update({
        where: { id: store.id },
        data: { stripeCustomerId: customerId },
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
