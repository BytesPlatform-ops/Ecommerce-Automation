import { NextResponse } from "next/server";
import { z } from "zod";
import sgMail from "@sendgrid/mail";
import { checkRateLimit } from "@/lib/security";

// Admin email recipients to notify on new signups
const NOTIFICATION_RECIPIENTS = [
  "bytesuite@bytesplatform.com",
  "umairahsan2019@gmail.com",
];

const schema = z.object({
  email: z.string().trim().email("Valid email required"),
  storeName: z.string().trim().min(1).max(100).optional(),
  storeUrl: z.string().trim().url().optional(),
});

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":  return "&amp;";
      case "<":  return "&lt;";
      case ">":  return "&gt;";
      case '"':  return "&quot;";
      case "'":  return "&#39;";
      default:   return char;
    }
  });
}

export async function POST(request: Request) {
  try {
    // Rate limit: 10 signup notifications per minute per IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateLimit = checkRateLimit(`signup-notification:${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)) },
        }
      );
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail =
      process.env.SENDGRID_FROM_EMAIL || "noreply@bytescart.store";
    const fromName = process.env.SENDGRID_FROM_NAME || "Bytescart";

    if (!apiKey) {
      console.warn("[signup-notification] SENDGRID_API_KEY not configured.");
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const payload = await request.json();
    const data = schema.parse(payload);

    sgMail.setApiKey(apiKey);

    const signupDate = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const subjectLine = data.storeName
      ? `[Bytescart] New Store Created: ${data.storeName}`
      : `[Bytescart] New User Signup: ${data.email}`;

    const storeSection = data.storeName
      ? `
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #efe3d4;">
                    <div style="color:#8a6f59;text-transform:uppercase;letter-spacing:1.6px;font-size:11px;margin-bottom:4px;">Store Name</div>
                    <div style="font-weight:600;font-size:16px;color:#2a1d14;">${escapeHtml(data.storeName)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #efe3d4;">
                    <div style="color:#8a6f59;text-transform:uppercase;letter-spacing:1.6px;font-size:11px;margin-bottom:4px;">Store URL</div>
                    <div style="font-size:14px;color:#2a1d14;">
                      <a href="${escapeHtml(data.storeUrl ?? "")}" style="color:#c9a875;text-decoration:none;font-weight:600;">${escapeHtml(data.storeUrl ?? "")}</a>
                    </div>
                  </td>
                </tr>`
      : "";

    const htmlBody = `
      <div style="background-color:#f6f1ea;padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
          style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #eadfcc;border-radius:8px;">
          <tr>
            <td style="padding:28px 32px 0;text-align:center;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:1.2px;color:#2a1d14;">
                Bytescart
              </div>
              <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:2.4px;color:#8a6f59;margin-top:6px;">
                ${data.storeName ? "NEW STORE CREATED" : "NEW USER SIGNUP NOTIFICATION"}
              </div>
              <div style="height:1px;width:72px;background:#c9a875;margin:18px auto 0;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 12px;font-family:Arial,sans-serif;color:#3b2a20;font-size:14px;line-height:1.7;">
              <p style="margin:0 0 20px;font-size:16px;">🎉 <strong>Great news!</strong> ${data.storeName ? "A new store has been created on Bytescart." : "A new user has signed up for Bytescart."}</p>
              
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#fbf8f4;border:1px solid #efe3d4;border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #efe3d4;">
                    <div style="color:#8a6f59;text-transform:uppercase;letter-spacing:1.6px;font-size:11px;margin-bottom:4px;">User Email</div>
                    <div style="font-weight:600;font-size:16px;color:#2a1d14;">${escapeHtml(data.email)}</div>
                  </td>
                </tr>
                ${storeSection}
                <tr>
                  <td style="padding:16px 20px;">
                    <div style="color:#8a6f59;text-transform:uppercase;letter-spacing:1.6px;font-size:11px;margin-bottom:4px;">${data.storeName ? "Created On" : "Signup Date"}</div>
                    <div style="font-size:14px;color:#3b2a20;">${escapeHtml(signupDate)}</div>
                  </td>
                </tr>
              </table>
              
              <p style="margin:20px 0 0;color:#666;font-size:13px;">
                ${data.storeName ? "The store is now live and accessible at the URL above." : "This user has created an account and will be directed to the onboarding flow to set up their store."}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px 28px;font-family:Arial,sans-serif;font-size:11px;color:#8a6f59;text-align:center;border-top:1px solid #efe3d4;">
              This is an automated notification from Bytescart.
            </td>
          </tr>
        </table>
      </div>
    `;

    const textBody = data.storeName
      ? [
          "New Store Created - Bytescart",
          "",
          `User Email: ${data.email}`,
          `Store Name: ${data.storeName}`,
          `Store URL: ${data.storeUrl ?? ""}`,
          `Created On: ${signupDate}`,
          "",
          "The store is now live and accessible at the URL above.",
          "",
          "---",
          "This is an automated notification from Bytescart.",
        ].join("\n")
      : [
          "New User Signup Notification - Bytescart",
          "",
          `User Email: ${data.email}`,
          `Signup Date: ${signupDate}`,
          "",
          "This user has created an account and will be directed to the onboarding flow to set up their store.",
          "",
          "---",
          "This is an automated notification from Bytescart.",
        ].join("\n");

    // Send to all notification recipients
    await sgMail.send({
      to: NOTIFICATION_RECIPIENTS,
      from: { email: fromEmail, name: fromName },
      subject: subjectLine,
      text: textBody,
      html: htmlBody,
    });

    console.log(`[signup-notification] Email sent for: ${data.email}${data.storeName ? ` | store: ${data.storeName}` : ""}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }
    console.error("[signup-notification] Error:", error);
    return NextResponse.json(
      { error: "Failed to send notification. Please try again." },
      { status: 500 }
    );
  }
}
