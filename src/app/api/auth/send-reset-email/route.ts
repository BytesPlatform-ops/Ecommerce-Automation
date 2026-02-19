import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // First, check if the user exists in Supabase
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (!fetchError && users) {
      const userExists = users.users.some(u => u.email === email);
      
      if (!userExists) {
        // Security best practice: don't reveal if email exists
        return NextResponse.json(
          { success: true, message: "If an account exists with that email, a reset link has been sent." },
          { status: 200 }
        );
      }
    }

    // Generate a secure reset token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Store the reset token in database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Build the reset link
    const resetLink = `${origin}/api/auth/reset-verify?token=${token}`;

    // Send the premium password reset email
    const emailResult = await sendPasswordResetEmail({
      email,
      resetLink,
      storeName: "Chameleon",
    });

    if (!emailResult.success) {
      // Clean up the token if email fails
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      
      console.error("[Password Reset] Email sending failed:", emailResult.message);
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "If an account exists with that email, a reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Password Reset] Error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
