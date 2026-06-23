const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    billingCycle: {
      type: String,
      enum: ["Monthly", "Yearly"],
      default: "Monthly",
    },

    renewalDate: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Subscription",
  subscriptionSchema
);