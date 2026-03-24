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
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@bytescart.store";
  // For customer emails, use the store name as the sender
  const FROM_NAME = orderDetails.storeName || process.env.SENDGRID_FROM_NAME || "Bytescart Store";
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
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@bytescart.store";
  const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Bytescart Store";
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
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@bytescart.store";
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
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@bytescart.store";
  const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Bytescart";
  const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;

  if (!SENDGRID_API_KEY) {
    console.warn("[Email] SENDGRID_API_KEY is not configured. Password reset email not sent.");
    return { success: false, message: "SendGrid API key not configured" };
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  const { email, resetLink, storeName = "Bytescart" } = details;

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

// ─── Activation Drip Emails (7-email sequence over 14 days) ───

interface WelcomeEmailDetails {
  email: string;
  storeName: string;
  storeSlug: string;
}

export interface ActivationEmailDetails {
  email: string;
  storeName: string;
  storeSlug: string;
  productCount: number;
  hasStripe: boolean;
}

// Shared helpers
const ADD_PRODUCT_URL = "https://www.bytescart.ai/dashboard/products/new";
const DASHBOARD_URL = "https://www.bytescart.ai/dashboard";

function activationEmailShell(headerTitle: string, headerSub: string, bodyHtml: string, footerExtra?: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI','Trebuchet MS',sans-serif;line-height:1.6;color:#2c3e50;">
  <div style="background-color:#f5f5f5;padding:40px 20px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);color:white;padding:50px 30px;text-align:center;position:relative;">
        <h1 style="font-size:28px;margin:0 0 8px 0;font-weight:700;letter-spacing:-0.5px;">${headerTitle}</h1>
        ${headerSub ? `<p style="margin:0;opacity:0.9;font-size:14px;letter-spacing:0.5px;">${headerSub}</p>` : ""}
      </div>
      <!-- Gold divider -->
      <div style="height:3px;background:linear-gradient(90deg,transparent,#ffd700,transparent);"></div>
      <!-- Content -->
      <div style="padding:40px 35px;">
        ${bodyHtml}
      </div>
      <!-- Footer -->
      <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:30px;text-align:center;color:#999;font-size:12px;border-top:3px solid #ffd700;">
        ${footerExtra || ""}
        <p style="margin:6px 0;">&copy; ${new Date().getFullYear()} Bytescart. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function ctaButton(label: string, url: string): string {
  return `<div style="text-align:center;margin:32px 0;">
    <a href="${url}" style="display:inline-block;background:#1a1a2e;color:#ffffff !important;padding:16px 48px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;letter-spacing:0.3px;">${label}</a>
  </div>`;
}

function p(text: string, style?: string): string {
  return `<p style="font-size:15px;line-height:1.8;margin:0 0 16px;color:#2c3e50;${style || ""}">${text}</p>`;
}

function goldBox(content: string): string {
  return `<div style="background:linear-gradient(135deg,#f8f9fa 0%,#ffffff 100%);padding:24px;border-radius:10px;margin:24px 0;border:1px solid #e8e8e8;border-left:4px solid #ffd700;box-shadow:0 2px 8px rgba(0,0,0,0.05);">${content}</div>`;
}

function stepItem(num: string, title: string, desc: string): string {
  return `<div style="display:flex;gap:12px;margin-bottom:14px;">
    <div style="min-width:28px;height:28px;background:linear-gradient(135deg,#ffd700 0%,#ffed4e 100%);border-radius:50%;color:#1a1a2e;font-weight:700;font-size:12px;text-align:center;line-height:28px;flex-shrink:0;box-shadow:0 2px 8px rgba(255,215,0,0.3);">${num}</div>
    <div>
      <p style="margin:0;font-weight:600;color:#1a1a2e;font-size:14px;">${title}</p>
      <p style="margin:4px 0 0;color:#666;font-size:13px;line-height:1.6;">${desc}</p>
    </div>
  </div>`;
}

function checkItem(title: string, desc: string): string {
  return `<div style="display:flex;gap:12px;margin-bottom:14px;">
    <div style="min-width:22px;height:22px;background:linear-gradient(135deg,#ffd700 0%,#ffed4e 100%);border-radius:50%;color:#1a1a2e;font-weight:700;font-size:11px;text-align:center;line-height:22px;flex-shrink:0;margin-top:2px;">&#10003;</div>
    <div>
      <p style="margin:0;font-weight:600;color:#1a1a2e;font-size:14px;">${title}</p>
      <p style="margin:3px 0 0;color:#666;font-size:13px;line-height:1.6;">${desc}</p>
    </div>
  </div>`;
}

async function sendActivationEmail(to: string, subject: string, html: string, replyTo?: string) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@bytescart.store";
  const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Bytescart";
  const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;

  if (!SENDGRID_API_KEY) {
    console.warn("[Email] SENDGRID_API_KEY not configured.");
    return { success: false, message: "SendGrid API key not configured" };
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  try {
    const msg: MailDataRequired = { to, from: FROM_ADDRESS, subject, html };
    (msg as any).replyTo = replyTo || "bytesuite@bytesplatform.com";
    await sgMail.send(msg);
    console.log(`[Email] Activation email sent to ${to}: ${subject}`);
    return { success: true, message: "Email sent" };
  } catch (error) {
    console.error(`[Email] Failed: ${subject} to ${to}:`, error instanceof Error ? error.message : "Unknown");
    return { success: false, message: error instanceof Error ? error.message : "Failed to send" };
  }
}

// ── Email 1: Welcome (immediate, at store creation) ──
export async function sendWelcomeEmail(details: WelcomeEmailDetails) {
  const { email, storeName, storeSlug } = details;
  const name = escapeHtml(storeName);
  const storeUrl = `https://www.bytescart.ai/stores/${escapeHtml(storeSlug)}`;

  const html = activationEmailShell(
    `${name} is Live`,
    "YOUR STORE IS READY",
    `${p(`Your store is already live at <a href="${storeUrl}" style="color:#ffd700;text-decoration:none;font-weight:600;">${name}</a>. Right now it's an empty storefront — but that changes the moment you add your first product.`)}
     ${p("It takes less than 60 seconds. Just a name, a price, and a photo. That's it — you can always edit later.")}
     ${ctaButton("Add Your First Product", ADD_PRODUCT_URL)}
     ${goldBox(`<p style="margin:0;font-size:13px;color:#2c3e50;text-align:center;">Stores that add their first product within the first hour are <strong style="color:#1a1a2e;">5x more likely</strong> to make a sale in their first week.</p>`)}`
  );

  return sendActivationEmail(email, `${name} is live — here's what to do in the next 5 minutes`, html);
}

// ── Email 2: +3 hours (no products yet) ──
export async function sendActivationEmail2(details: ActivationEmailDetails) {
  const { email, storeName, storeSlug } = details;
  const name = escapeHtml(storeName);
  const storeUrl = `https://www.bytescart.ai/stores/${escapeHtml(storeSlug)}`;

  const html = activationEmailShell(
    "You're One Product Away",
    `FROM TURNING ${escapeHtml(storeName).toUpperCase()} INTO A REAL STORE`,
    `${p(`Right now, when someone visits <a href="${storeUrl}" style="color:#ffd700;text-decoration:none;font-weight:600;">${name}</a>, they see an empty page. But imagine it with just 2-3 products listed — a price, a photo, an "Add to Cart" button.`)}

     <div style="background:linear-gradient(135deg,#f8f9fa 0%,#ffffff 100%);border-radius:10px;padding:20px;margin:24px 0;border:1px solid #e8e8e8;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
       <table style="width:100%;border-collapse:collapse;">
         <tr>
           <td style="padding:8px 0;vertical-align:top;width:48%;">
             <p style="margin:0 0 8px;font-weight:700;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Before</p>
             <div style="background:#f5f5f5;border:1px solid #e8e8e8;border-radius:8px;padding:28px;text-align:center;">
               <p style="margin:0;color:#ccc;font-size:13px;">Empty storefront</p>
               <p style="margin:4px 0 0;color:#ddd;font-size:11px;">No products listed</p>
             </div>
           </td>
           <td style="width:4%;text-align:center;vertical-align:middle;"><span style="color:#ffd700;font-size:18px;font-weight:700;">→</span></td>
           <td style="padding:8px 0;vertical-align:top;width:48%;">
             <p style="margin:0 0 8px;font-weight:700;color:#ffd700;font-size:11px;text-transform:uppercase;letter-spacing:1px;">After</p>
             <div style="background:#fff;border:2px solid #ffd700;border-radius:8px;padding:28px;text-align:center;">
               <p style="margin:0;color:#1a1a2e;font-size:13px;font-weight:600;">Your products</p>
               <p style="margin:4px 0 0;color:#666;font-size:11px;">Ready to sell</p>
             </div>
           </td>
         </tr>
       </table>
     </div>

     ${p("The difference? About 60 seconds of your time.")}
     ${ctaButton("Add Your First Product", ADD_PRODUCT_URL)}`
  );

  return sendActivationEmail(email, `You're one product away from a real store`, html);
}

// ── Email 3: +24 hours (social proof) ──
export async function sendActivationEmail3(details: ActivationEmailDetails) {
  const { email, storeName } = details;
  const name = escapeHtml(storeName);

  const html = activationEmailShell(
    "Others Are Already Selling",
    "REAL RESULTS FROM A STORE OWNER",
    `${p(`<strong style="color:#1a1a2e;">${name}</strong> has been live for a day now. While you've been thinking about it, other store owners have been taking action.`)}

     ${goldBox(`<p style="margin:0 0 10px;color:#2c3e50;font-size:14px;font-style:italic;line-height:1.7;">"I added my first 3 products on a Tuesday afternoon during my lunch break. By Thursday evening, I had shared the link on my Instagram story and got my first order. I couldn't believe how fast it happened."</p>
       <p style="margin:0;color:#999;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">— A Bytescart store owner</p>`)}

     ${p("The hardest part isn't building the store — you've already done that. The hardest part is adding that first product. Once it's there, everything else clicks into place.")}
     ${ctaButton("Add Your First Product Now", ADD_PRODUCT_URL)}
     ${p("It takes less than 60 seconds. Seriously.", "color:#999;font-size:13px;text-align:center;")}`
  );

  return sendActivationEmail(email, `Other store owners added products yesterday — your turn?`, html);
}

// ── Email 4: +48 hours (address objections) ──
export async function sendActivationEmail4(details: ActivationEmailDetails) {
  const { email, storeName } = details;
  const name = escapeHtml(storeName);

  const html = activationEmailShell(
    "Waiting for Perfect?",
    "IT DOESN'T NEED TO BE",
    `${p(`We get it. You created <strong style="color:#1a1a2e;">${name}</strong> but maybe you haven't listed a product yet because something feels like it's not ready. Here's the thing — it doesn't need to be perfect to start.`)}

     <div style="margin:24px 0;">
       ${checkItem("Phone photos work great", "You don't need a professional photographer. Natural light + your phone = good enough to start.")}
       ${checkItem("You don't need shipping figured out yet", "Just get your products listed. You can sort logistics later.")}
       ${checkItem("Start with just one product", "Some of our most successful stores launched with a single item. You can always add more.")}
       ${checkItem("You can edit everything later", "Nothing is permanent. Change prices, descriptions, photos — anytime.")}
     </div>

     ${p("<strong style=\"color:#1a1a2e;\">Give yourself permission to start messy.</strong> The store owners who succeed aren't the ones with perfect product photos — they're the ones who hit publish.")}
     ${ctaButton("Just Add One Product", ADD_PRODUCT_URL)}`
  );

  return sendActivationEmail(email, `You don't need perfect photos to start selling`, html);
}

// ── Email 5: Day 4 (branched — with products vs without) ──
export async function sendActivationEmail5(details: ActivationEmailDetails) {
  const { email, storeName, storeSlug, productCount, hasStripe } = details;
  const name = escapeHtml(storeName);
  const storeUrl = `https://www.bytescart.ai/stores/${escapeHtml(storeSlug)}`;

  if (productCount > 0) {
    const nextStep = !hasStripe
      ? { label: "Connect Payments", url: DASHBOARD_URL, text: "You've got products listed — amazing! The next step is connecting Stripe so customers can actually buy them. It takes about 2 minutes." }
      : { label: "Share Your Store", url: storeUrl, text: `You've got ${productCount} product${productCount > 1 ? "s" : ""} listed and payments connected. Your store is ready for customers! Now it's time to share your link.` };

    const html = activationEmailShell(
      `Great Job on ${name}!`,
      `${productCount} PRODUCT${productCount > 1 ? "S" : ""} LISTED AND COUNTING`,
      `${p(nextStep.text)}
       ${ctaButton(nextStep.label, nextStep.url)}`
    );

    return sendActivationEmail(email, `${name} is looking great — here's your next step`, html);
  } else {
    const html = activationEmailShell(
      `${name} Is Still Waiting`,
      "HERE'S WHAT YOU'RE LEAVING ON THE TABLE",
      `${p(`It's been 4 days since you created <strong style="color:#1a1a2e;">${name}</strong>. Your storefront is live, your URL works, and everything is ready — except there are no products for anyone to buy.`)}

       ${goldBox(`<p style="margin:0 0 4px;font-size:36px;font-weight:800;color:#1a1a2e;text-align:center;">3x</p>
         <p style="margin:0;font-size:13px;color:#666;font-weight:600;text-align:center;">Stores that add products in the first week are 3x more likely to make a sale in their first month</p>`)}

       ${p("You don't need 50 products. You don't need professional photos. You just need <strong style=\"color:#1a1a2e;\">one product listed</strong> to turn your empty storefront into a real store.")}
       ${ctaButton("Add Your First Product", ADD_PRODUCT_URL)}`
    );

    return sendActivationEmail(email, `Here's what you're leaving on the table`, html);
  }
}

// ── Email 6: Day 7 (personal, uses store name) ──
export async function sendActivationEmail6(details: ActivationEmailDetails) {
  const { email, storeName, storeSlug, productCount, hasStripe } = details;
  const name = escapeHtml(storeName);
  const storeUrl = `https://www.bytescart.ai/stores/${escapeHtml(storeSlug)}`;

  if (productCount > 0 && hasStripe) {
    const html = activationEmailShell(
      `${name} Is Fully Set Up`,
      "HERE'S HOW TO GET YOUR FIRST SALE",
      `${p(`Your store has ${productCount} product${productCount > 1 ? "s" : ""}, payments are connected, and everything is ready. Now you just need eyeballs on it. Here are 3 things you can do right now:`)}

       <div style="margin:24px 0;">
         ${stepItem("1", "Share on social media", "Post your store link on Instagram, Facebook, TikTok, or wherever your audience is.")}
         ${stepItem("2", "Send it to 10 friends", "Ask them to check it out and share honest feedback. Word of mouth is powerful.")}
         ${stepItem("3", "Add it to your bio", "Put your store link in your Instagram bio, Twitter profile, or email signature.")}
       </div>

       ${ctaButton("Visit Your Store", storeUrl)}`
    );

    return sendActivationEmail(email, `3 ways to get your first sale on ${name}`, html);
  }

  const html = activationEmailShell(
    `${name} Is Still Here`,
    "YOUR STOREFRONT IS WAITING",
    `${p(`It's been a week since you created <strong style="color:#1a1a2e;">${name}</strong>. Your store URL is live, your theme is set, everything is in place — except the shelves are empty.`)}
     ${p(`We're not going to sugarcoat it: <strong style="color:#1a1a2e;">the ${name} storefront is ready. Your products aren't.</strong>`)}
     ${p("We know life gets busy. But here's the thing — adding one product takes less time than reading this email. A name, a price, one photo. That's it.")}
     ${ctaButton("Add a Product Right Now", ADD_PRODUCT_URL)}`
  );

  return sendActivationEmail(email, `The ${name} storefront is ready — your products aren't`, html);
}

// ── Email 7: Day 14 (last chance, reply-to enabled) ──
export async function sendActivationEmail7(details: ActivationEmailDetails) {
  const { email, storeName, productCount } = details;
  const name = escapeHtml(storeName);

  if (productCount > 0) {
    const html = activationEmailShell(
      `Checking In on ${name}`,
      "",
      `${p(`Hey! It's been 2 weeks since you created <strong style="color:#1a1a2e;">${name}</strong>. You've got ${productCount} product${productCount > 1 ? "s" : ""} listed — that's great.`)}
       ${p("If there's anything holding you back from growing your store — whether it's a feature you need, something that's confusing, or just a question — <strong style=\"color:#1a1a2e;\">reply to this email</strong>. A real person reads it and we'll personally help you out.")}
       ${p("We want to see you succeed.", "color:#999;font-size:13px;")}
       ${ctaButton("Visit Your Dashboard", DASHBOARD_URL)}`,
      `<p style="margin:0 0 8px;color:#bbb;font-size:11px;">You can reply directly to this email — we read every response.</p>`
    );

    return sendActivationEmail(email, `How's ${name} going? We'd love to help`, html, "bytesuite@bytesplatform.com");
  }

  const html = activationEmailShell(
    "Is Something Holding You Back?",
    "",
    `${p(`It's been 2 weeks since you created <strong style="color:#1a1a2e;">${name}</strong>, and you haven't added any products yet. We're not here to nag — we genuinely want to understand what happened.`)}
     ${p("Was it too complicated? Did you run out of time? Not sure what to list? Changed your mind entirely?")}
     ${p("<strong style=\"color:#1a1a2e;\">Reply to this email and tell us.</strong> A real person will read your response and, if you want, we'll personally help you get your first product listed.")}
     ${p("This is the last setup reminder we'll send. If Bytescart isn't for you, no hard feelings at all. But if there's even a small part of you that still wants to try — just reply.", "color:#999;font-size:14px;")}
     ${ctaButton("Or Just Add a Product Now", ADD_PRODUCT_URL)}`,
    `<p style="margin:0 0 8px;color:#bbb;font-size:11px;">This is the last activation email. You can reply directly — we read every response.</p>`
  );

  return sendActivationEmail(email, `${name} — is something holding you back?`, html, "bytesuite@bytesplatform.com");
}