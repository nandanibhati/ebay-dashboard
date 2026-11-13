const mongoose = require("mongoose");

// One physical device received from a vendor, identified by the IMEI or
// serial scanned off it (see routes/scanRoutes.js).
const deviceSchema = new mongoose.Schema(
  {
    imei: { type: String, required: true, unique: true, trim: true },

    sku: { type: String, default: "", trim: true },
    product: { type: String, default: "" },

    vendor: { type: String, required: true },
    // YYYY-MM-DD, the day it was received.
    receivedDate: { type: String, required: true },
    cost: { type: Number, default: 0, min: 0 },

    batch: { type: mongoose.Schema.Types.ObjectId, ref: "ScanBatch", required: true },
    scannedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

deviceSchema.index({ batch: 1, createdAt: -1 });
deviceSchema.index({ vendor: 1, receivedDate: -1 });

module.exports = mongoose.model("Device", deviceSchema);
