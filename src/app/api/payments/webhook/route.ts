import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { constructWebhookEvent } from "@/lib/stripe";
import { createOrder, updateOrderStatus } from "@/lib/actions";
import { sendOrderConfirmationEmail, sendStoreNotificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

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
        console.log("[Webhook] payment_intent.succeeded:", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
          clientSecret: paymentIntent.client_secret?.substring(0, 20) + "..."
        });
        
        // Update order status to Completed and payment status to Paid
        try {
          await updateOrderStatus(paymentIntent.id, "Completed", "Paid");
          console.log("[Webhook] Order marked as Completed, payment status: Paid", paymentIntent.id);
          
          // Send confirmation email to customer
          await handlePaymentSuccessEmail(paymentIntent.id);
        } catch (error) {
          console.error("[Webhook] Failed to update order status or send email:", {
            error: error instanceof Error ? error.message : String(error),
            paymentIntentId: paymentIntent.id
          });
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
  const paymentIntentId = session.payment_intent as string;

  console.log("[Webhook] checkout.session.completed", {
    sessionId: session.id,
    storeId,
    paymentIntentId,
    amount: session.amount_total,
    paymentStatus: session.payment_status,
    hasItemsMetadata: !!itemsJson,
    hasShippingInfo: !!shippingInfoJson,
    metadata: session.metadata
  });

  if (!storeId || !itemsJson || !paymentIntentId) {
    console.error("[Webhook] Missing required data in checkout session", { 
      storeId, 
      hasItems: !!itemsJson, 
      paymentIntentId,
      sessionId: session.id
    });
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

  console.log("[Webhook] Creating order with data:", JSON.stringify(orderData, null, 2));

  // Create the order
  try {
    const order = await createOrder(orderData);
    console.log("[Webhook] Order created successfully:", order.id, "with status: Pending");

    // Only send emails if payment is already confirmed (payment_status = "paid")
    // Otherwise, emails will be sent when payment_intent.succeeded event fires
    if (session.payment_status === "paid") {
      console.log("[Webhook] Payment already confirmed (status: paid), sending emails immediately for order:", order.id);

      try {
        // Fetch the order with store details for email
        const orderWithStore = await prisma.order.findUnique({
          where: { id: order.id },
          include: {
            items: true,
            store: true,
          },
        });

        if (!orderWithStore) {
          console.error("[Webhook] Failed to fetch order for email sending:", order.id);
        } else {
          // Format items for email
          const emailItems = orderWithStore.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            variantInfo: item.variantInfo,
          }));

          // Send customer confirmation email
          console.log("[Webhook] Sending customer email to:", orderWithStore.customerEmail);
          const customerEmailResult = await sendOrderConfirmationEmail({
            orderId: orderWithStore.id,
            customerName: orderWithStore.customerName,
            customerEmail: orderWithStore.customerEmail,
            items: emailItems,
            total: orderWithStore.total.toString(),
            currency: orderWithStore.currency,
            storeName: orderWithStore.store.storeName,
          });
          console.log("[Webhook] Customer email result:", customerEmailResult);

          // Send store notification email if store has contact email
          if (orderWithStore.store.contactEmail) {
            console.log("[Webhook] Sending store notification to:", orderWithStore.store.contactEmail);
            const storeEmailResult = await sendStoreNotificationEmail(
              orderWithStore.store.contactEmail,
              {
                orderId: orderWithStore.id,
                customerName: orderWithStore.customerName,
                customerEmail: orderWithStore.customerEmail,
                items: emailItems,
                total: orderWithStore.total.toString(),
                currency: orderWithStore.currency,
                storeName: orderWithStore.store.storeName,
              }
            );
            console.log("[Webhook] Store email result:", storeEmailResult);
          } else {
            console.log("[Webhook] No store contact email configured for store:", orderWithStore.storeId);
          }
        }
      } catch (emailError) {
        console.error("[Webhook] Error sending emails:", emailError);
        // Don't fail the webhook if emails fail - the order is already created
      }
    } else {
      console.log("[Webhook] Payment not yet confirmed (status: " + session.payment_status + "), emails will be sent on payment_intent.succeeded event");
    }
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

async function handlePaymentSuccessEmail(stripePaymentId: string) {
  console.log(`[Email] Starting email send for payment ${stripePaymentId}`);
  
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
      console.error(`[Email] Order not found for payment ${stripePaymentId}`);
      // Try various debug methods
      const ordersBySession = await prisma.order.findMany({
        where: { stripePaymentId },
      });
      console.log(`[Email] Debug - Orders with matching stripePaymentId: ${ordersBySession.length}`);
      
      // Also check all orders to see what's there
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      console.log(`[Email] Debug - Last 5 orders:`, recentOrders.map(o => ({
        id: o.id,
        stripePaymentId: o.stripePaymentId,
        storeId: o.storeId
      })));
      return;
    }

    console.log(`[Email] Found order ${order.id} for payment ${stripePaymentId}`);
    console.log(`[Email] Order Status: ${order.status}`);
    console.log(`[Email] Customer email: ${order.customerEmail}`);
    console.log(`[Email] Store: ${order.store.storeName}`);
    console.log(`[Email] Store contact email: ${order.store.contactEmail}`);
    console.log(`[Email] Items count: ${order.items.length}`);

    // Format order items for email
    const emailItems = order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      variantInfo: item.variantInfo,
    }));

    console.log(`[Email] Email items prepared: ${JSON.stringify(emailItems)}`);

    // Send customer confirmation email
    if (!order.customerEmail) {
      console.error('[Email] No customer email found on order');
      return;
    }

    console.log(`[Email] Attempting to send customer email to ${order.customerEmail}`);
    const customerEmailResult = await sendOrderConfirmationEmail({
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: emailItems,
      total: order.total.toFixed(2),
      currency: order.currency,
      storeName: order.store.storeName,
    });

    console.log("[Email] Customer email result:", JSON.stringify(customerEmailResult));

    // Send store notification email if store has contact email configured
    if (order.store.contactEmail) {
      console.log(`[Email] Attempting to send store email to ${order.store.contactEmail}`);
      const storeEmailResult = await sendStoreNotificationEmail(
        order.store.contactEmail,
        {
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          items: emailItems,
          total: order.total.toFixed(2),
          currency: order.currency,
          storeName: order.store.storeName,
        }
      );

      console.log("[Email] Store notification result:", JSON.stringify(storeEmailResult));
    } else {
      console.log(`[Email] No store contact email configured for store ${order.storeId}`);
    }
  } catch (error) {
    console.error("[Email] Error in handlePaymentSuccessEmail:", error);
    if (error instanceof Error) {
      console.error("[Email] Error type:", error.constructor.name);
      console.error("[Email] Error message:", error.message);
      console.error("[Email] Error stack:", error.stack);
    }
    // Don't throw - log the error but continue webhook processing
  }
}
