const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: String,
    employeeId: String,
    sku: String,
    product: String,
    category: String,
    quantity: Number,
    costPrice: Number,
    sellingPrice: Number,
    ebayFee: Number,
    adFee: Number,
    deliveryCost: Number,
    revenue: Number,
    profit: Number,
    margin: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);