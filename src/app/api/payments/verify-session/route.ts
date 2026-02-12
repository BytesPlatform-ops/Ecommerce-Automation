import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createOrder, updateOrderStatus } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendStoreNotificationEmail } from "@/lib/email";

/**
 * Send order confirmation emails to customer and store owner
 */
async function sendOrderEmails(orderId: string) {
  try {
    console.log(`[Session Verify] Sending order emails for order: ${orderId}`);
    
    // Fetch the order with all details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        store: true,
      },
    });

    if (!order) {
      console.error(`[Session Verify Email] Order not found: ${orderId}`);
      return;
    }

    // Format order items for email
    const emailItems = order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      variantInfo: item.variantInfo,
    }));

    // Send customer confirmation email
    if (order.customerEmail && order.customerEmail !== "unknown@email.com") {
      console.log(`[Session Verify Email] Sending customer email to: ${order.customerEmail}`);
      const customerEmailResult = await sendOrderConfirmationEmail({
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: emailItems,
        total: order.total.toString(),
        currency: order.currency,
        storeName: order.store.storeName,
      });

      if (customerEmailResult.success) {
        console.log(`[Session Verify Email] ✓ Customer email sent to ${order.customerEmail}`);
      } else {
        console.error(`[Session Verify Email] ✗ Failed to send customer email:`, customerEmailResult.message);
      }
    } else {
      console.warn(`[Session Verify Email] No valid customer email for order ${orderId}`);
    }

    // Send store notification email if store has contact email configured
    if (order.store.contactEmail) {
      console.log(`[Session Verify Email] Sending store notification to: ${order.store.contactEmail}`);
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

      if (storeEmailResult.success) {
        console.log(`[Session Verify Email] ✓ Store notification sent to ${order.store.contactEmail}`);
      } else {
        console.error(`[Session Verify Email] ✗ Failed to send store notification:`, storeEmailResult.message);
      }
    } else {
      console.warn(`[Session Verify Email] Store has no contact email configured for store: ${order.store.storeName}`);
    }
  } catch (error) {
    console.error(`[Session Verify Email] Error sending emails:`, error);
    // Don't throw - email failures shouldn't break the order flow
  }
}

/**
 * Verify a checkout session and create order if it doesn't exist
 * This is called from the client after successful checkout
 * to ensure orders are created even when webhooks don't reach localhost
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, storeId }: { sessionId: string; storeId: string } = body;

    console.log("[Session Verify] Received request:", { sessionId, storeId });

    if (!sessionId || !storeId) {
      console.log("[Session Verify] Missing sessionId or storeId");
      return NextResponse.json(
        { error: "Missing sessionId or storeId" },
        { status: 400 }
      );
    }

    // Get store to find the connected account
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { stripeConnectId: true },
    });

    if (!store || !store.stripeConnectId) {
      return NextResponse.json(
        { error: "Store or Stripe account not found" },
        { status: 404 }
      );
    }

    // Check if order already exists for this session
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: { items: true },
    });

    if (existingOrder) {
      // If order exists but is still Pending, update to Completed and reduce stock
      if (existingOrder.status === "Pending") {
        console.log("[Session Verify] Existing order is Pending, updating to Completed:", existingOrder.id);
        await updateOrderStatus(existingOrder.stripePaymentId, "Completed", "Paid");
        
        // Send order confirmation emails for the now-completed order
        await sendOrderEmails(existingOrder.id);
      }
      return NextResponse.json({ 
        success: true, 
        orderId: existingOrder.id,
        alreadyExists: true 
      });
    }

    // Retrieve the checkout session from Stripe (using connected account)
    const session = await stripe.checkout.sessions.retrieve(
      sessionId,
      { stripeAccount: store.stripeConnectId }
    );

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Session not found or payment not completed" },
        { status: 400 }
      );
    }

    // Extract metadata
    const itemsJson = session.metadata?.items;
    const shippingInfoJson = session.metadata?.shippingInfo;

    console.log("[Session Verify] Session metadata:", session.metadata);

    if (!itemsJson) {
      return NextResponse.json(
        { error: "Missing session metadata" },
        { status: 400 }
      );
    }

    const items = JSON.parse(itemsJson) as Array<{
      productId: string;
      variantId?: string | null;
      name: string;
      quantity: number;
      unitPrice: number;
    }>;

    // Parse shipping info if available
    let shippingInfo = null;
    if (shippingInfoJson) {
      try {
        shippingInfo = JSON.parse(shippingInfoJson);
        console.log("[Session Verify] Parsed shipping info:", shippingInfo);
      } catch (error) {
        console.error("[Session Verify] Failed to parse shipping info:", error);
      }
    }

    // Create the order
    const order = await createOrder({
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
      initialStatus: "Completed", // Payment already succeeded
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
    });

    console.log("[Session Verify] Order created:", order.id);

    // Send order confirmation emails
    await sendOrderEmails(order.id);

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      alreadyExists: false 
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    );
  }
}
