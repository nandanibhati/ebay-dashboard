const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Stock = require("../models/Stock");

router.post("/", async (req, res) => {
  console.log("POST ROUTE HIT");
  try {
    const existingOrder = await Order.findOne({
  orderId: req.body.orderId,
});

if (existingOrder) {
  return res.status(400).json({
    success: false,
    message: "Order ID already exists",
  });
}
    const quantity = Number(req.body.quantity || 0);
const costPrice = Number(req.body.costPrice || 0);
const sellingPrice = Number(req.body.sellingPrice || 0);
const ebayFee = Number(req.body.ebayFee || 0);
const adFee = Number(req.body.adFee || 0);
const deliveryCost = Number(req.body.deliveryCost || 0);

const revenue = sellingPrice;

const totalCost =
  quantity * costPrice +
  ebayFee +
  adFee +
  deliveryCost;

const profit = revenue - totalCost;

const margin =
  revenue > 0
    ? Number(
        ((profit / revenue) * 100).toFixed(2)
      )
    : 0;

const order = new Order({
  ...req.body,
  revenue,
  profit,
  margin,
});

    await order.save();
const item = await Stock.findOne({
  sku: req.body.sku,
});

console.log("ORDER SKU:", req.body.sku);
console.log("ORDER QTY:", req.body.quantity);
console.log("FOUND ITEM:", item);
if (item) {
  console.log("ITEM MASTER SKU:", item.masterSku);
  console.log("ITEM PACK QTY:", item.packQty);

  const masterStock = await Stock.findOne({
    sku: item.masterSku,
  });

  console.log("MASTER STOCK FOUND:", masterStock);
}

if (item) {
  const masterStock = await Stock.findOne({
    sku: item.masterSku,
  });
  console.log("REQ BODY =", req.body);
console.log("SKU RECEIVED =", req.body.sku);
console.log("ITEM FOUND =", item);

  if (masterStock) {
    const totalDeduct =
      Number(item.packQty) *
      Number(req.body.quantity);

    masterStock.quantity =
      Number(masterStock.quantity) -
      totalDeduct;

    console.log(
      "MASTER SKU:",
      item.masterSku
    );

    console.log(
      "DEDUCTED:",
      totalDeduct
    );

    console.log(
      "NEW STOCK:",
      masterStock.quantity
    );

    await masterStock.save();
  }
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
      const item = await Stock.findOne({
        sku: order.sku,
      });

      if (item) {
        const masterStock = await Stock.findOne({
          sku: item.masterSku,
        });

        if (masterStock) {
          const totalDeduct =
            Number(item.packQty) *
            Number(order.quantity);

          masterStock.quantity =
            Number(masterStock.quantity) -
            totalDeduct;

          await masterStock.save();
        }
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
    const orders = await Order.find().sort({
  date: -1,
   createdAt: -1,
});

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
  const quantity = Number(req.body.quantity || 0);
const costPrice = Number(req.body.costPrice || 0);
const sellingPrice = Number(req.body.sellingPrice || 0);
const ebayFee = Number(req.body.ebayFee || 0);
const adFee = Number(req.body.adFee || 0);
const deliveryCost = Number(req.body.deliveryCost || 0);

const revenue = sellingPrice;

const totalCost =
  quantity * costPrice +
  ebayFee +
  adFee +
  deliveryCost;

const profit = revenue - totalCost;

const margin =
  revenue > 0
    ? Number(
        ((profit / revenue) * 100).toFixed(2)
      )
    : 0;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        revenue,
        profit,
        margin,
      },
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