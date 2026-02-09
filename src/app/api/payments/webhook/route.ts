import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { constructWebhookEvent } from "@/lib/stripe";
import { createOrder, updateOrderStatus } from "@/lib/actions";

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

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        // Update order status to Completed and payment status to Paid
        try {
          await updateOrderStatus(paymentIntent.id, "Completed", "Paid");
          console.log("[Webhook] Order marked as Completed, payment status: Paid", paymentIntent.id);
        } catch (error) {
          console.error("[Webhook] Failed to update order status:", error);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", paymentIntent.id);
        // If we already created an order, update its status
        try {
          await updateOrderStatus(paymentIntent.id, "Failed");
        } catch {
          // Order might not exist yet, which is fine
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Extract metadata
  const storeId = session.metadata?.storeId;
  const itemsJson = session.metadata?.items;
  const shippingInfoJson = session.metadata?.shippingInfo;

  console.log("[Webhook] checkout.session.completed", {
    sessionId: session.id,
    storeId,
    amount: session.amount_total,
    paymentStatus: session.payment_status,
    hasItemsMetadata: !!itemsJson,
    hasShippingInfo: !!shippingInfoJson,
    metadata: session.metadata
  });

  if (!storeId || !itemsJson) {
    console.error("[Webhook] Missing metadata in checkout session", { storeId, hasItems: !!itemsJson });
    return;
  }

  const parsedItems = JSON.parse(itemsJson);
  console.log("[Webhook] Parsed items:", parsedItems);
  
  const items = parsedItems as Array<{
    productId: string;
    variantId: string | null;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;

  // Parse shipping info if available
  let shippingInfo = null;
  if (shippingInfoJson) {
    try {
      shippingInfo = JSON.parse(shippingInfoJson);
      console.log("[Webhook] Parsed shipping info:", shippingInfo);
    } catch (error) {
      console.error("[Webhook] Failed to parse shipping info:", error);
    }
  }

  // Always create order with Pending status
  // It will be updated to Completed when payment_intent.succeeded webhook fires
  const initialStatus: "Pending" | "Completed" = "Pending";

  const orderData = {
    storeId,
    stripePaymentId: session.payment_intent as string,
    stripeSessionId: session.id,
    customerEmail: session.customer_email || session.customer_details?.email || "unknown@email.com",
    customerName: session.customer_details?.name || undefined,
    total: session.amount_total || 0,
    currency: session.currency || "usd",
    items: items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId || null,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    initialStatus,
    shippingInfo: shippingInfo ? {
      shippingFirstName: shippingInfo.firstName,
      shippingLastName: shippingInfo.lastName,
      shippingCompany: shippingInfo.company,
      shippingAddress: shippingInfo.address,
      shippingApartment: shippingInfo.apartment,
      shippingCity: shippingInfo.city,
      shippingState: shippingInfo.state,
      shippingZipCode: shippingInfo.zipCode,
      shippingCountry: shippingInfo.country,
      shippingPhone: shippingInfo.phone,
    } : undefined,
  };

  console.log("[Webhook] Creating order with data:", JSON.stringify(orderData, null, 2));

  // Create the order
  try {
    const order = await createOrder(orderData);
    console.log("[Webhook] Order created successfully:", order.id, "with status: Pending");
  } catch (error) {
    console.error("[Webhook] Failed to create order", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      sessionId: session.id,
      storeId
    });
    throw error;
  }
}
