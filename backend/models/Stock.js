const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    sku: { type: String, trim: true },

    product: String,

    quantity: Number,

    price: {
      type: Number,
      default: 0,
    },

    shipping: {
      type: Number,
      default: 0,
    },

    masterSku: {
      type: String,
      default: "",
      trim: true,
    },

    packQty: {
      type: Number,
      default: 1,
    },

    minimumStock: {
      type: Number,
      default: 5,
    },

    updatedBy: {
      type: String,
      default: "",
    },

    // Selling price pushed to eBay from the Stock page (separate from
    // `price`, which is the cost price used for profit).
    ebayPrice: {
      type: Number,
      default: null,
    },
    // Result of the last push: "ok", "partial", "error" or "no-listing".
    ebayPriceStatus: {
      state: { type: String, default: "" },
      message: { type: String, default: "" },
      at: { type: Date, default: null },
      by: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Stock",
  stockSchema
);