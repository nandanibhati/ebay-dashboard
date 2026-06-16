const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    parentSku: {
      type: String,
      default: "",
    },
    sku: String,
    product: String,
    quantity: Number,
    minimumStock: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stock", stockSchema);