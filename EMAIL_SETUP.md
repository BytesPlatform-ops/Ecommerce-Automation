# Email Sending Setup Guide

This guide explains how to set up the email sending feature for order confirmations.

## Overview

When a customer completes a payment, two emails are automatically sent:
1. **Customer Confirmation Email** - To the customer with their order details and shipping status
2. **Store Notification Email** - To the store owner (optional) with order details

## Setup Requirements

### 1. SendGrid Account

SendGrid is used to send emails. You need:
- A SendGrid account (free tier available: https://sendgrid.com)
- SendGrid API Key
- Sender email address (verified with SendGrid)

#### Steps to Set Up SendGrid:
1. Go to https://sendgrid.com and create an account
2. Verify a sender email/domain (required for sending emails)
3. Navigate to "API Keys" section (Settings > API Keys)
4. Create a new API key
5. Copy the API key safely

### 2. Environment Variables

Add these variables to your `.env.local` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

Replace:
- `SG.xxxxxxxxxxxxxxxxxxxxx` with your actual SendGrid API key
- `noreply@yourdomain.com` with your verified sender email

## Email Flow

### Payment Completion Flow:
1. Customer completes payment on checkout page
2. Stripe sends `payment_intent.succeeded` webhook event
3. Webhook handler:
   - Updates order status to "Completed" with payment status "Paid"
   - Fetches order details from database (including items, customer info, store info)
   - Sends customer confirmation email with:
     - Order ID and summary
     - List of ordered items with quantities and prices
     - Message about shipping updates
   - Sends store notification email to `store.contactEmail` (if configured)

## Customer Email Features

The customer confirmation email includes:
- Order confirmation header
- Detailed order summary with items, quantities, and prices
- Order ID and store name
- **Shipping update message**: "Your order is being prepared for shipment. We'll send you a notification as soon as your order ships with tracking information."
- Professional HTML template with branded styling (customizable)
- Footer with order date and store information

## Store Notification Email

The store owner receives a notification email with:
- Order ID
- Customer name and email
- Items ordered with quantities and prices
- Total amount
- Note to process and prepare for shipment

## Important Notes

### Store Contact Email
- To receive store notifications, configure the `contactEmail` in your store settings
- Update this in: Dashboard → Store Settings → Contact Information

### Email Sending Conditions
- Customer emails are always sent (to `order.customerEmail`)
- Store notification emails are only sent if `store.contactEmail` is configured
- Email sending failures are logged but don't block the webhook (ensure order is marked as completed)

### SSL/TLS
- SendGrid requires SMTP connections with TLS
- This is handled automatically by the `@sendgrid/mail` package

## Testing Emails

### Development Testing:
1. Ensure `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` are set in `.env.local`
2. Make a test payment through the checkout flow
3. Check SendGrid dashboard → Activity Feed to see delivered emails
4. Check your email inbox for the confirmation email

### Webhook Testing:
```bash
# You can use Stripe CLI to test webhook locally
stripe listen --forward-to localhost:3000/api/payments/webhook
```

## Customizing Email Templates

The email templates are defined in [src/lib/email.ts](src/lib/email.ts):

1. **Customer Email**: `sendOrderConfirmationEmail()` function
2. **Store Email**: `sendStoreNotificationEmail()` function

To customize:
- Edit the HTML templates in these functions
- Change colors, layout, or messaging
- Don't forget to update the `subject` line

## Troubleshooting

### Emails Not Being Sent
1. Check if `SENDGRID_API_KEY` is set and valid
2. Check if `SENDGRID_FROM_EMAIL` is verified in SendGrid
3. Check Next.js console logs for errors
4. Check SendGrid Activity Feed (dashboard) for delivery issues

### API Key Errors
- Ensure the API key is active and has the right permissions
- Regenerate if needed in SendGrid dashboard

### Sender Email Not Verified
- Verify the sender domain/email in SendGrid dashboard first
- Use the verified email in `SENDGRID_FROM_EMAIL`

## Email Variables Reference

The following variables are automatically included in emails:

| Variable | Source | Used For |
|----------|--------|----------|
| `orderId` | Order record | Order identification |
| `customerName` | Order record | Personalization |
| `customerEmail` | Order record | Email recipient |
| `items` | OrderItem records | Order details |
| `total` | Order record | Price summary |
| `currency` | Order record | Currency formatting |
| `storeName` | Store record | Branding |
| `shippingStatus` | Hardcoded message | Shipping notification |

## Security Considerations

- SendGrid API key should only be in `.env.local` (not committed to git)
- Never log or expose API keys
- Emails are sent server-side only
- Customer data is not stored in SendGrid (only transmitted)

## Future Enhancements

Possible improvements:
- Shipment update emails (when status changes to "Shipped")
- Refund/cancellation emails
- Template customization per store (via admin dashboard)
- Email scheduling/queueing for bulk sends
- Delivery tracking and retry logic

## Support

For SendGrid support: https://support.sendgrid.com
