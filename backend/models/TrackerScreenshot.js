const mongoose = require("mongoose");

const trackerScreenshotSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    name: { type: String, default: "" },

    // Business (Asia/Kolkata) date, YYYY-MM-DD.
    date: { type: String, required: true },
    takenAt: { type: Date, required: true },

    // Which monitor, for multi-screen setups.
    screenIndex: { type: Number, default: 0 },

    // App and window in front when it was taken.
    app: { type: String, default: "" },
    title: { type: String, default: "" },

    url: { type: String, required: true },
    // Cloudinary public_id, so old screenshots can be deleted.
    publicId: { type: String, default: "" },
  },
  { timestamps: true }
);

trackerScreenshotSchema.index({ email: 1, date: 1, takenAt: 1 });
trackerScreenshotSchema.index({ takenAt: 1 });

module.exports = mongoose.model("TrackerScreenshot", trackerScreenshotSchema);
