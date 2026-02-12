import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { validateAddress } from "@/lib/address-validation";

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

    // Validate shipping information if provided
    if (shippingInfo) {
      const addressValidation = validateAddress(
        shippingInfo.firstName,
        shippingInfo.lastName,
        shippingInfo.address,
        shippingInfo.city,
        shippingInfo.state,
        shippingInfo.zipCode,
        shippingInfo.phone,
        shippingInfo.country
      );

      if (!addressValidation.isValid) {
        console.log("[Checkout API] Address validation failed:", addressValidation.errors);
        return NextResponse.json(
          { 
            error: "Invalid shipping address",
            details: addressValidation.errors.join("; ")
          },
          { status: 400 }
        );
      }

      if (addressValidation.warnings.length > 0) {
        console.log("[Checkout API] Address warnings:", addressValidation.warnings);
        // Log warnings but allow checkout to proceed
      }
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
    // Check if request is from a custom domain
    const requestHost = request.headers.get("host") || "";
    const requestOrigin = request.headers.get("origin") || "";
    
    console.log("[Checkout API] Request host:", requestHost);
    console.log("[Checkout API] Request origin:", requestOrigin);
    
    // Check if the request is from a custom domain (not localhost and not the server domain)
    const isCustomDomain = !requestHost.includes("localhost") && 
                          !requestHost.includes("127.0.0.1") &&
                          requestHost !== process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "");
    
    let storeUrl: string;
    
    if (isCustomDomain && requestOrigin) {
      // Use the custom domain origin
      storeUrl = requestOrigin;
      console.log("[Checkout API] Using custom domain URL:", storeUrl);
    } else {
      // Use the server URL with nested route
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
      storeUrl = `${baseUrl}/stores/${store.subdomainSlug}`;
      console.log("[Checkout API] Using server URL:", storeUrl);
    }
    
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
