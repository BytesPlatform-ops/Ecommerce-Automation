import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/forgot-password?error=Invalid reset link", request.url).toString()
      );
    }

    // Find and verify the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.redirect(
        new URL("/forgot-password?error=Invalid or expired reset link", request.url).toString()
      );
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.redirect(
        new URL("/forgot-password?error=Reset link has expired. Please request a new one.", request.url).toString()
      );
    }

    // Check if token has already been used
    if (resetToken.used) {
      return NextResponse.redirect(
        new URL("/forgot-password?error=This reset link has already been used", request.url).toString()
      );
    }

    // Token is valid - redirect to reset password page with the token
    // We'll store the token in the URL (it's already a one-time token in the DB)
    const response = NextResponse.redirect(
      new URL(`/reset-password?token=${token}`, request.url).toString()
    );

    return response;
  } catch (error) {
    console.error("[Reset Token Verify] Error:", error);
    return NextResponse.redirect(
      new URL("/forgot-password?error=An error occurred while verifying your reset link", request.url).toString()
    );
  } finally {
    await prisma.$disconnect();
  }
}
