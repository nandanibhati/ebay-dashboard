const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    assignedBy: {
      type: String,
      required: true,
    },

    assignedTo: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Todo",
        "In Progress",
        "Done",
        "Closed",
      ],
      default: "Todo",
    },

    startDate: String,

    dueDate: String,

    progress: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Task",
  taskSchema
);