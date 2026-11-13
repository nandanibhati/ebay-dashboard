const mongoose = require("mongoose");

// Active time spent in one app / window during one 10-minute bucket.
// The agent always sends a bucket's full total, so writes are idempotent
// upserts keyed on (user, bucket, app, title).
const trackerUsageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    name: { type: String, default: "" },

    // Business (Asia/Kolkata) date of the bucket, YYYY-MM-DD.
    date: { type: String, required: true },
    bucket: { type: Date, required: true },

    app: { type: String, required: true },
    title: { type: String, default: "" },
    // Website name guessed from a browser title (null for other apps).
    site: { type: String, default: null },

    seconds: { type: Number, required: true, min: 0, max: 600 },
  },
  { timestamps: true }
);

trackerUsageSchema.index({ user: 1, bucket: 1, app: 1, title: 1 }, { unique: true });
trackerUsageSchema.index({ date: 1, email: 1 });

module.exports = mongoose.model("TrackerUsage", trackerUsageSchema);
