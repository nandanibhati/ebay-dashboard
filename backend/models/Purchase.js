const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    supplier: {
      type: String,
      enum: ["Temu", "AliExpress"],
      required: true,
    },

    product: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
    },

    cost: {
      type: Number,
      required: true,
    },

    purchaseDate: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },
    status: {
  type: String,
  default: "Pending",
},
purchaseCost: {
  type: Number,
  default: 0,
},
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Purchase",
  purchaseSchema
);