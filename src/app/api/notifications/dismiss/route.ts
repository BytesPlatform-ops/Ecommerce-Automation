import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/notifications/dismiss
 * 
 * Dismiss a stock notification by ID
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
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

    // Verify ownership and dismiss the notification
    const notification = await prisma.stockNotification.findUnique({
      where: { id: notificationId },
      select: { storeId: true },
    });

    if (!notification || notification.storeId !== store.id) {
      return NextResponse.json(
        { error: "Notification not found or unauthorized" },
        { status: 404 }
      );
    }

    // Dismiss the notification
    await prisma.stockNotification.update({
      where: { id: notificationId },
      data: {
        isDismissed: true,
        dismissedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification dismissed",
    });
  } catch (error) {
    console.error("[Notifications API] Error dismissing notification", error);
    return NextResponse.json(
      { error: "Failed to dismiss notification" },
      { status: 500 }
    );
  }
}
