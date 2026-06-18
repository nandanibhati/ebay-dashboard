const express = require("express");
const router = express.Router();

const Leave = require("../models/Leave");

// Apply Leave
router.post("/apply", async (req, res) => {
  try {
    const leave = new Leave(req.body);

    await leave.save();

    res.json({
      success: true,
      message: "Leave Applied Successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get All Leaves
router.get("/", async (req, res) => {
  try {
    const leaves = await Leave.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Approve Leave
router.put("/approve/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Leave Approved",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Reject Leave
router.put("/reject/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Leave Rejected",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;