import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createOAuthState } from "@/lib/security";

/**
 * POST /api/payments/connect/initiate
 * 
 * Generates a signed OAuth state parameter server-side and returns
 * the full Stripe Connect OAuth URL. This prevents CSRF by ensuring
 * the state parameter is HMAC-signed with a server secret.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: { id: storeId, ownerId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found or unauthorized" },
        { status: 403 }
      );
    }

    // Generate signed state
    const signedState = createOAuthState(storeId);

    // Build the Stripe OAuth URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const redirectUri = `${baseUrl}/api/payments/connect/callback`;
    const clientId = process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID || "";

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: "read_write",
      redirect_uri: redirectUri,
      state: signedState,
    });

    const url = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error initiating Stripe Connect:", error);
    return NextResponse.json(
      { error: "Failed to initiate Stripe Connect" },
      { status: 500 }
    );
  }
}
