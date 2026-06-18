const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");

// Punch In
router.post("/punch-in", async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      employeeEmail,
    } = req.body;

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const existingAttendance =
      await Attendance.findOne({
        employeeEmail,
        date: today,
      });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Already Punched In Today",
      });
    }

    const attendance = new Attendance({
      employeeId,
      employeeName,
      employeeEmail,
      date: today,
      punchIn: new Date().toLocaleTimeString(),
    });

    await attendance.save();

    res.json({
      success: true,
      message: "Punch In Successful",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Punch Out
router.post("/punch-out", async (req, res) => {
  try {
    const { employeeEmail } = req.body;

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const attendance =
      await Attendance.findOne({
        employeeEmail,
        date: today,
      });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "No Punch In Found",
      });
    }

    attendance.punchOut =
      new Date().toLocaleTimeString();

    const punchInDate = new Date(
      `${today} ${attendance.punchIn}`
    );

    const punchOutDate = new Date();

    const totalHours =
      (punchOutDate - punchInDate) /
      (1000 * 60 * 60);

    attendance.totalHours =
      totalHours.toFixed(2);

    await attendance.save();

    res.json({
      success: true,
      message: "Punch Out Successful",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Attendance
router.get("/", async (req, res) => {
  try {
    const attendance =
      await Attendance.find().sort({
        createdAt: -1,
      });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;