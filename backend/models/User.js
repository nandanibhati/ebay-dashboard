const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },

    joiningDate: {
      type: Date,
    },

    monthlyHours: {
  type: Number,
  default: 0,
},
    basicSalary: {
  type: Number,
  default: 0,
},
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "User",
  userSchema
);