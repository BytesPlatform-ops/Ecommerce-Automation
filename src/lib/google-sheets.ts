import { google } from "googleapis";

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || "User Signups";

// Service account credentials from environment variables
let credentials: Record<string, unknown> | null = null;
if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  } catch {
    console.warn("[Google Sheets] Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON - sheets integration disabled");
  }
}

export interface UserTrackingData {
  userId: string;
  email: string;
  phone: string;
  storeName: string;
  storeSlug: string;
  signupDate: string;
  productsAdded: number;
  subscriptionTier: string;
  stripeConnected: boolean;
}

const HEADERS = [
  "User ID",
  "Email",
  "Phone",
  "Store Name",
  "Store Slug",
  "Signup Date",
  "Products Added",
  "Subscription Tier",
  "Stripe Connected",
];

/**
 * Get authenticated Google Sheets client
 */
async function getSheetsClient() {
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set");
  }

  if (!SPREADSHEET_ID) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID environment variable not set");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Ensures the sheet has headers in the first row
 */
async function ensureHeaders(): Promise<void> {
  const sheets = await getSheetsClient();

  // Check if headers exist
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:I1`,
  });

  if (!response.data.values || response.data.values.length === 0) {
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:I1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [HEADERS],
      },
    });
  }
}

/**
 * Appends a new user entry to the Google Sheet
 */
export async function appendUserToSheet(data: UserTrackingData): Promise<void> {
  const sheets = await getSheetsClient();

  await ensureHeaders();

  const row = [
    data.userId,
    data.email,
    data.phone,
    data.storeName,
    data.storeSlug,
    data.signupDate,
    data.productsAdded,
    data.subscriptionTier,
    data.stripeConnected ? "Yes" : "No",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:I`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [row],
    },
  });
}

/**
 * Updates an existing user entry in the Google Sheet by userId
 */
export async function updateUserInSheet(
  userId: string,
  updates: Partial<Omit<UserTrackingData, "userId">>
): Promise<boolean> {
  const sheets = await getSheetsClient();

  // Get all data to find the user's row
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:I`,
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) return false;

  // Find the row with matching userId (column A, index 0)
  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === userId) {
      rowIndex = i + 1; // Sheet rows are 1-indexed
      break;
    }
  }

  if (rowIndex === -1) return false;

  // Get current row data
  const currentRow = rows[rowIndex - 1];

  // Build updated row
  const updatedRow = [
    currentRow[0], // userId (unchanged)
    updates.email ?? currentRow[1],
    updates.phone ?? currentRow[2],
    updates.storeName ?? currentRow[3],
    updates.storeSlug ?? currentRow[4],
    updates.signupDate ?? currentRow[5],
    updates.productsAdded ?? currentRow[6],
    updates.subscriptionTier ?? currentRow[7],
    updates.stripeConnected !== undefined
      ? updates.stripeConnected
        ? "Yes"
        : "No"
      : currentRow[8],
  ];

  // Update the row
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:I${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [updatedRow],
    },
  });

  return true;
}

/**
 * Gets user data from the sheet by userId
 */
export async function getUserFromSheet(
  userId: string
): Promise<UserTrackingData | null> {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:I`,
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) return null;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === userId) {
      return {
        userId: rows[i][0],
        email: rows[i][1],
        phone: rows[i][2],
        storeName: rows[i][3],
        storeSlug: rows[i][4],
        signupDate: rows[i][5],
        productsAdded: parseInt(rows[i][6], 10) || 0,
        subscriptionTier: rows[i][7],
        stripeConnected: rows[i][8] === "Yes",
      };
    }
  }

  return null;
}

/**
 * Gets all users from the sheet
 */
export async function getAllUsersFromSheet(): Promise<UserTrackingData[]> {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:I`,
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) return [];

  return rows.slice(1).map((row) => ({
    userId: row[0] || "",
    email: row[1] || "",
    phone: row[2] || "",
    storeName: row[3] || "",
    storeSlug: row[4] || "",
    signupDate: row[5] || "",
    productsAdded: parseInt(row[6], 10) || 0,
    subscriptionTier: row[7] || "FREE",
    stripeConnected: row[8] === "Yes",
  }));
}

/**
 * Check if Google Sheets is configured
 */
export function isGoogleSheetsConfigured(): boolean {
  return !!(credentials && SPREADSHEET_ID);
}
