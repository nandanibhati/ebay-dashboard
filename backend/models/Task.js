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
    screenshot: {
  type: String,
  default: "",
},

    progress: {
      type: Number,
      default: 0,
    },

    group: {
      type: String,
      default: "",
    },

    etcMinutes: {
      type: Number,
      default: 0,
    },

    atcMinutes: {
      type: Number,
      default: 0,
    },

    l1: { type: String, default: "" },
    l2: { type: String, default: "" },
    trainingLink: { type: String, default: "" },
    videoLink: { type: String, default: "" },
    formLink: { type: String, default: "" },
    formReportLink: { type: String, default: "" },
    checklistLink: { type: String, default: "" },

    sourceAutomatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutomatedTask",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Task",
  taskSchema
);