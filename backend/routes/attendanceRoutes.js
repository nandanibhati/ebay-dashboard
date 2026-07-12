const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");
const { protect } = require("../middleware/auth");

router.use(protect);

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
    if (attendance.punchOut) {
  return res.status(400).json({
    success: false,
    message: "Already Punched Out Today",
  });
}

    attendance.punchOut =
      new Date().toLocaleTimeString();

    const punchInDate = new Date(
      `${today} ${attendance.punchIn}`
    );

    const punchOutDate = new Date();

    const breakMs = (attendance.breaks || []).reduce((sum, b) => {
      if (!b.start || !b.end) return sum;
      return sum + (new Date(`${today} ${b.end}`) - new Date(`${today} ${b.start}`));
    }, 0);

    const totalHours =
      ((punchOutDate - punchInDate) - breakMs) /
      (1000 * 60 * 60);

    attendance.totalHours =
      Math.max(0, totalHours).toFixed(2);

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

// Start Break
router.post("/break-start", async (req, res) => {
  try {
    const { employeeEmail } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      employeeEmail,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "Punch in first",
      });
    }

    if (attendance.punchOut) {
      return res.status(400).json({
        success: false,
        message: "Already punched out for today",
      });
    }

    if (attendance.onBreak) {
      return res.status(400).json({
        success: false,
        message: "Already on a break",
      });
    }

    attendance.breaks.push({ start: new Date().toLocaleTimeString() });
    attendance.onBreak = true;

    await attendance.save();

    res.json({
      success: true,
      message: "Break Started",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// End Break
router.post("/break-end", async (req, res) => {
  try {
    const { employeeEmail } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      employeeEmail,
      date: today,
    });

    if (!attendance || !attendance.onBreak) {
      return res.status(400).json({
        success: false,
        message: "No active break found",
      });
    }

    const openBreak = [...attendance.breaks].reverse().find((b) => !b.end);
    if (openBreak) {
      openBreak.end = new Date().toLocaleTimeString();
    }
    attendance.onBreak = false;

    await attendance.save();

    res.json({
      success: true,
      message: "Break Ended",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Today's attendance status for one employee (drives the punch/break buttons)
router.get("/today/:email", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      employeeEmail: req.params.email,
      date: today,
    });

    res.json({
      success: true,
      attendance: attendance || null,
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