const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      default: "",
    },

    user: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    // =====================
    // Sender
    // =====================

    senderName: {
      type: String,
      required: true,
    },

    senderEmail: {
      type: String,
      required: true,
    },

    senderRole: {
      type: String,
      default: "employee",
    },

    // =====================
    // Receiver
    // =====================

    receiverName: {
      type: String,
      default: "",
    },

    receiverEmail: {
      type: String,
      default: "",
    },

    // =====================
    // Chat Type
    // =====================

    chatType: {
      type: String,
      enum: ["group", "private"],
      default: "group",
    },

    // =====================
    // Message
    // =====================

    message: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    file: {
      type: String,
      default: "",
    },

    voice: {
      type: String,
      default: "",
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },
        // =====================
    // Edited
    // =====================

    edited: {
      type: Boolean,
      default: false,
    },

    // =====================
    // Seen By
    // =====================

    seenBy: [
      {
        type: String,
      },
    ],

    // =====================
    // Emoji Reactions
    // =====================

    reactions: {
      type: [reactionSchema],
      default: [],
    },

    // =====================
    // Optional Features
    // =====================

    pinned: {
      type: Boolean,
      default: false,
    },

    deletedForEveryone: {
      type: Boolean,
      default: false,
    },

    deletedFor: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Chat",
  chatSchema
);