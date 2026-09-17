const mongoose = require("mongoose");

// Single-document collection - one Google Sheet is the stock source of
// truth, so there's nothing to key sync state by (same pattern as
// BackmarketSync).
const googleSheetSyncSchema = new mongoose.Schema(
  {
    lastSync: { type: Date, default: null },
    lastError: { type: String, default: "" },
    rowsRead: { type: Number, default: 0 },
    created: { type: Number, default: 0 },
    updated: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoogleSheetSync", googleSheetSyncSchema);
