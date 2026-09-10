const mongoose = require("mongoose");

// Singleton document (key: "app") holding the editable dropdown/filter
// option lists that used to be hardcoded across the frontend.
const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "app",
      unique: true,
    },

    orderSites: {
      type: [String],
      default: ["TPS", "SmartZone", "Veluntra", "Amazon", "TikTok", "Shopify", "Backmarket"],
    },

    orderStatuses: {
      type: [String],
      default: [
        "Pending",
        "Hold",
        "Packed",
        "Expecting",
        "Shipped",
        "Delivered",
        "Returned",
        "Cancelled",
        "Partial Refund",
      ],
    },

    taskPriorities: {
      type: [String],
      default: ["High", "Medium", "Low"],
    },

    taskGroups: {
      type: [String],
      default: [],
    },

    purchaseSuppliers: {
      type: [String],
      default: ["Temu", "AliExpress"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
