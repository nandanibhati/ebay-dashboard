const mongoose = require("mongoose");

// A delivery from one vendor on one day, scanned in device by device. Its
// total cost is mirrored into the Supplier Ledger as an Invoice entry.
const scanBatchSchema = new mongoose.Schema(
  {
    vendor: { type: String, required: true },
    // YYYY-MM-DD
    date: { type: String, required: true },
    reference: { type: String, default: "", trim: true },

    status: { type: String, enum: ["open", "closed"], default: "open" },

    deviceCount: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },

    ledgerEntry: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierLedgerEntry", default: null },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScanBatch", scanBatchSchema);
