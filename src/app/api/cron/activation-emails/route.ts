import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import {
  sendActivationEmail2,
  sendActivationEmail3,
  sendActivationEmail4,
  sendActivationEmail5,
  sendActivationEmail6,
  sendActivationEmail7,
  type ActivationEmailDetails,
} from "@/lib/email";

// Use Supabase admin client — the cron job has no user session
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Time window definitions: [minAge in hours, maxAge in hours]
const EMAIL_TIERS = [
  { key: "2" as const, minHours: 3, maxHours: 4, field: "activationEmail2SentAt" as const, sendFn: sendActivationEmail2, requiresNoProducts: true },
  { key: "3" as const, minHours: 24, maxHours: 25, field: "activationEmail3SentAt" as const, sendFn: sendActivationEmail3, requiresNoProducts: true },
  { key: "4" as const, minHours: 48, maxHours: 49, field: "activationEmail4SentAt" as const, sendFn: sendActivationEmail4, requiresNoProducts: true },
  { key: "5" as const, minHours: 96, maxHours: 97, field: "activationEmail5SentAt" as const, sendFn: sendActivationEmail5, requiresNoProducts: false },
  { key: "6" as const, minHours: 168, maxHours: 169, field: "activationEmail6SentAt" as const, sendFn: sendActivationEmail6, requiresNoProducts: false },
  { key: "7" as const, minHours: 336, maxHours: 337, field: "activationEmail7SentAt" as const, sendFn: sendActivationEmail7, requiresNoProducts: false },
];

export async function GET(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const results: Record<string, { found: number; sent: number; failed: number }> = {};

  for (const tier of EMAIL_TIERS) {
    const windowStart = new Date(now - tier.maxHours * 60 * 60 * 1000);
    const windowEnd = new Date(now - tier.minHours * 60 * 60 * 1000);

    // Build the where clause
    const where: any = {
      createdAt: { gte: windowStart, lte: windowEnd },
      [tier.field]: null, // Not yet sent
    };

    // Emails 2-4: only send if user has zero products
    if (tier.requiresNoProducts) {
      where.products = { none: { deletedAt: null } };
    }

    const stores = await prisma.store.findMany({
      where,
      select: {
        id: true,
        ownerId: true,
        storeName: true,
        subdomainSlug: true,
        stripeConnectId: true,
        _count: {
          select: {
            products: { where: { deletedAt: null } },
            orders: true,
          },
        },
      },
    });

    let sent = 0;
    let failed = 0;

    for (const store of stores) {
      try {
        // Look up user email from Supabase auth
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.admin.getUserById(store.ownerId);

        if (userError || !userData?.user?.email) {
          console.warn(`[Cron] Could not find email for owner ${store.ownerId}, skipping`);
          failed++;
          continue;
        }

        const details: ActivationEmailDetails = {
          email: userData.user.email,
          storeName: store.storeName,
          storeSlug: store.subdomainSlug,
          productCount: store._count.products,
          hasStripe: !!store.stripeConnectId,
        };

        const result = await tier.sendFn(details);

        if (result.success) {
          // Mark as sent
          await prisma.store.update({
            where: { id: store.id },
            data: { [tier.field]: new Date() },
          });
          sent++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error(`[Cron] Error processing store ${store.id} for email ${tier.key}:`, err);
        failed++;
      }
    }

    results[`email${tier.key}`] = { found: stores.length, sent, failed };
  }

  return NextResponse.json({ ok: true, results });
}
