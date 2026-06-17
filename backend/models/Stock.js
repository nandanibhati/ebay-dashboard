const mongoose = require("mongoose");
const stockSchema = new mongoose.Schema(
  {
    sku: String,
    product: String,
    quantity: Number,

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

module.exports = mongoose.model("Stock", stockSchema);