const express = require("express");
const router = express.Router();

const Subscription = require("../models/Subscription");

// GET ALL
router.get("/", async (req, res) => {
  try {
    const subscriptions =
      await Subscription.find().sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const subscription =
      await Subscription.create(req.body);

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const subscription =
      await Subscription.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Subscription.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: "Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;