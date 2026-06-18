const express = require("express");
const router = express.Router();

const Leave = require("../models/Leave");
const User = require("../models/User");

// Apply Leave
router.post("/apply", async (req, res) => {
  try {
    const leaveDays =
      req.body.leaveType === "Half Day"
        ? 0.5
        : 1;

    const leave = new Leave({
      employeeName: req.body.employeeName,
      employeeEmail: req.body.employeeEmail,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      reason: req.body.reason,
      leaveType: req.body.leaveType,
      leaveDays,
    });

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
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    if (leave.status === "Approved") {
      return res.json({
        success: true,
        message: "Already approved",
      });
    }

    const user = await User.findOne({
      email: leave.employeeEmail,
    });

    if (user) {
      user.monthlyLeaveBalance =
        Number(user.monthlyLeaveBalance || 0) -
        Number(leave.leaveDays || 0);

      await user.save();
    }

    leave.status = "Approved";
    await leave.save();

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