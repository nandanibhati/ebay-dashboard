const express = require("express");
const router = express.Router();

const Order = require("../models/Order");

router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order Saved",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Order Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;