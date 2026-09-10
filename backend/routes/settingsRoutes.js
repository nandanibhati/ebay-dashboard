const express = require("express");
const router = express.Router();

const Settings = require("../models/Settings");
const { protect, adminOnly } = require("../middleware/auth");

// Order statuses that stock-restocking logic (utils/stockAdjustment.js)
// keys off of directly — never let them be removed from the list.
const REQUIRED_ORDER_STATUSES = ["Cancelled", "Returned"];

router.use(protect);

async function getOrCreateSettings() {
  let settings = await Settings.findOne({ key: "app" });
  if (!settings) {
    settings = await Settings.create({ key: "app" });
  }
  return settings;
}

// GET SETTINGS — every logged-in user needs these to populate dropdowns.
router.get("/", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE SETTINGS — admin only.
router.put("/", adminOnly, async (req, res) => {
  try {
    const updateData = {};

    ["orderSites", "orderStatuses", "taskPriorities", "taskGroups", "purchaseSuppliers"].forEach(
      (key) => {
        if (Array.isArray(req.body[key])) {
          updateData[key] = req.body[key]
            .map((v) => String(v).trim())
            .filter(Boolean);
        }
      }
    );

    if (updateData.orderStatuses) {
      REQUIRED_ORDER_STATUSES.forEach((status) => {
        if (!updateData.orderStatuses.includes(status)) {
          updateData.orderStatuses.push(status);
        }
      });
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "app" },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Settings Updated",
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
