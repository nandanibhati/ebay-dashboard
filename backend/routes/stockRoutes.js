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
    // Parent stock create
    if (req.body.isParent) {
      const stock = new Stock(req.body);

      await stock.save();

      return res.json({
        success: true,
        stock,
      });
    }

    // Child SKU add
    const parent = await Stock.findOne({
      parentSku: req.body.parentSku,
      isParent: true,
    });

    if (!parent) {
      return res.status(400).json({
        success: false,
        message: "Parent SKU not found",
      });
    }

    const qty = Number(req.body.quantity);

    if (parent.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Parent Stock",
      });
    }

    parent.quantity -= qty;
    await parent.save();

    const stock = new Stock({
      ...req.body,
      isParent: false,
    });

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