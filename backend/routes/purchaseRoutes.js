const express = require("express");
const router = express.Router();

const Purchase = require("../models/Purchase");
const Stock = require("../models/Stock");

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
// UPDATE PURCHASE STATUS
router.put("/:id/status", async (req, res) => {
  try {
    const purchase = await Purchase.findById(
      req.params.id
    );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    const oldStatus = purchase.status;

    purchase.status = req.body.status;

    await purchase.save();

    // Only update stock when status changes to Delivered
    if (
      oldStatus !== "Delivered" &&
      req.body.status === "Delivered"
    ) {
      let stock = await Stock.findOne({
        sku: purchase.sku,
      });

      const unitCost =
        Number(purchase.cost || 0) /
        Number(purchase.quantity || 1);

      if (stock) {
        stock.quantity =
          Number(stock.quantity || 0) +
          Number(purchase.quantity || 0);

        stock.price = unitCost;

        await stock.save();
      } else {
        await Stock.create({
  sku: purchase.sku,
  product: purchase.product,
  quantity: purchase.quantity,
  price: unitCost,
});
      
      }
    }

    res.json({
      success: true,
      message: "Status Updated",
      purchase,
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