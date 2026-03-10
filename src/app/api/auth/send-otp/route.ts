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

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format (should start with + and have digits)
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);

    // Send OTP via Twilio Verify
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    console.log(`OTP sent to ${phoneNumber}, status: ${verification.status}`);

    return NextResponse.json({
      success: true,
      status: verification.status,
    });
  } catch (error: unknown) {
    console.error("Twilio send OTP error:", error);
    
    // Handle specific Twilio errors
    if (error && typeof error === "object" && "code" in error) {
      const twilioError = error as { code: number; message: string };
      if (twilioError.code === 60200) {
        return NextResponse.json(
          { error: "Invalid phone number" },
          { status: 400 }
        );
      }
      if (twilioError.code === 60203) {
        return NextResponse.json(
          { error: "Too many OTP requests. Please wait before trying again." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
