const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    sku: String,

    product: String,

    quantity: Number,

    price: {
      type: Number,
      default: 0,
    },

    masterSku: {
      type: String,
      default: "",
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
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Stock",
  stockSchema
);