import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Verify the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid reset token. Please request a new password reset." },
        { status: 400 }
      );
    }

    // Check expiration
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new password reset." },
        { status: 400 }
      );
    }

    // Check if already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: "This reset link has already been used." },
        { status: 400 }
      );
    }

    // Update password in Supabase using the email from the token
    const supabase = await createClient();
    
    // Get the user by email using admin API
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError || !users) {
      return NextResponse.json(
        { error: "An error occurred while processing your request" },
        { status: 500 }
      );
    }

    const user = users.users.find(u => u.email === resetToken.email);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user password via admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      console.error("[Reset Password] Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    // Mark the token as used
    await prisma.passwordResetToken.update({
      where: { token },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // Clean up old expired tokens (optional maintenance)
    await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Reset Password] Error:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting your password" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
