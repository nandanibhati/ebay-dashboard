const mongoose = require("mongoose");

const automatedTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    group: { type: String, default: "" },

    assignedBy: {
      type: String,
      required: true,
    },

    // Each name gets its own copy of the generated task. Older documents
    // stored a single string, which Mongoose casts to a one-item array.
    assignedTo: {
      type: [String],
      validate: {
        validator: (names) => names.length > 0,
        message: "At least one assignee is required",
      },
    },

    priority: {
      type: String,
      default: "Medium",
    },

    etcMinutes: {
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

    image: {
      type: String,
      default: "",
    },

    time: {
      type: String,
      required: true,
    },

    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
      required: true,
    },

    weekday: {
      type: Number,
      min: 0,
      max: 6,
      default: null,
    },

    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },

    lastGeneratedDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AutomatedTask",
  automatedTaskSchema
);
