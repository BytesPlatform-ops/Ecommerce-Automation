import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

/**
 * Get the Stripe Connect OAuth URL for a store owner to connect their account
 */
export function getStripeConnectOAuthUrl(storeId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/payments/connect/callback`;
  
  if (!process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID) {
    throw new Error("NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID is not set in environment variables");
  }
  
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID,
    scope: "read_write",
    redirect_uri: redirectUri,
    state: storeId, // Pass storeId to identify which store to connect
  });

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange OAuth code for Stripe access token and account ID
 */
export async function exchangeCodeForAccount(code: string): Promise<{
  stripeAccountId: string;
  accessToken: string;
  refreshToken: string;
}> {
  const response = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  });

  if (!response.stripe_user_id) {
    throw new Error("Failed to get Stripe account ID");
  }

  return {
    stripeAccountId: response.stripe_user_id,
    accessToken: response.access_token || "",
    refreshToken: response.refresh_token || "",
  };
}

/**
 * Get connected account details
 */
export async function getConnectedAccount(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error) {
    console.error("Error retrieving connected account:", error);
    return null;
  }
}

/**
 * Get account balance for a connected account
 */
export async function getAccountBalance(accountId: string) {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    });
    return balance;
  } catch (error) {
    console.error("Error retrieving account balance:", error);
    return null;
  }
}

/**
 * Get recent payouts for a connected account
 */
export async function getAccountPayouts(accountId: string, limit = 10) {
  try {
    const payouts = await stripe.payouts.list(
      { limit },
      { stripeAccount: accountId }
    );
    return payouts.data;
  } catch (error) {
    console.error("Error retrieving payouts:", error);
    return [];
  }
}

/**
 * Create a Checkout Session for purchasing products
 */
export async function createCheckoutSession({
  storeId,
  stripeConnectId,
  lineItems,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  storeId: string;
  stripeConnectId: string;
  lineItems: Array<{
    name: string;
    description?: string;
    unitAmount: number; // in cents
    quantity: number;
    productId: string;
  }>;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.description,
            metadata: {
              productId: item.productId,
            },
          },
          unit_amount: item.unitAmount,
        },
        quantity: item.quantity,
      })),
      metadata: {
        storeId,
        items: JSON.stringify(
          lineItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitAmount,
          }))
        ),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      // No application_fee_amount since we're not charging platform fees
    },
    {
      stripeAccount: stripeConnectId,
    }
  );

  return session;
}

/**
 * Construct and verify a Stripe webhook event
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string,
  endpointSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, endpointSecret);
}
