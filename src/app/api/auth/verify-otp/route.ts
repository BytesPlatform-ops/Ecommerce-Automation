import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!accountSid || !authToken || !verifyServiceSid) {
      console.error("Missing Twilio environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: "Phone number and verification code are required" },
        { status: 400 }
      );
    }

    // Validate OTP format (should be 4-8 digits)
    const codeRegex = /^\d{4,8}$/;
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        { error: "Invalid verification code format" },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);

    // Verify the OTP
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: code,
      });

    console.log(`OTP verification for ${phoneNumber}: ${verificationCheck.status}`);

    if (verificationCheck.status === "approved") {
      return NextResponse.json({
        success: true,
        verified: true,
      });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        error: "Invalid or expired verification code",
      });
    }
  } catch (error: unknown) {
    console.error("Twilio verify OTP error:", error);

    // Handle specific Twilio errors
    if (error && typeof error === "object" && "code" in error) {
      const twilioError = error as { code: number; message: string };
      if (twilioError.code === 20404) {
        return NextResponse.json(
          { error: "Verification code expired. Please request a new one." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to verify code. Please try again." },
      { status: 500 }
    );
  }
}
