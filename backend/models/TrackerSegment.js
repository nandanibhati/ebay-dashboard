const mongoose = require("mongoose");

// A stretch of continuous active or idle time reported by the desktop
// tracker. Adjacent segments of the same kind are merged on write, so a
// normal workday is a handful of documents per employee, not one per
// minute. Segments never overlap and never cross business midnight (see
// trackerRoutes.js).
const trackerSegmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    name: { type: String, default: "" },

    // Business (Asia/Kolkata) date, YYYY-MM-DD.
    date: { type: String, required: true },

    start: { type: Date, required: true },
    end: { type: Date, required: true },

    state: { type: String, enum: ["active", "idle"], required: true },

    // Idle time the employee said was work (a call, a meeting). Counted as
    // active, but kept distinguishable.
    markedAsWork: { type: Boolean, default: false },
  },
  { timestamps: true }
);

trackerSegmentSchema.index({ user: 1, start: 1 });
trackerSegmentSchema.index({ date: 1, email: 1 });

module.exports = mongoose.model("TrackerSegment", trackerSegmentSchema);
