import sgMail, { MailDataRequired } from "@sendgrid/mail";

// HTML escape function for email template safety
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return char;
    }
  });
}

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number | string;
  variantInfo?: string | null;
}

interface OrderDetails {
  orderId: string;
  customerName?: string | null;
  customerEmail: string;
  items: OrderItem[];
  total: number | string;
  currency: string;
  storeName?: string;
}

export async function sendOrderConfirmationEmail(orderDetails: OrderDetails) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@chameleon.store";
  // For customer emails, use the store name as the sender
  const FROM_NAME = orderDetails.storeName || process.env.SENDGRID_FROM_NAME || "Chameleon Store";
  const FROM_ADDRESS = FROM_NAME ? `${FROM_NAME} <${FROM_EMAIL}>` : FROM_EMAIL;

  if (!SENDGRID_API_KEY) {
    console.warn("[Email] SENDGRID_API_KEY is not configured. Email not sent.");
    return { success: false, message: "SendGrid API key not configured" };
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  const {
    orderId,
    customerName,
    customerEmail,
    items,
    total,
    currency,
    storeName = "Our Store",
  } = orderDetails;

  // Format currency
  const currencySymbol = currency.toLowerCase() === "usd" ? "$" : currency.toUpperCase();
  const formattedTotal = typeof total === "string" ? total : (Math.round(parseFloat(String(total)) * 100) / 100).toFixed(2);

  // Build items HTML (escape all user-generated content to prevent HTML injection)
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td>
        <div style="font-weight: 600; color: #1a1a2e;">${escapeHtml(item.productName)}</div>
        ${item.variantInfo ? `<small>${escapeHtml(item.variantInfo)}</small>` : ""}
      </td>
      <td style="text-align: center;">
        ${item.quantity}
      </td>
      <td style="text-align: right;">
        ${currencySymbol}${typeof item.unitPrice === "string" ? escapeHtml(item.unitPrice) : item.unitPrice.toFixed(2)}
      </td>
      <td style="text-align: right; font-weight: 600; color: #1a1a2e;">
        ${currencySymbol}${typeof item.unitPrice === "number" && typeof item.quantity === "number" ? (Math.round(item.unitPrice * item.quantity * 100) / 100).toFixed(2) : (parseFloat(String(item.unitPrice)) * item.quantity).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', 'Trebuchet MS', sans-serif; 
      line-height: 1.6; 
      color: #2c3e50; 
      background-color: #f5f5f5;
    }
    .wrapper { background-color: #f5f5f5; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); 
      color: white; 
      padding: 50px 30px; 
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 300px;
      background: rgba(255, 215, 0, 0.05);
      border-radius: 50%;
      transform: translate(100px, -100px);
    }
    .header h1 { 
      font-size: 32px; 
      margin: 0 0 8px 0; 
      font-weight: 700;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
    }
    .header p { 
      margin: 0; 
      opacity: 0.9; 
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }
    .divider { height: 3px; background: linear-gradient(90deg, transparent, #ffd700, transparent); }
    .content { padding: 40px 35px; }
    .greeting { 
      font-size: 16px; 
      margin-bottom: 20px; 
      color: #2c3e50;
      line-height: 1.8;
    }
    .greeting strong { color: #1a1a2e; }
    .order-summary { 
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      padding: 30px;
      border-radius: 10px;
      margin: 30px 0;
      border: 1px solid #e8e8e8;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .order-summary h2 { 
      font-size: 18px; 
      margin: 0 0 25px 0; 
      color: #1a1a2e;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .items-table { width: 100%; border-collapse: collapse; }
    .items-table thead tr { border-bottom: 2px solid #ffd700; }
    .items-table th { 
      text-align: left; 
      padding: 15px 0; 
      color: #1a1a2e; 
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table td { padding: 16px 0; border-bottom: 1px solid #e8e8e8; }
    .items-table tbody tr:last-child td { border-bottom: none; }
    .items-table tr td:first-child { color: #2c3e50; font-weight: 500; }
    .items-table tr td:nth-child(2), 
    .items-table tr td:nth-child(3),
    .items-table tr td:nth-child(4) { 
      text-align: right; 
      color: #555;
      font-size: 14px;
    }
    .items-table small { color: #999; font-size: 12px; display: block; margin-top: 4px; font-style: italic; }
    .total-row { margin-top: 20px; padding-top: 20px; border-top: 2px solid #ffd700; }
    .total-row td { padding: 12px 0 !important; border: none !important; }
    .total-row tr td:first-child { 
      font-weight: 700;
      color: #1a1a2e;
      font-size: 15px;
    }
    .total-row tr td:last-child { 
      font-weight: 700; 
      color: #ffd700; 
      font-size: 20px;
      text-align: right !important;
    }
    .order-info { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 20px; 
      margin: 30px 0;
    }
    .info-item { 
      background: linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%);
      padding: 20px;
      border-radius: 8px;
      border-left: 3px solid #ffd700;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .info-label { 
      color: #999; 
      font-size: 11px; 
      text-transform: uppercase; 
      font-weight: 700; 
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .info-value { 
      color: #1a1a2e; 
      font-weight: 600;
      font-size: 15px;
      word-break: break-all;
    }
    .shipping-update { 
      background: linear-gradient(135deg, #ecf0f1 0%, #f8f9fa 100%);
      border-left: 4px solid #ffd700;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .shipping-update strong { 
      color: #1a1a2e;
      display: block;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .shipping-update p { 
      margin: 0; 
      color: #2c3e50;
      line-height: 1.8;
      font-size: 14px;
    }
    .footer-text {
      margin: 30px 0 0 0;
      padding-top: 30px;
      border-top: 1px solid #e8e8e8;
      text-align: center;
      font-size: 14px;
      color: #2c3e50;
      line-height: 1.8;
    }
    .footer-text strong { color: #1a1a2e; }
    .footer { 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 30px;
      text-align: center; 
      color: #bbb;
      font-size: 12px;
      border-top: 3px solid #ffd700;
    }
    .footer p { margin: 8px 0; }
    .footer a { color: #ffd700; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Order Confirmed</h1>
        <p>Thank you for your purchase</p>
      </div>
      
      <div class="divider"></div>

      <div class="content">
        <p class="greeting">Dear <strong>${escapeHtml(customerName || "Valued Customer")}</strong>,</p>
        
        <p class="greeting">We're delighted to confirm that your order has been successfully placed and payment has been received. We appreciate your business and look forward to delivering an exceptional experience.</p>

        <div class="order-summary">
          <h2>Order Summary</h2>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product Details</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <table class="items-table total-row" style="margin: 0;">
            <tbody>
              <tr>
                <td colspan="3" style="text-align: right;">Order Total</td>
                <td>${currencySymbol}${formattedTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="order-info">
          <div class="info-item">
            <div class="info-label">Order Reference</div>
            <div class="info-value">#${escapeHtml(orderId)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Store</div>
            <div class="info-value">${escapeHtml(storeName)}</div>
          </div>
        </div>

        <div class="shipping-update">
          <strong>📦 Next Steps</strong>
          <p>Your order is being carefully prepared for shipment in our warehouse. We'll send you a notification as soon as your order ships, complete with tracking information so you can monitor your delivery in real-time.</p>
        </div>

        <p class="greeting">Should you have any questions or concerns regarding your order, please don't hesitate to contact us. Our team is here to assist you every step of the way.</p>

        <div class="footer-text">
          <p>With appreciation,</p>
          <p><strong>${escapeHtml(storeName)}</strong></p>
        </div>
      </div>

      <div class="footer">
        <p>This is an automated confirmation message. Please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} ${escapeHtml(storeName)}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const msg: MailDataRequired = {
      to: customerEmail,
      from: FROM_ADDRESS,
      subject: `Order Confirmed - ${storeName} (Order #${orderId})`,
      html,
    };

    await sgMail.send(msg);
    console.log(`[Email] Order confirmation sent for order ${orderId}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error(`[Email] Failed to send order confirmation for order ${orderId}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to send email" 
    };
  }
}

export async function sendStoreNotificationEmail(
  storeContactEmail: string,
  orderDetails: OrderDetails
) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@chameleon.store";
  const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Chameleon Store";
  const FROM_ADDRESS = FROM_NAME ? `${FROM_NAME} <${FROM_EMAIL}>` : FROM_EMAIL;

  if (!SENDGRID_API_KEY) {
    console.warn("[Email] SENDGRID_API_KEY is not configured. Store notification not sent.");
    return { success: false, message: "SendGrid API key not configured" };
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  const {
    orderId,
    customerName,
    customerEmail,
    items,
    total,
    storeName = "Your Store",
  } = orderDetails;

  const currencySymbol = orderDetails.currency.toLowerCase() === "usd" ? "$" : orderDetails.currency.toUpperCase();
  const formattedTotal = typeof total === "string" ? total : (Math.round(parseFloat(String(total)) * 100) / 100).toFixed(2);

  const itemsHtml = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e8e8e8;">
      <td style="padding: 12px 0; color: #1a1a2e; font-weight: 500;">
        ${escapeHtml(item.productName)} ${item.variantInfo ? `<span style="color: #999;">(${escapeHtml(item.variantInfo)})</span>` : ""}
      </td>
      <td style="padding: 12px 0; color: #666; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 12px 0; color: #1a1a2e; text-align: right; font-weight: 600;">
        ${currencySymbol}${typeof item.unitPrice === "string" ? escapeHtml(item.unitPrice) : item.unitPrice.toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', 'Trebuchet MS', sans-serif; 
      line-height: 1.6; 
      color: #2c3e50; 
      background-color: #f5f5f5;
    }
    .wrapper { background-color: #f5f5f5; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 250px;
      height: 250px;
      background: rgba(255, 215, 0, 0.05);
      border-radius: 50%;
      transform: translate(80px, -80px);
    }
    .header h1 { 
      font-size: 28px; 
      margin: 0; 
      font-weight: 700;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
    }
    .divider { height: 3px; background: linear-gradient(90deg, transparent, #ffd700, transparent); }
    .content { padding: 35px 30px; }
    .badge { 
      display: inline-block;
      background: #ffd700;
      color: #1a1a2e;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .order-details {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      padding: 25px;
      border-radius: 10px;
      margin: 25px 0;
      border: 1px solid #e8e8e8;
    }
    .detail-row { 
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 15px;
      padding: 12px 0;
      border-bottom: 1px solid #e8e8e8;
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { 
      font-weight: 700;
      color: #1a1a2e;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-value { 
      color: #2c3e50;
      word-break: break-all;
    }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table thead tr { border-bottom: 2px solid #ffd700; }
    .items-table th { 
      text-align: left; 
      padding: 12px 0; 
      color: #1a1a2e; 
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table td { padding: 12px 0; }
    .total-section { 
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #ffd700;
    }
    .total-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      padding: 15px 0;
    }
    .total-label {
      text-align: right;
      font-weight: 700;
      color: #1a1a2e;
      font-size: 16px;
    }
    .total-value {
      text-align: right;
      font-weight: 700;
      color: #ffd700;
      font-size: 18px;
    }
    .action-note {
      background: #fffacd;
      border-left: 4px solid #ffd700;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      color: #1a1a2e;
      font-size: 14px;
      line-height: 1.8;
    }
    .footer { 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 25px 30px;
      text-align: center; 
      color: #999;
      font-size: 11px;
      border-top: 3px solid #ffd700;
    }
    .footer p { margin: 6px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>📦 New Order Received</h1>
      </div>
      
      <div class="divider"></div>

      <div class="content">
        <div class="badge">Action Required</div>

        <div class="order-details">
          <div class="detail-row">
            <div class="detail-label">Order ID</div>
            <div class="detail-value">#${escapeHtml(orderId)}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Customer</div>
            <div class="detail-value">${escapeHtml(customerName || "N/A")}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Email</div>
            <div class="detail-value">${escapeHtml(customerEmail)}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Order Total</div>
            <div class="detail-value"><strong>${currencySymbol}${formattedTotal}</strong></div>
          </div>
        </div>

        <h3 style="color: #1a1a2e; font-size: 16px; margin: 25px 0 15px 0;">Items Ordered</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="action-note">
          <strong>⚠️ Next Steps</strong>
          <p style="margin: 10px 0 0 0;">Please process this order promptly and prepare it for shipment. The customer has been notified and will expect their order to arrive on schedule.</p>
        </div>
      </div>

      <div class="footer">
        <p>This is an automated merchant notification. Please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} ${escapeHtml(storeName)}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const msg: MailDataRequired = {
      to: storeContactEmail,
      from: FROM_ADDRESS,
      subject: `New Order #${orderId} - ${storeName}`,
      html,
    };

    await sgMail.send(msg);
    console.log(`[Email] Store notification sent for order ${orderId}`);
    return { success: true, message: "Store notification sent" };
  } catch (error) {
    console.error(`[Email] Failed to send store notification for order ${orderId}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to send email" 
    };
  }
}

interface ShippingConfirmationDetails {
  orderId: string;
  customerName?: string | null;
  customerEmail: string;
  storeName: string;
  trackingNumber?: string;
  items: OrderItem[];
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export async function sendShippingConfirmationEmail(details: ShippingConfirmationDetails) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@chameleon.store";
  const FROM_NAME = details.storeName;
  const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;

  if (!SENDGRID_API_KEY) {
    console.warn("[Email Shipping] SENDGRID_API_KEY is not configured. Email not sent.");
    return { success: false, message: "SendGrid API key not configured" };
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  const {
    orderId,
    customerName,
    customerEmail,
    storeName,
    trackingNumber,
    items,
    shippingAddress,
  } = details;

  // Build items HTML
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #e8e0d0;">
        <div style="font-weight: 500; color: #1a1a1a; font-size: 15px;">${escapeHtml(item.productName)}</div>
        ${item.variantInfo ? `<div style="color: #8b7355; font-size: 13px; margin-top: 4px;">${escapeHtml(item.variantInfo)}</div>` : ""}
      </td>
      <td style="padding: 16px 0; border-bottom: 1px solid #e8e0d0; text-align: center; color: #1a1a1a;">
        ${item.quantity}
      </td>
    </tr>
  `
    )
    .join("");

  // Format shipping address (escape all user-supplied fields)
  const addressLines = [];
  if (shippingAddress?.firstName || shippingAddress?.lastName) {
    addressLines.push(escapeHtml(`${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim()));
  }
  if (shippingAddress?.address) {
    addressLines.push(escapeHtml(shippingAddress.address));
  }
  if (shippingAddress?.apartment) {
    addressLines.push(escapeHtml(shippingAddress.apartment));
  }
  if (shippingAddress?.city || shippingAddress?.state || shippingAddress?.zipCode) {
    addressLines.push(escapeHtml(
      `${shippingAddress.city || ""}${shippingAddress.city && shippingAddress.state ? ", " : ""}${shippingAddress.state || ""} ${shippingAddress.zipCode || ""}`.trim()
    ));
  }
  if (shippingAddress?.country) {
    addressLines.push(escapeHtml(shippingAddress.country));
  }
  const formattedAddress = addressLines.join("<br>");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.6; color: #1a1a1a; background-color: #f8f6f3;">
  <div style="background-color: #f8f6f3; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; padding: 50px 40px; text-align: center;">
        <div style="font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #c9a962; margin-bottom: 16px;">Shipping Confirmation</div>
        <h1 style="margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 2px;">${escapeHtml(storeName)}</h1>
      </div>

      <!-- Main Content -->
      <div style="padding: 50px 40px;">
        
        <!-- Greeting -->
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #c9a962, transparent); margin: 0 auto 30px;"></div>
          <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 400; color: #1a1a1a; letter-spacing: 1px;">Your Order Is On Its Way</h2>
          <p style="margin: 0; color: #666666; font-size: 16px; line-height: 1.8;">
            Dear ${escapeHtml(customerName || "Valued Customer")},<br>
            We are delighted to inform you that your order has been carefully prepared and is now on its journey to you.
          </p>
        </div>

        <!-- Tracking Number Box -->
        ${
          trackingNumber
            ? `<div style="background: linear-gradient(135deg, #faf8f5 0%, #f5f0e8 100%); border: 1px solid #e8e0d0; padding: 30px; text-align: center; margin-bottom: 40px;">
          <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #8b7355; margin-bottom: 12px;">Tracking Number</div>
          <div style="font-size: 20px; font-weight: 600; color: #1a1a1a; letter-spacing: 2px; font-family: 'Courier New', monospace;">${escapeHtml(trackingNumber)}</div>
        </div>`
            : ""
        }

        <!-- Order Details -->
        <div style="margin-bottom: 40px;">
          <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #8b7355; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e8e0d0;">Order Details</div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 12px 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #8b7355; border-bottom: 1px solid #e8e0d0; font-weight: 500;">Item</th>
                <th style="text-align: center; padding: 12px 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #8b7355; border-bottom: 1px solid #e8e0d0; font-weight: 500;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        ${formattedAddress ? `
        <!-- Shipping Address -->
        <div style="margin-bottom: 40px;">
          <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #8b7355; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #e8e0d0;">Shipping To</div>
          <p style="margin: 0; color: #1a1a1a; font-size: 15px; line-height: 1.8;">
            ${formattedAddress}
          </p>
        </div>
        ` : ""}

        <!-- Closing Message -->
        <div style="text-align: center; padding: 30px 0; border-top: 1px solid #e8e0d0;">
          <p style="margin: 0 0 16px; color: #666666; font-size: 15px; line-height: 1.8;">
            Should you have any questions regarding your shipment, please do not hesitate to reach out to us.
          </p>
          <p style="margin: 0; color: #1a1a1a; font-size: 15px;">
            With warm regards,<br>
            <strong style="color: #c9a962;">${escapeHtml(storeName)}</strong>
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div style="background: #1a1a1a; color: #999999; padding: 30px 40px; text-align: center;">
        <div style="font-size: 12px; letter-spacing: 2px; margin-bottom: 8px;">Order Reference: ${escapeHtml(orderId)}</div>
        <div style="font-size: 11px; color: #666666;">Thank you for choosing ${escapeHtml(storeName)}</div>
      </div>

    </div>
  </div>
</body>
</html>
`;

  try {
    const msg: MailDataRequired = {
      to: customerEmail,
      from: FROM_ADDRESS,
      subject: `Your Order Has Shipped - ${storeName}`,
      html,
    };

    await sgMail.send(msg);
    console.log(`[Email Shipping] Shipping confirmation sent for order ${orderId}`);
    return { success: true, message: "Shipping confirmation sent" };
  } catch (error) {
    console.error(`[Email Shipping] Failed to send shipping confirmation for order ${orderId}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
interface PasswordResetDetails {
  email: string;
  resetLink: string;
  storeName?: string;
}

export async function sendPasswordResetEmail(details: PasswordResetDetails) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@chameleon.store";
  const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Chameleon";
  const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;

  if (!SENDGRID_API_KEY) {
    console.warn("[Email] SENDGRID_API_KEY is not configured. Password reset email not sent.");
    return { success: false, message: "SendGrid API key not configured" };
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  const { email, resetLink, storeName = "Chameleon" } = details;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; 
      line-height: 1.6; 
      color: #2c3e50; 
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      padding: 40px 20px;
    }
    .wrapper { background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); padding: 0; }
    .container { 
      max-width: 520px; 
      margin: 0 auto; 
      background: #ffffff; 
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1); 
    }
    .header { 
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
      color: white; 
      padding: 60px 40px; 
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -5%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%);
      border-radius: 50%;
      animation: float 8s ease-in-out infinite reverse;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-20px) scale(1.05); }
    }
    .logo-section {
      position: relative;
      z-index: 2;
      margin-bottom: 20px;
    }
    .logo-circle {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      font-weight: 700;
      font-size: 28px;
      color: #1a1a1a;
      box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
    }
    .header h1 { 
      font-size: 32px; 
      margin: 24px 0 8px 0; 
      font-weight: 700;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 2;
    }
    .header p { 
      margin: 0; 
      opacity: 0.9; 
      font-size: 15px;
      letter-spacing: 0.5px;
      position: relative;
      z-index: 2;
    }
    .divider { 
      height: 2px; 
      background: linear-gradient(90deg, transparent, #ffd700, transparent);
      position: relative;
      z-index: 1;
    }
    .content { padding: 50px 40px; }
    .greeting { 
      font-size: 15px; 
      margin-bottom: 24px; 
      color: #1a1a1a;
      line-height: 1.7;
    }
    .greeting strong { color: #1a1a1a; font-weight: 600; }
    .security-box {
      background: linear-gradient(135deg, #f0f7ff 0%, #f5faff 100%);
      border: 1px solid #d4e8ff;
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
      position: relative;
      overflow: hidden;
    }
    .security-box::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(0, 100, 255, 0.05) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(80px, -80px);
    }
    .security-icon {
      width: 40px;
      height: 40px;
      background: #0064ff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }
    .security-box h3 {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 8px 0;
      position: relative;
      z-index: 1;
    }
    .security-box p {
      font-size: 13px;
      color: #4a5568;
      margin: 0;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white !important;
      padding: 16px 48px;
      border-radius: 10px;
      text-decoration: none !important;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.5px;
      margin: 32px 0;
      transition: all 0.3s ease;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      text-align: center;
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
    }
    .cta-note {
      font-size: 12px;
      color: #999;
      text-align: center;
      margin: 16px 0 0 0;
      line-height: 1.5;
    }
    .action-steps {
      background: linear-gradient(135deg, #f9f9f9 0%, #f5f5f5 100%);
      border: 1px solid #e8e8e8;
      border-radius: 12px;
      padding: 28px;
      margin: 32px 0;
      position: relative;
      overflow: hidden;
    }
    .action-steps::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(50px, -50px);
    }
    .action-steps h3 {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 16px 0;
      position: relative;
      z-index: 1;
    }
    .step {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }
    .step:last-child {
      margin-bottom: 0;
    }
    .step-number {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      color: #1a1a1a;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }
    .step-text {
      font-size: 13px;
      color: #2c3e50;
      line-height: 1.5;
      padding-top: 3px;
    }
    .footer-text {
      margin: 32px 0 0 0;
      padding-top: 32px;
      border-top: 1px solid #e8e8e8;
      text-align: center;
      font-size: 13px;
      color: #2c3e50;
      line-height: 1.7;
    }
    .footer-text strong { color: #1a1a1a; }
    .support-link {
      color: #0064ff;
      text-decoration: none;
      font-weight: 600;
    }
    .support-link:hover {
      text-decoration: underline;
    }
    .footer { 
      background: #1a1a1a;
      padding: 32px 40px;
      text-align: center; 
      color: #999;
      font-size: 11px;
      border-top: 1px solid #2d2d2d;
      position: relative;
      overflow: hidden;
    }
    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.03) 0%, transparent 70%);
      border-radius: 50%;
    }
    .footer p { 
      margin: 6px 0;
      position: relative;
      z-index: 1;
    }
    .footer a { color: #ffd700; text-decoration: none; font-weight: 600; }
    .footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-section">
          <div class="logo-circle">🔐</div>
        </div>
        <h1>Reset Your Password</h1>
        <p>Secure your account in seconds</p>
      </div>
      
      <div class="divider"></div>

      <div class="content">
        <p class="greeting">Click the button below to reset your password. This link expires in 1 hour.</p>

        <a href="${escapeHtml(resetLink)}" class="cta-button" style="color: white !important; text-decoration: none !important; background: #1a1a1a; display: block; padding: 16px 48px; border-radius: 10px; font-weight: 600; font-size: 14px; margin: 32px 0; text-align: center; width: 100%; box-sizing: border-box;">Reset Password Now</a>

        <p class="cta-note">If the button doesn't work, copy and paste this link:<br><span style="word-break: break-all; font-size: 11px; color: #666;">${escapeHtml(resetLink)}</span></p>

        <div class="footer-text" style="border-top: none; margin-top: 24px; padding-top: 0;">
          <p style="font-size: 12px; color: #999;">If you didn't request this, you can ignore this email.</p>
        </div>
      </div>

      <div class="footer">
        <p>This is an automated security email. Please do not reply to this message.</p>
        <p>&copy; ${new Date().getFullYear()} ${escapeHtml(storeName)}. All rights reserved.</p>
        <p>If you have security concerns, please contact us immediately.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const msg: MailDataRequired = {
      to: email,
      from: FROM_ADDRESS,
      subject: `Reset Your Password - ${escapeHtml(storeName)}`,
      html,
    };

    await sgMail.send(msg);
    console.log(`[Email] Password reset email sent to ${email}`);
    return { success: true, message: "Password reset email sent successfully" };
  } catch (error) {
    console.error(`[Email] Failed to send password reset email to ${email}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to send email" 
    };
  }
}