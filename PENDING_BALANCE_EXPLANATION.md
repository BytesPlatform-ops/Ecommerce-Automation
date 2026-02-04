# Understanding Pending Balance in Stripe

## What is Pending Balance?

The **Pending Balance** shown on your payments page is **working correctly**. This is normal Stripe behavior, not a bug.

### Why Does It Include Recent Purchases?

When a customer makes a purchase:

1. **Transaction Initiated** - Stripe processes the payment immediately
2. **Pending Period** - The funds are held by Stripe for a brief period (typically 1-2 business days) while they complete verification
3. **Available** - After the hold period, funds move to your "Available Balance" and can be withdrawn

### Balance Breakdown

- **Available Balance**: Money ready to be withdrawn to your bank account
- **Processing Balance** (previously "Pending"): Money from recent transactions being held during the verification period

### Is This Normal?

Yes! This is completely normal. The pending balance will naturally include:

- All purchases made in the last 1-2 days
- Any pending refunds or chargebacks
- Temporarily held funds waiting for settlement

### Timeline Example

| Time         | Amount                     | Status                 |
| ------------ | -------------------------- | ---------------------- |
| Day 1, 10 AM | Customer pays $100         | → Pending (processing) |
| Day 1, 11 AM | Another customer pays $50  | → Pending (processing) |
| Day 2, 10 AM | First transaction settles  | → Available            |
| Day 2, 11 AM | Second transaction settles | → Available            |

## Not a Balance Problem

Your pending balance is **not** showing incorrect amounts. It's reflecting the natural processing timeline of Stripe payments.

## What You Should Check Instead

If you're concerned about actual balance discrepancies:

1. **Go to Stripe Dashboard** - Click the "Dashboard" button on the payments page for full details
2. **Check Transaction History** - Verify all orders were created correctly
3. **Review Charges** - Ensure charges match your order total
4. **Look for Fees** - Stripe may charge small transaction fees (2.9% + $0.30 per transaction)

## Summary

✅ **This is working as designed**  
✅ **Pending balance naturally includes recent transactions**  
✅ **Funds will become available within 1-2 business days**  
✅ **No action needed**
