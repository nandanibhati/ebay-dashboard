const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    site: String,
    date: String,

   orderId: {
  type: String,
  unique: true,
  required: true,
},
    employeeId: String,

    employeeName: String,
    employeeEmail: String,

    sku: String,
    product: String,

    quantity: Number,

    costPrice: Number,
    sellingPrice: Number,

    ebayFee: Number,
    adFee: Number,
    deliveryCost: Number,

    revenue: Number,
    profit: Number,
    margin: Number,

    trackingNo: String,
    status: String,
    courierScanned: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);