const mongoose = require("mongoose");

// One Promoted Listings ad fee charge (or credit) from eBay's Finances API.
// Kept per transaction so re-reading overlapping date ranges never counts a
// fee twice, and so an order's ad fee can be re-totalled at any time.
const ebayAdFeeSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    storeName: { type: String, required: true },
    // eBay order number (without our "-1", "-2" line item suffix).
    orderId: { type: String, required: true, index: true },
    // Listing the fee belongs to, used to split fees on multi-item orders.
    itemId: { type: String, default: "" },
    // Positive = charged to us, negative = credited back (e.g. after a return).
    amount: { type: Number, required: true },
    currency: { type: String, default: "GBP" },
    feeType: { type: String, default: "" },
    transactionDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EbayAdFee", ebayAdFeeSchema);
