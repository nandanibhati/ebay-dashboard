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

    // Fixed text of this vendor's invoice layout (headings, labels, terms),
    // remembered from saved invoices so the invoice reader can recognise
    // invoices that don't print the vendor's name as text. Newest last.
    invoiceLayouts: { type: [[String]], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
