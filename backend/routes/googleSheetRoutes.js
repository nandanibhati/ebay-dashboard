const express = require("express");
const router = express.Router();

const GoogleSheetSync = require("../models/GoogleSheetSync");
const { protect } = require("../middleware/auth");

// =========================================
// GET SYNC STATUS (any logged-in user)
// Sync itself only runs on a schedule (see utils/googleSheetScheduler.js) —
// this just reports the last run so the Stock page can show it.
// =========================================

router.get("/status", protect, async (req, res) => {
  try {
    const sync = await GoogleSheetSync.findOne();

    res.json({
      success: true,
      sync: sync || { lastSync: null, lastError: "", rowsRead: 0, created: 0, updated: 0, skipped: 0 },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
