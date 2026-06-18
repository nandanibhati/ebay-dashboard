const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
    },

    employeeEmail: {
      type: String,
      required: true,
    },

    fromDate: {
      type: String,
      required: true,
    },

    toDate: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    leaveType: {
      type: String,
      enum: ["Full Day", "Half Day"],
      default: "Full Day",
    },

    leaveDays: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Leave",
  leaveSchema
);