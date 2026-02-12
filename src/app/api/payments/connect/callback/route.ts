import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForAccount } from "@/lib/stripe";
import { saveStripeConnectAccount } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { verifyOAuthState } from "@/lib/security";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // Signed state (base64url encoded)
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
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

  // Verify the signed state parameter to prevent CSRF
  const storeId = verifyOAuthState(state);
  if (!storeId) {
    return NextResponse.redirect(
      `${redirectUrl}?error=${encodeURIComponent("Invalid or expired authorization state. Please try again.")}`
    );
  }

  // Authenticate the current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${redirectUrl}?error=${encodeURIComponent("You must be logged in to connect a Stripe account.")}`
    );
  }

  try {
    // Verify the store exists AND belongs to the authenticated user
    const store = await prisma.store.findFirst({
      where: { id: storeId, ownerId: user.id },
    });

    if (!store) {
      return NextResponse.redirect(
        `${redirectUrl}?error=${encodeURIComponent("Store not found or you don't have permission to connect Stripe for this store.")}`
      );
    }

    // Exchange code for Stripe account
    const { stripeAccountId } = await exchangeCodeForAccount(code);

    // Save the Stripe Connect ID to the store
    await saveStripeConnectAccount(storeId, stripeAccountId);

    return NextResponse.redirect(`${redirectUrl}?success=true`);
  } catch (err) {
    console.error("Error connecting Stripe account:", err);
    return NextResponse.redirect(
      `${redirectUrl}?error=${encodeURIComponent("Failed to connect Stripe account. Please try again.")}`
    );
  }
}
