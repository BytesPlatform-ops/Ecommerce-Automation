import { NextResponse } from "next/server";
import { z } from "zod";
import sgMail from "@sendgrid/mail";
import { checkRateLimit } from "@/lib/security";

const RECIPIENT = "bytesuite@bytesplatform.com";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email required"),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(1, "Message is required"),
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
    // Rate limit: 5 submissions per minute per IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateLimit = checkRateLimit(`landing-contact:${ip}`, 5, 60000);
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
    const fromName = process.env.SENDGRID_FROM_NAME || "Bytescart Contact";

    if (!apiKey) {
      console.warn("[landing-contact] SENDGRID_API_KEY not configured.");
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const payload = await request.json();
    const data = schema.parse(payload);

    sgMail.setApiKey(apiKey);

    const subjectLine = data.subject?.trim()
      ? `[Bytescart Contact] ${data.subject.trim()}`
      : `[Bytescart Contact] New message from ${data.name}`;

    const htmlBody = `
      <div style="background-color:#f6f1ea;padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
          style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #eadfcc;">
          <tr>
            <td style="padding:28px 32px 0;text-align:center;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:1.2px;color:#2a1d14;">
                Bytescart
              </div>
              <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:2.4px;color:#8a6f59;margin-top:6px;">
                LANDING PAGE CONTACT
              </div>
              <div style="height:1px;width:72px;background:#c9a875;margin:18px auto 0;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 12px;font-family:Arial,sans-serif;color:#3b2a20;font-size:14px;line-height:1.7;">
              <p style="margin:0 0 12px;">A new message has been submitted via the Bytescart landing page contact form.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #efe3d4;width:140px;color:#8a6f59;text-transform:uppercase;letter-spacing:1.6px;font-size:11px;">Name</td>
                  <td style="padding:10px 0;border-top:1px solid #efe3d4;font-weight:600;">${escapeHtml(data.name)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #efe3d4;color:#8a6f59;text-transform:uppercase;letter-spacing:1.6px;font-size:11px;">Email</td>
                  <td style="padding:10px 0;border-top:1px solid #efe3d4;">${escapeHtml(data.email)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #efe3d4;color:#8a6f59;text-transform:uppercase;letter-spacing:1.6px;font-size:11px;">Subject</td>
                  <td style="padding:10px 0;border-top:1px solid #efe3d4;">${escapeHtml(data.subject?.trim() || "(No subject)")}</td>
                </tr>
              </table>
              <div style="margin:18px 0 8px;font-size:12px;letter-spacing:1.4px;color:#8a6f59;text-transform:uppercase;">Message</div>
              <div style="border:1px solid #efe3d4;background:#fbf8f4;padding:16px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#2a1d14;">
                ${escapeHtml(data.message).replace(/\n/g, "<br />")}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px 28px;font-family:Arial,sans-serif;font-size:11px;color:#8a6f59;text-align:center;">
              Reply directly to this email to reach ${escapeHtml(data.name)}.
            </td>
          </tr>
        </table>
      </div>
    `;

    const textBody = [
      "New landing page contact form message",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Subject: ${data.subject?.trim() || "(No subject)"}`,
      "",
      data.message,
    ].join("\n");

    await sgMail.send({
      to: RECIPIENT,
      from: { email: fromEmail, name: fromName },
      replyTo: { email: data.email, name: data.name },
      subject: subjectLine,
      text: textBody,
      html: htmlBody,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }
    console.error("[landing-contact] Error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
