const mongoose = require("mongoose");

// One document per employee: what their desktop tracker last reported.
// Drives the live Active / Idle / Offline board.
const trackerStatusSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, default: "" },

    state: { type: String, enum: ["active", "idle", "stopped"], default: "stopped" },
    lastSeenAt: { type: Date, default: null },
    sessionStartedAt: { type: Date, default: null },

    // What's in front right now (while active).
    currentApp: { type: String, default: "" },
    currentTitle: { type: String, default: "" },
    currentSite: { type: String, default: null },

    device: {
      os: { type: String, default: "" },
      hostname: { type: String, default: "" },
      appVersion: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrackerStatus", trackerStatusSchema);
