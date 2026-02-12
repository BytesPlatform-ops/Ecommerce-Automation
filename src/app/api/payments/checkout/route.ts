import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { validateAddress } from "@/lib/address-validation";
import { checkRateLimit } from "@/lib/security";
import { logAudit, AuditAction, getRequestIp } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP: max 10 checkout attempts per minute
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimit = checkRateLimit(`checkout:${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)) } }
      );
    }

    const body = await request.json();
    
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
      include: {
        variants: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products not found" },
        { status: 400 }
      );
    }

    // Build line items — use variant-specific price when available
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      let unitAmount = Math.round(Number(product.price) * 100); // Default: base price in cents

      // If a variant is specified and has its own price, use that instead
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant && variant.price !== null) {
          unitAmount = Math.round(Number(variant.price) * 100);
        }
      }

      return {
        name: product.name,
        unitAmount,
        quantity: item.quantity,
        productId: product.id,
        variantId: item.variantId || null,
      };
    });

    // Determine URLs for success and cancel
    // Check if request is from a custom domain
    const requestHost = request.headers.get("host") || "";
    const requestOrigin = request.headers.get("origin") || "";
    
    // Check if the request is from a custom domain (not localhost and not the server domain)
    const isCustomDomain = !requestHost.includes("localhost") && 
                          !requestHost.includes("127.0.0.1") &&
                          requestHost !== process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "");
    
    let storeUrl: string;
    
    if (isCustomDomain && requestOrigin) {
      // Use the custom domain origin
      storeUrl = requestOrigin;
    } else {
      // Use the server URL with nested route
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
      storeUrl = `${baseUrl}/stores/${store.subdomainSlug}`;
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

    await logAudit({
      action: AuditAction.CheckoutCreated,
      actorId: null,
      storeId,
      resourceType: "Checkout",
      resourceId: session.id,
      ipAddress: getRequestIp(request),
      metadata: { itemCount: lineItems.length },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
