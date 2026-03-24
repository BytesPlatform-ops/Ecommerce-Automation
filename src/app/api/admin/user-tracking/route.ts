import { NextResponse } from "next/server";
import { getAllUsersFromSheet, appendUserToSheet, updateUserInSheet, isGoogleSheetsConfigured } from "@/lib/google-sheets";
import { z } from "zod";

const appendSchema = z.object({
  action: z.literal("append"),
  userId: z.string().min(1),
  email: z.string().email(),
  phone: z.string().default(""),
  storeName: z.string().min(1),
  storeSlug: z.string().min(1),
  productsAdded: z.number().default(0),
  subscriptionTier: z.string().default("FREE"),
  stripeConnected: z.boolean().default(false),
});

const updateSchema = z.object({
  action: z.literal("update"),
  userId: z.string().min(1),
  updates: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    storeName: z.string().optional(),
    storeSlug: z.string().optional(),
    productsAdded: z.number().optional(),
    subscriptionTier: z.string().optional(),
    stripeConnected: z.boolean().optional(),
  }),
});

const requestSchema = z.discriminatedUnion("action", [appendSchema, updateSchema]);

/**
 * GET - Retrieve all users from Google Sheet
 */
export async function GET() {
  try {
    if (!isGoogleSheetsConfigured()) {
      return NextResponse.json(
        { error: "Google Sheets not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_SHEETS_SPREADSHEET_ID." },
        { status: 503 }
      );
    }

    const users = await getAllUsersFromSheet();
    return NextResponse.json({ users, count: users.length });
  } catch (error) {
    console.error("[user-tracking] GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user data" },
      { status: 500 }
    );
  }
}

/**
 * POST - Append new user or update existing user
 */
export async function POST(request: Request) {
  try {
    if (!isGoogleSheetsConfigured()) {
      return NextResponse.json(
        { error: "Google Sheets not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_SHEETS_SPREADSHEET_ID." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const data = requestSchema.parse(body);

    if (data.action === "append") {
      await appendUserToSheet({
        userId: data.userId,
        email: data.email,
        phone: data.phone,
        storeName: data.storeName,
        storeSlug: data.storeSlug,
        signupDate: new Date().toISOString(),
        productsAdded: data.productsAdded,
        subscriptionTier: data.subscriptionTier,
        stripeConnected: data.stripeConnected,
      });
      return NextResponse.json({ ok: true, action: "appended" });
    }

    if (data.action === "update") {
      const updated = await updateUserInSheet(data.userId, data.updates);
      if (!updated) {
        return NextResponse.json(
          { error: "User not found in tracking data" },
          { status: 404 }
        );
      }
      return NextResponse.json({ ok: true, action: "updated" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[user-tracking] POST error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
