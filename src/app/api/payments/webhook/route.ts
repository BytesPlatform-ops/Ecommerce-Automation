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

  if (!storeId || !itemsJson) {
    console.error("Missing metadata in checkout session");
    return;
  }

  const items = JSON.parse(itemsJson) as Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;

  // Create the order
  await createOrder({
    storeId,
    stripePaymentId: session.payment_intent as string,
    stripeSessionId: session.id,
    customerEmail: session.customer_email || session.customer_details?.email || "unknown@email.com",
    customerName: session.customer_details?.name || undefined,
    total: session.amount_total || 0,
    currency: session.currency || "usd",
    items: items.map((item) => ({
      productId: item.productId,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  });

  console.log("Order created for session:", session.id);
}
