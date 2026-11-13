const mongoose = require("mongoose");

// Single-document collection - Backmarket has one direct API token per
// seller account, unlike eBay's multi-store setup, so there's nothing to
// key sync state by.
const backmarketSyncSchema = new mongoose.Schema(
  {
    lastSync: { type: Date, default: null },
    lastError: { type: String, default: "" },
    totalOrders: { type: Number, default: 0 },
    // Sync used to filter by creation date, so status changes on older
    // orders were missed. A one-time catch-up refreshes them.
    modificationBackfillDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BackmarketSync", backmarketSyncSchema);
