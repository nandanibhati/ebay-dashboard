const mongoose = require("mongoose");

// A local copy of the sellers' active eBay listings, keyed by SKU, so a
// price change on the Stock page knows which listings to update. One row per
// listing, or per variation for multi-variation listings. Refreshed from
// eBay by services/ebayListingService.js.
const ebayListingSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "EbayStore", required: true },
    storeName: { type: String, default: "" },

    itemId: { type: String, required: true },
    // The listing's SKU (Custom label), or the variation's SKU.
    sku: { type: String, default: "", trim: true },
    isVariation: { type: Boolean, default: false },

    title: { type: String, default: "" },
    price: { type: Number, default: null },
    currency: { type: String, default: "GBP" },
    quantity: { type: Number, default: null },
    url: { type: String, default: "" },

    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ebayListingSchema.index({ store: 1, itemId: 1, sku: 1 }, { unique: true });
ebayListingSchema.index({ sku: 1 });

module.exports = mongoose.model("EbayListing", ebayListingSchema);
