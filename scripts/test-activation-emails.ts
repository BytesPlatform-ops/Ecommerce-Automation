import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env manually since dotenv isn't installed
const envPath = resolve(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}
import {
  sendWelcomeEmail,
  sendActivationEmail2,
  sendActivationEmail3,
  sendActivationEmail4,
  sendActivationEmail5,
  sendActivationEmail6,
  sendActivationEmail7,
} from "../src/lib/email";

const TARGET = "bytesuite@bytesplatform.com";
const STORE_NAME = "Urban Threads Co";
const STORE_SLUG = "urban-threads-co";

async function main() {
  console.log(`Sending all 7 activation emails to ${TARGET}...\n`);

  // Email 1: Welcome (immediate)
  console.log("1/7 — Welcome email...");
  await sendWelcomeEmail({ email: TARGET, storeName: STORE_NAME, storeSlug: STORE_SLUG });

  // Email 2: +3 hours (no products)
  console.log("2/7 — 3-hour nudge (before/after)...");
  await sendActivationEmail2({ email: TARGET, storeName: STORE_NAME, storeSlug: STORE_SLUG, productCount: 0, hasStripe: false });

  // Email 3: +24 hours (social proof)
  console.log("3/7 — 24-hour social proof...");
  await sendActivationEmail3({ email: TARGET, storeName: STORE_NAME, storeSlug: STORE_SLUG, productCount: 0, hasStripe: false });

  // Email 4: +48 hours (address objections)
  console.log("4/7 — 48-hour objection handling...");
  await sendActivationEmail4({ email: TARGET, storeName: STORE_NAME, storeSlug: STORE_SLUG, productCount: 0, hasStripe: false });

  // Email 5a: Day 4 (NO products variant)
  console.log("5a/7 — Day 4 (no products — stats urgency)...");
  await sendActivationEmail5({ email: TARGET, storeName: STORE_NAME, storeSlug: STORE_SLUG, productCount: 0, hasStripe: false });

  // Email 5b: Day 4 (HAS products variant)
  console.log("5b/7 — Day 4 (has products — next step)...");
  await sendActivationEmail5({ email: TARGET, storeName: STORE_NAME, storeSlug: STORE_SLUG, productCount: 3, hasStripe: false });

  // Email 6a: Day 7 (not set up)
  console.log("6a/7 — Day 7 (not set up)...");
  await sendActivationEmail6({ email: TARGET, storeName: STORE_NAME, storeSlug: STORE_SLUG, productCount: 0, hasStripe: false });

  // Email 6b: Day 7 (fully set up, tips to get first sale)
  console.log("6b/7 — Day 7 (fully set up — sale tips)...");
  await sendActivationEmail6({ email: TARGET, storeName: STORE_NAME, storeSlug: STORE_SLUG, productCount: 5, hasStripe: true });

  // Email 7a: Day 14 (no products — last chance)
  console.log("7a/7 — Day 14 (no products — last chance)...");
  await sendActivationEmail7({ email: TARGET, storeName: STORE_NAME, storeSlug: STORE_SLUG, productCount: 0, hasStripe: false });

  // Email 7b: Day 14 (has products — check-in)
  console.log("7b/7 — Day 14 (has products — check-in)...");
  await sendActivationEmail7({ email: TARGET, storeName: STORE_NAME, storeSlug: STORE_SLUG, productCount: 3, hasStripe: true });

  console.log("\nDone! Check bytesuite@bytesplatform.com for all 10 emails (7 unique + 3 branched variants).");
}

main().catch(console.error);
