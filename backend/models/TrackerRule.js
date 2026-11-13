const mongoose = require("mongoose");

// Productivity label for apps/websites whose name contains `pattern`
// (case-insensitive). See utils/trackerApps.js classify().
const trackerRuleSchema = new mongoose.Schema(
  {
    pattern: { type: String, required: true, trim: true },
    // Lowercased copy, for uniqueness.
    key: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["productive", "neutral", "unproductive"],
      required: true,
    },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrackerRule", trackerRuleSchema);
