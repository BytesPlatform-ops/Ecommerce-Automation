import sgMail, { MailDataRequired } from "@sendgrid/mail";

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

  // Build items HTML
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td>
        <div style="font-weight: 600; color: #1a1a2e;">${item.productName}</div>
        ${item.variantInfo ? `<small>${item.variantInfo}</small>` : ""}
      </td>
      <td style="text-align: center;">
        ${item.quantity}
      </td>
      <td style="text-align: right;">
        ${currencySymbol}${typeof item.unitPrice === "string" ? item.unitPrice : item.unitPrice.toFixed(2)}
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
        <p class="greeting">Dear <strong>${customerName || "Valued Customer"}</strong>,</p>
        
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
            <div class="info-value">#${orderId}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Store</div>
            <div class="info-value">${storeName}</div>
          </div>
        </div>

        <div class="shipping-update">
          <strong>📦 Next Steps</strong>
          <p>Your order is being carefully prepared for shipment in our warehouse. We'll send you a notification as soon as your order ships, complete with tracking information so you can monitor your delivery in real-time.</p>
        </div>

        <p class="greeting">Should you have any questions or concerns regarding your order, please don't hesitate to contact us. Our team is here to assist you every step of the way.</p>

        <div class="footer-text">
          <p>With appreciation,</p>
          <p><strong>${storeName}</strong></p>
        </div>
      </div>

      <div class="footer">
        <p>This is an automated confirmation message. Please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const msg: MailDataRequired = {
      to: customerEmail,
      from: FROM_EMAIL,
      subject: `Order Confirmed - ${storeName} (Order #${orderId})`,
      html,
    };

    await sgMail.send(msg);
    console.log(`[Email] Order confirmation sent to ${customerEmail} for order ${orderId}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error(`[Email] Failed to send order confirmation to ${customerEmail}:`, error);
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
    storeName = "Your Store",
  } = orderDetails;

  const currencySymbol = orderDetails.currency.toLowerCase() === "usd" ? "$" : orderDetails.currency.toUpperCase();
  const formattedTotal = typeof total === "string" ? total : (Math.round(parseFloat(String(total)) * 100) / 100).toFixed(2);

  const itemsHtml = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e8e8e8;">
      <td style="padding: 12px 0; color: #1a1a2e; font-weight: 500;">
        ${item.productName} ${item.variantInfo ? `<span style="color: #999;">(${item.variantInfo})</span>` : ""}
      </td>
      <td style="padding: 12px 0; color: #666; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 12px 0; color: #1a1a2e; text-align: right; font-weight: 600;">
        ${currencySymbol}${typeof item.unitPrice === "string" ? item.unitPrice : item.unitPrice.toFixed(2)}
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
            <div class="detail-value">#${orderId}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Customer</div>
            <div class="detail-value">${customerName || "N/A"}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Email</div>
            <div class="detail-value">${customerEmail}</div>
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
        <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const msg: MailDataRequired = {
      to: storeContactEmail,
      from: FROM_EMAIL,
      subject: `New Order #${orderId} - ${storeName}`,
      html,
    };

    await sgMail.send(msg);
    console.log(`[Email] Store notification sent to ${storeContactEmail} for order ${orderId}`);
    return { success: true, message: "Store notification sent" };
  } catch (error) {
    console.error(`[Email] Failed to send store notification:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to send email" 
    };
  }
}
