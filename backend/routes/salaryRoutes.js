const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");
const User = require("../models/User");

router.get("/:email", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.params.email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const now = new Date();
    const currentMonth =
      String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = String(now.getFullYear());

    const attendance = await Attendance.find({
      employeeEmail: req.params.email,
    });

    const monthlyAttendance = attendance.filter(
      (item) => {
        const [year, month] = item.date.split("-");
        return (
          month === currentMonth &&
          year === currentYear
        );
      }
    );

    const totalHours = monthlyAttendance.reduce(
      (sum, item) =>
        sum + Number(item.totalHours || 0),
      0
    );

    const hourlyRate =
  Number(user.basicSalary || 0) /
  (8 * 6 * 4.33);

const salary =
  totalHours * hourlyRate;

    res.json({
  success: true,
  employee: user.name,
  basicSalary: user.basicSalary || 0,
  totalHours: totalHours.toFixed(2),
  salary: salary.toFixed(2),
});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;