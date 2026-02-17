import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/notifications/get-active
 * 
 * Fetch active (non-dismissed) stock notifications for the authenticated user's store
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get the user's store
    const store = await prisma.store.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Fetch active notifications
    const notifications = await prisma.stockNotification.findMany({
      where: {
        storeId: store.id,
        isDismissed: false,
      },
      select: {
        id: true,
        type: true,
        affectedItems: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("[Notifications API] Error fetching notifications", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
