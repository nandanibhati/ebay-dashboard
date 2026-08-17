const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const { protect } = require("../middleware/auth");
const { adjustStockForOrder, RESTOCKED_STATUSES } = require("../utils/stockAdjustment");

router.use(protect);

router.post("/", async (req, res) => {
  try {
    const orderId = (req.body.orderId || "").trim();

    const existingOrder = await Order.findOne({ orderId });

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
      quantity * costPrice + ebayFee + adFee + deliveryCost;

    const profit = revenue - totalCost;

    const margin =
      revenue > 0
        ? Number(((profit / revenue) * 100).toFixed(2))
        : 0;

    const order = new Order({
      ...req.body,
      orderId,
      revenue,
      profit,
      margin,
    });

    await order.save();

    await adjustStockForOrder(req.body.sku, req.body.quantity, -1);

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
    const incomingOrders = (Array.isArray(req.body) ? req.body : []).map(
      (o) => ({ ...o, orderId: (o.orderId || "").trim() })
    );

    const existingIds = new Set(
      (
        await Order.find({
          orderId: {
            $in: incomingOrders.map((o) => o.orderId),
          },
        }).select("orderId")
      ).map((o) => o.orderId)
    );

    const newOrders = incomingOrders.filter(
      (o) => !existingIds.has(o.orderId)
    );

    if (newOrders.length > 0) {
      await Order.insertMany(newOrders);
    }

    for (const order of newOrders) {
      await adjustStockForOrder(order.sku, order.quantity, -1);
    }

    res.json({
      success: true,
      message: `${newOrders.length} order(s) imported, ${
        incomingOrders.length - newOrders.length
      } duplicate(s) skipped`,
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
    const orders = await Order.find()
      .sort({
        date: -1,
        createdAt: -1,
      })
      .lean();

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
    const existingOrder = await Order.findById(req.params.id);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
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
      quantity * costPrice + ebayFee + adFee + deliveryCost;

    const profit = revenue - totalCost;

    const margin =
      revenue > 0
        ? Number(((profit / revenue) * 100).toFixed(2))
        : 0;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(req.body.orderId !== undefined && {
          orderId: req.body.orderId.trim(),
        }),
        revenue,
        profit,
        margin,
      },
      { new: true }
    );

    // Stock was deducted when the order was first placed. If it's now being
    // cancelled/returned, that stock never actually left, so put it back —
    // and reverse that if it's un-cancelled later.
    const wasRestocked = RESTOCKED_STATUSES.includes(existingOrder.status);
    const isRestocked = RESTOCKED_STATUSES.includes(order.status);

    if (!wasRestocked && isRestocked) {
      await adjustStockForOrder(order.sku, order.quantity, 1);
    } else if (wasRestocked && !isRestocked) {
      await adjustStockForOrder(order.sku, order.quantity, -1);
    }

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
