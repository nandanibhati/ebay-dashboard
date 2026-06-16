const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Stock = require("../models/Stock");

router.post("/", async (req, res) => {
  console.log("POST ROUTE HIT");
  try {
    const order = new Order(req.body);

    await order.save();
const stock = await Stock.findOne({
  sku: req.body.sku,
});

console.log("ORDER SKU:", req.body.sku);
console.log("ORDER QTY:", req.body.quantity);
console.log("FOUND STOCK:", stock);


if (stock) {
  stock.quantity =
    Number(stock.quantity) -
    Number(req.body.quantity);

  console.log(
    "NEW STOCK QTY:",
    stock.quantity
  );

  await stock.save();
}

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
router.post("/bulk", async (req, res) => {
  try {
    await Order.insertMany(req.body);

    for (const order of req.body) {
      const stock = await Stock.findOne({
        sku: order.sku,
      });

      if (stock) {
        stock.quantity =
          Number(stock.quantity) -
          Number(order.quantity);

        await stock.save();
      }
    }

    res.json({
      success: true,
      message: "Orders Imported",
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