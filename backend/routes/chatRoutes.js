const express = require("express");
const router = express.Router();

const Chat = require("../models/Chat");

// ==========================
// GET GROUP CHAT
// ==========================

router.get("/group", async (req, res) => {
  try {
    const chats = await Chat.find({
      chatType: "group",
    }).sort({
      createdAt: 1,
    });

    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================
// GET PRIVATE CHAT
// ==========================

router.get(
  "/private/:me/:user",
  async (req, res) => {
    try {
      const { me, user } = req.params;

      const chats = await Chat.find({
        chatType: "private",
        $or: [
          {
            senderEmail: me,
            receiverEmail: user,
          },
          {
            senderEmail: user,
            receiverEmail: me,
          },
        ],
      }).sort({
        createdAt: 1,
      });

      res.json({
        success: true,
        chats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ==========================
// SEND MESSAGE
// ==========================

router.post("/send", async (req, res) => {
  try {
    const chat = await Chat.create({
      senderName: req.body.senderName,
      senderEmail: req.body.senderEmail,
      senderRole: req.body.senderRole,

      receiverName:
        req.body.receiverName,

      receiverEmail:
        req.body.receiverEmail,

      chatType: req.body.chatType,

      message: req.body.message,

      image: req.body.image,

      file: req.body.file,

      voice: req.body.voice,

      replyTo: req.body.replyTo,

      reactions: [],

      seenBy: [],
    });

    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// ==========================
// DELETE MESSAGE
// ==========================

router.delete("/:id", async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Message Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================
// EDIT MESSAGE
// ==========================

router.put("/:id", async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      {
        message: req.body.message,
        edited: true,
      },
      { new: true }
    );

    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================
// SEEN MESSAGE
// ==========================

router.put("/seen/:id", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat.seenBy.includes(req.body.email)) {
      chat.seenBy.push(req.body.email);
    }

    await chat.save();

    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================
// ADD REACTION
// ==========================

router.put("/reaction/:id", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    chat.reactions.push({
      emoji: req.body.emoji,
      user: req.body.user,
    });

    await chat.save();

    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// ==========================
// GET SINGLE MESSAGE
// (Optional - Future Use)
// ==========================

router.get("/:id", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================
// CLEAR CHAT
// (Optional)
// ==========================

router.delete("/clear/all", async (req, res) => {
  try {
    await Chat.deleteMany({});

    res.json({
      success: true,
      message: "All chats deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================
// EXPORT ROUTER
// ==========================

module.exports = router;