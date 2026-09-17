const { google } = require("googleapis");
const Stock = require("../models/Stock");
const GoogleSheetSync = require("../models/GoogleSheetSync");

// The client's sheet has one tab per product category, each with its own
// header row somewhere near the top. Column *positions* aren't hardcoded —
// they're looked up by header text on every sync run, so someone reordering
// columns in the sheet doesn't make the sync silently read the wrong column
// into the wrong field. If a required header can't be found, that tab is
// skipped (and the miss recorded) rather than guessing.
const TABS = [
  {
    name: "Phone",
    range: "Phone!A1:J2000",
    headers: { sku: ["SKU"], quantity: ["Inv", "INV"], costPrice: ["CP"], shipping: ["SHIP"] },
  },
  {
    name: "Accessories",
    range: "Accessories!A1:J2000",
    headers: { sku: ["SKU"], quantity: ["Inv", "INV"], costPrice: ["CP"], shipping: ["SHIP"] },
  },
];

function getSheetsClient() {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  // Private keys stored in .env have their real newlines escaped as
  // literal "\n" — has to be unescaped or the JWT signer rejects the key.
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    throw new Error(
      "Google Sheets sync is not configured — set GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY."
    );
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === "") return fallback;
  const n = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

// Finds the header row within the first 10 rows (category-header/summary
// rows above it are skipped) and maps each required field to whichever
// column currently holds a matching header, wherever that is.
function resolveColumns(rows, headerAliases) {
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const row = rows[r];
    const cols = {};

    for (const [field, aliases] of Object.entries(headerAliases)) {
      const idx = row.findIndex(
        (cell) =>
          typeof cell === "string" &&
          aliases.some((alias) => cell.trim().toUpperCase() === alias.toUpperCase())
      );
      if (idx !== -1) cols[field] = idx;
    }

    const foundAll = Object.keys(headerAliases).every((field) => cols[field] !== undefined);
    if (foundAll) return { cols, headerRowIndex: r };
  }

  return null;
}

async function syncStockFromSheet() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Google Sheets sync is not configured — set GOOGLE_SHEET_ID.");
  }

  const sheets = getSheetsClient();

  let rowsRead = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const tabErrors = [];

  for (const tab of TABS) {
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: tab.range,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    const rows = data.values || [];
    rowsRead += rows.length;

    const resolved = resolveColumns(rows, tab.headers);
    if (!resolved) {
      const missing = Object.keys(tab.headers).join(", ");
      tabErrors.push(
        `"${tab.name}" tab: couldn't find header columns for (${missing}) — this tab was skipped, nothing on it was synced.`
      );
      continue;
    }
    const { cols, headerRowIndex } = resolved;

    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      const rawSku = row[cols.sku];
      const sku = typeof rawSku === "string" ? rawSku.trim() : "";

      // Skips blank rows and category-header rows (e.g. "Brand New
      // SmartPhone") — neither has a real SKU string in the SKU column.
      if (!sku) {
        skipped++;
        continue;
      }

      const update = {
        price: toNumber(row[cols.costPrice], 0),
        shipping: toNumber(row[cols.shipping], 0),
        quantity: toNumber(row[cols.quantity], 0),
        updatedBy: "Automated (Google Sheet Sync)",
      };

      const result = await Stock.updateOne(
        { sku },
        { $set: update },
        { upsert: true }
      );

      if (result.upsertedCount > 0) created++;
      else updated++;
    }
  }

  await GoogleSheetSync.findOneAndUpdate(
    {},
    {
      lastSync: new Date(),
      lastError: tabErrors.join(" "),
      rowsRead,
      created,
      updated,
      skipped,
    },
    { upsert: true }
  );

  if (tabErrors.length) {
    console.log("Google Sheet stock sync — some tabs skipped:", tabErrors.join(" "));
  }

  return { rowsRead, created, updated, skipped, tabErrors };
}

module.exports = { syncStockFromSheet };
