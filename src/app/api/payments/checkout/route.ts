import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[Checkout API] Received request body:", JSON.stringify(body, null, 2));
    
    const {
      storeId,
      items,
      customerEmail,
      shippingInfo,
    }: {
      storeId: string;
      items: Array<{
        productId: string;
        variantId?: string | null;
        quantity: number;
      }>;
      customerEmail?: string;
      shippingInfo?: {
        country: string;
        firstName: string;
        lastName: string;
        company: string;
        address: string;
        apartment: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
      };
    } = body;

    console.log("[Checkout API] Parsed shipping info:", shippingInfo);

    if (!storeId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: storeId, items" },
        { status: 400 }
      );
    }

    // Get the store and verify it has Stripe connected
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        storeName: true,
        subdomainSlug: true,
        stripeConnectId: true,
        stripeConnectStatus: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    if (!store.stripeConnectId || store.stripeConnectStatus !== "Active") {
      return NextResponse.json(
        { error: "This store has not set up payments yet" },
        { status: 400 }
      );
    }

    // Get products with their prices
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: storeId,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products not found" },
        { status: 400 }
      );
    }

    // Build line items
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        name: product.name,
        unitAmount: Math.round(Number(product.price) * 100), // Convert to cents
        quantity: item.quantity,
        productId: product.id,
        variantId: item.variantId || null,
      };
    });

    // Determine URLs for success and cancel
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const storeUrl = `${baseUrl}/stores/${store.subdomainSlug}`;
    const successUrl = `${storeUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}&store_id=${storeId}`;
    const cancelUrl = `${storeUrl}?checkout=cancelled`;

    // Create checkout session
    const session = await createCheckoutSession({
      storeId,
      stripeConnectId: store.stripeConnectId,
      lineItems,
      customerEmail,
      successUrl,
      cancelUrl,
      shippingInfo,
    });

    console.log("[Checkout API] Stripe session created:", session.id);
    console.log("[Checkout API] Session URL:", session.url);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
