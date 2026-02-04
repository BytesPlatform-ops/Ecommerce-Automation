import { NextResponse } from "next/server";
import { getStripeAccountStatus } from "@/lib/actions";

export async function GET() {
  try {
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
