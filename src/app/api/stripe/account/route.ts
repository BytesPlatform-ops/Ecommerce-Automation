import { NextRequest, NextResponse } from "next/server";
import { getStripeAccountStatus } from "@/lib/actions";
import { checkRateLimit } from "@/lib/security";
import { getRequestIp } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    // Rate limit by IP: max 20 account status checks per minute
    const ip = getRequestIp(request);
    const rateLimit = checkRateLimit(`stripe-account:${ip}`, 20, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)) } }
      );
    }

    const accountStatus = await getStripeAccountStatus();

    if (!accountStatus) {
      return NextResponse.json(
        { error: "Store not found or not authenticated" },
        { status: 404 }
      );
    }

    return NextResponse.json(accountStatus);
  } catch (error) {
    console.error("Error getting Stripe account status:", error);
    return NextResponse.json(
      { error: "Failed to get Stripe account status" },
      { status: 500 }
    );
  }
}
