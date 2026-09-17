const { syncStockFromSheet } = require("../services/googleSheetStockSync");
const GoogleSheetSync = require("../models/GoogleSheetSync");

async function runSync() {
  try {
    const result = await syncStockFromSheet();
    console.log(
      `Google Sheet stock sync: ${result.rowsRead} row(s) read, ${result.created} created, ${result.updated} updated, ${result.skipped} skipped.`
    );
  } catch (error) {
    console.log("Google Sheet stock sync error:", error.message);
    try {
      await GoogleSheetSync.findOneAndUpdate(
        {},
        { lastError: error.message },
        { upsert: true }
      );
    } catch (saveError) {
      console.log(saveError);
    }
  }
}

function startGoogleSheetScheduler() {
  // Sync is a no-op (skipped entirely, not an error) when the service
  // account/sheet env vars haven't been configured yet, so this is safe to
  // always start.
  if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
    console.log("Google Sheet stock sync not configured — skipping scheduler.");
    return;
  }

  const intervalMinutes = Number(process.env.GOOGLE_SHEETS_SYNC_INTERVAL_MINUTES) || 60;

  // A plain interval avoids cron's minute-field range limit (0-59), which
  // a "*/N" expression silently breaks for any N >= 60 (e.g. hourly).
  setInterval(runSync, intervalMinutes * 60 * 1000);
  console.log(`Google Sheet stock sync scheduler started — every ${intervalMinutes} minute(s) ⏰`);

  // Run once on boot too, instead of waiting for the first interval tick.
  runSync();
}

module.exports = { startGoogleSheetScheduler };
