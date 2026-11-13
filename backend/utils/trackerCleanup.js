const cron = require("node-cron");
const cloudinary = require("../config/cloudinary");
const TrackerScreenshot = require("../models/TrackerScreenshot");
const TrackerUsage = require("../models/TrackerUsage");

// Screenshots add up fast (one per employee every ~10 minutes), so delete
// them from Cloudinary and the database after a retention period.
// App usage holds window titles (can be personal), so it's dropped after
// its own, longer period. Activity segments are tiny and are kept.
const RETENTION_DAYS = Number(process.env.TRACKER_SCREENSHOT_RETENTION_DAYS) || 30;
const USAGE_RETENTION_DAYS = Number(process.env.TRACKER_USAGE_RETENTION_DAYS) || 90;

async function deleteOldUsage() {
  const cutoff = new Date(Date.now() - USAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await TrackerUsage.deleteMany({ bucket: { $lt: cutoff } });
}

async function deleteOldScreenshots() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  // Batches of 100 — Cloudinary's delete_resources limit.
  for (;;) {
    const batch = await TrackerScreenshot.find({ takenAt: { $lt: cutoff } })
      .select("publicId")
      .limit(100);
    if (batch.length === 0) break;

    const publicIds = batch.map((s) => s.publicId).filter(Boolean);
    if (publicIds.length) {
      await cloudinary.api.delete_resources(publicIds);
    }

    await TrackerScreenshot.deleteMany({ _id: { $in: batch.map((s) => s._id) } });
  }
}

function startTrackerCleanup() {
  cron.schedule(
    "30 3 * * *",
    () => {
      deleteOldScreenshots().catch((error) => {
        console.log("Tracker screenshot cleanup error:", error.message);
      });
      deleteOldUsage().catch((error) => {
        console.log("Tracker usage cleanup error:", error.message);
      });
    },
    { timezone: "Asia/Kolkata" }
  );
}

module.exports = { startTrackerCleanup, deleteOldScreenshots, deleteOldUsage };
