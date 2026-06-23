const express = require("express");
const router = express.Router();

const Purchase = require("../models/Purchase");


// GET ALL PURCHASES
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// CREATE PURCHASE
router.post("/", async (req, res) => {
  try {
    const purchase = await Purchase.create(req.body);

    res.status(201).json({
      success: true,
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// UPDATE PURCHASE
router.put("/:id", async (req, res) => {
  try {
    const purchase =
      await Purchase.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json({
      success: true,
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// DELETE PURCHASE
router.delete("/:id", async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: "Purchase Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;