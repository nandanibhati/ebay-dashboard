const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: String,
    employeeName: String,
    employeeEmail: String,

    date: String,

    punchIn: String,
    punchOut: String,

    totalHours: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);