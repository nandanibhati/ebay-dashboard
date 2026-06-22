
const express = require("express");
const router = express.Router();

const Stock = require("../models/Stock");


// Get All Stock
router.get("/", async (req, res) => {
  try {
    const stock = await Stock.find();

    res.json(stock);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// Add Stock
router.post("/", async (req, res) => {
  try {
    const stock = new Stock(req.body);

    await stock.save();

    res.json({
      success: true,
      stock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.get("/sku/:sku", async (req, res) => {
  try {
    const stock = await Stock.findOne({
      sku: req.params.sku,
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
      });
    }

    res.json(stock);
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
});
//delete stock
router.delete("/:id", async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Stock Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// Update Stock
router.put("/:id", async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      stock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;