const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: String,
    employeeName: String,
    employeeEmail: String,

    date: String,

    punchIn: String,
    punchOut: String,

    // Real timestamps (unambiguous instants) used for duration math.
    // punchIn/punchOut above are pretty display strings only — re-parsing
    // a formatted time string is timezone-fragile, so hours worked must be
    // computed from these instead.
    punchInAt: Date,
    punchOutAt: Date,

    breaks: [
      {
        start: String,
        end: String,
        startAt: Date,
        endAt: Date,
      },
    ],
    onBreak: {
      type: Boolean,
      default: false,
    },

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