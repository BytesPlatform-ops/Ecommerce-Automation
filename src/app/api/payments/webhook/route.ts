import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { constructWebhookEvent } from "@/lib/stripe";
import { createOrder, updateOrderStatus } from "@/lib/actions";
import { sendOrderConfirmationEmail, sendStoreNotificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, getRequestIp } from "@/lib/audit";
import { secureLog } from "@/lib/security";

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
    await logAudit({
      action: AuditAction.WebhookProcessed,
      actorId: null,
      resourceType: "Webhook",
      metadata: { eventType: event.type, eventId: event.id },
      ipAddress: getRequestIp(request),
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        secureLog.info("[Webhook] Payment intent succeeded", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
        });
        
        // Update order status to Completed and payment status to Paid
        try {
          await updateOrderStatus(paymentIntent.id, "Completed", "Paid");
          secureLog.info("[Webhook] Order marked as Completed");
          
          // Send confirmation email to customer
          await handlePaymentSuccessEmail(paymentIntent.id);
          secureLog.info("[Webhook] Payment success email processed");
        } catch (error) {
          secureLog.error("[Webhook] Error in payment_intent.succeeded handler", error, {
            paymentIntentId: paymentIntent.id,
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        secureLog.warn("[Webhook] Payment failed", { paymentIntentId: paymentIntent.id });
        // If we already created an order, update its status
        try {
          await updateOrderStatus(paymentIntent.id, "Failed");
        } catch {
          // Order might not exist yet, which is fine
        }
        break;
      }

      default:
        secureLog.info(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    secureLog.error("Error processing webhook", err);
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
  const paymentIntentId = session.payment_intent as string;

  secureLog.info("[Webhook] checkout.session.completed", {
    sessionId: session.id,
    storeId,
    paymentIntentId,
    amount: session.amount_total,
    paymentStatus: session.payment_status,
    hasItemsMetadata: !!itemsJson,
    hasShippingInfo: !!shippingInfoJson,
  });

  if (!storeId || !itemsJson || !paymentIntentId) {
    secureLog.error("[Webhook] Missing required data in checkout session", undefined, { 
      storeId, 
      hasItems: !!itemsJson, 
      paymentIntentId,
      sessionId: session.id,
    });
    return;
  }

  const parsedItems = JSON.parse(itemsJson);
  
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
    } catch (error) {
      secureLog.error("[Webhook] Failed to parse shipping info", error);
    }
  }

  // Always create order with Pending status
  // It will be updated to Completed when payment_intent.succeeded webhook fires
  const initialStatus: "Pending" | "Completed" = "Pending";

  const customerEmail = session.customer_email || session.customer_details?.email || "unknown@email.com";

  const orderData = {
    storeId,
    stripePaymentId: paymentIntentId,
    stripeSessionId: session.id,
    customerEmail,
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

  secureLog.info("[Webhook] Creating order", { storeId, sessionId: session.id });

  // Create the order
  try {
    const order = await createOrder(orderData);
    secureLog.info("[Webhook] Order created successfully", { orderId: order.id, status: "Pending" });
    
    // FALLBACK: Also attempt to send emails immediately if payment is already paid
    // This handles cases where payment_intent.succeeded doesn't fire or is delayed
    if (session.payment_status === "paid") {
      secureLog.info("[Webhook] Payment already paid, attempting immediate email as fallback");
      try {
        await handlePaymentSuccessEmail(paymentIntentId);
      } catch (fallbackError) {
        secureLog.error("[Webhook] Fallback email send failed", fallbackError);
      }
    }
  } catch (error) {
    secureLog.error("[Webhook] Failed to create order", error, {
      sessionId: session.id,
      storeId,
    });
    throw error;
  }
}

async function handlePaymentSuccessEmail(stripePaymentId: string) {
  secureLog.info("[Email] Starting email handler", { stripePaymentId });
  
  try {
    // Fetch the order with all details
    const order = await prisma.order.findUnique({
      where: { stripePaymentId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        store: true,
      },
    });

    if (!order) {
      secureLog.error("[Email] Order not found for payment", undefined, { stripePaymentId });
      return;
    }

    secureLog.info("[Email] Found order", {
      orderId: order.id,
      status: order.status,
      itemCount: order.items.length,
    });

    // Format order items for email
    const emailItems = order.items.map((item) => {
      return {
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        variantInfo: item.variantInfo,
      };
    });

    // Send customer confirmation email
    if (!order.customerEmail) {
      secureLog.error("[Email] No customer email - cannot send", undefined, { orderId: order.id });
      return;
    }

    const customerEmailResult = await sendOrderConfirmationEmail({
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: emailItems,
      total: order.total.toString(),
      currency: order.currency,
      storeName: order.store.storeName,
    });

    if (!customerEmailResult.success) {
      secureLog.error("[Email] Failed to send customer email", undefined, { message: customerEmailResult.message });
    } else {
      secureLog.info("[Email] Customer email sent successfully");
    }

    // Send store notification email if store has contact email configured
    if (order.store.contactEmail) {
      const storeEmailResult = await sendStoreNotificationEmail(
        order.store.contactEmail,
        {
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          items: emailItems,
          total: order.total.toString(),
          currency: order.currency,
          storeName: order.store.storeName,
        }
      );

      if (!storeEmailResult.success) {
        secureLog.error("[Email] Failed to send store notification", undefined, { message: storeEmailResult.message });
      } else {
        secureLog.info("[Email] Store notification sent successfully");
      }
    }
    
    secureLog.info("[Email] Email handler complete", { orderId: order.id });
  } catch (error) {
    secureLog.error("[Email] Error in handlePaymentSuccessEmail", error);
    // Don't throw - log the error but continue webhook processing
  }
}
