import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForAccount } from "@/lib/stripe";
import { saveStripeConnectAccount } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // storeId
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUrl = `${baseUrl}/dashboard/payments`;

  // Handle errors from Stripe
  if (error) {
    console.error("Stripe Connect OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${redirectUrl}?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      `${redirectUrl}?error=${encodeURIComponent("Missing authorization code or store ID")}`
    );
  }

  try {
    // Verify the store exists
    const store = await prisma.store.findUnique({
      where: { id: state },
    });

    if (!store) {
      return NextResponse.redirect(
        `${redirectUrl}?error=${encodeURIComponent("Store not found")}`
      );
    }

    // Exchange code for Stripe account
    const { stripeAccountId } = await exchangeCodeForAccount(code);

    // Save the Stripe Connect ID to the store
    await saveStripeConnectAccount(state, stripeAccountId);

    return NextResponse.redirect(`${redirectUrl}?success=true`);
  } catch (err) {
    console.error("Error connecting Stripe account:", err);
    return NextResponse.redirect(
      `${redirectUrl}?error=${encodeURIComponent("Failed to connect Stripe account. Please try again.")}`
    );
  }
}
