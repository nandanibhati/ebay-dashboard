const mongoose = require("mongoose");

// Suppliers in the Supplier Ledger. Ledger entries reference a vendor by
// name, so renaming a vendor also renames its entries (see
// supplierLedgerRoutes.js).
const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    contactPerson: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
