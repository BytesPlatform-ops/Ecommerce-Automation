import Stripe from "stripe";
import { createOAuthState } from "@/lib/security";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

/**
 * Get the Stripe Connect OAuth URL for a store owner to connect their account.
 * Uses a signed state parameter (HMAC) to prevent CSRF and store ID tampering.
 */
export function getStripeConnectOAuthUrl(storeId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const redirectUri = `${baseUrl}/api/payments/connect/callback`;
  
  if (!process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID) {
    throw new Error("NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID is not set in environment variables");
  }
  
  // Create a signed state with HMAC to prevent CSRF attacks
  const signedState = createOAuthState(storeId);
  
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID,
    scope: "read_write",
    redirect_uri: redirectUri,
    state: signedState,
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
 * Get pending charges (succeeded but not yet paid out)
 */
export async function getPendingCharges(accountId: string, limit = 50) {
  try {
    const charges = await stripe.charges.list(
      {
        limit,
      },
      { stripeAccount: accountId }
    );
    // Filter for succeeded charges only (these are pending payout)
    return charges.data.filter((charge) => charge.status === "succeeded");
  } catch (error) {
    console.error("Error retrieving pending charges:", error);
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
  shippingInfo,
}: {
  storeId: string;
  stripeConnectId: string;
  lineItems: Array<{
    name: string;
    description?: string;
    unitAmount: number; // in cents
    quantity: number;
    productId: string;
    variantId?: string | null;
  }>;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
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
}) {
  const sessionMetadata: any = {
    storeId,
    items: JSON.stringify(
      lineItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitAmount,
      }))
    ),
  };

  // Add shipping info to metadata if provided
  if (shippingInfo) {
    sessionMetadata.shippingInfo = JSON.stringify(shippingInfo);
  }

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
      metadata: sessionMetadata,
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
