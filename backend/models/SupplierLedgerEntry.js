const mongoose = require("mongoose");

// One row in a supplier's running account. A supplier's due balance is
// Invoices − Returns − Payments.
const supplierLedgerEntrySchema = new mongoose.Schema(
  {
    supplier: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Invoice", "Payment", "Return"],
      required: true,
    },

    // YYYY-MM-DD, same as other date fields in this app.
    date: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Invoice number, payment reference, or returned device / IMEI.
    reference: { type: String, default: "", trim: true },

    notes: { type: String, default: "" },

    // Devices on an invoice, one row per phone (filled by the invoice
    // reader, shown under the entry and in the Devices view).
    devices: {
      type: [
        {
          _id: false,
          model: { type: String, default: "", trim: true },
          imei: { type: String, default: "", trim: true },
          price: { type: Number, default: null },
        },
      ],
      default: [],
    },

    file: { type: String, default: "" },
    fileName: { type: String, default: "" },

    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SupplierLedgerEntry",
  supplierLedgerEntrySchema
);
