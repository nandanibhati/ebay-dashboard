const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "General",
    },

    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
