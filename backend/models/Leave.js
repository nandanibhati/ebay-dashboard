const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeName: String,
    employeeEmail: String,

    fromDate: String,
    toDate: String,

    reason: String,

    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Leave",
  leaveSchema
);const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeName: String,
    employeeEmail: String,

    fromDate: String,
    toDate: String,

    reason: String,

    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Leave",
  leaveSchema
);