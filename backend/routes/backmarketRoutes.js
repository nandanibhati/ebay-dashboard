const express = require("express");
const router = express.Router();

const BackmarketSync = require("../models/BackmarketSync");
const { protect, adminOnly } = require("../middleware/auth");
const { syncBackmarketOrders } = require("../services/backmarketOrderSyncService");

// =========================================
// GET SYNC STATUS (any logged-in user)
// =========================================

router.get("/status", protect, async (req, res) => {
  try {
    const sync = await BackmarketSync.findOne();

    res.json({
      success: true,
      sync: sync || { lastSync: null, totalOrders: 0, lastError: "" },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =========================================
// SYNC ORDERS (admin only)
// =========================================

router.post("/sync", protect, adminOnly, async (req, res) => {
  try {
    const result = await syncBackmarketOrders();

    res.json({
      success: true,
      message: `Backmarket: ${result.created} new order(s), ${result.updated} updated.`,
      ...result,
    });
  } catch (err) {
    const message =
      err.response?.data?.detail || err.response?.data || err.message;

    console.log("Backmarket sync failed:", message);

    try {
      let sync = await BackmarketSync.findOne();
      if (!sync) sync = await BackmarketSync.create({});
      sync.lastError = typeof message === "string" ? message : JSON.stringify(message);
      await sync.save();
    } catch (saveErr) {
      console.log(saveErr);
    }

    res.status(500).json({
      success: false,
      message: typeof message === "string" ? message : "Backmarket sync failed",
    });
  }
});

module.exports = router;
