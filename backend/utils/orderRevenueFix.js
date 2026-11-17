const Order = require("../models/Order");

// Orders created by the eBay/Backmarket sync ("Automated") store the whole
// line total in sellingPrice; hand-entered orders store a per-unit price.
function isLineTotalOrder(order) {
  return order?.employeeName === "Automated";
}

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// One-time repair, safe to run on every start: editing a synced order
// with quantity 2+ on the Orders page used to set revenue to
// quantity x line total, overstating revenue and profit. Puts revenue
// back to the line total and recalculates profit and margin.
async function fixAutomatedOrderRevenue() {
  try {
    const orders = await Order.find({
      employeeName: "Automated",
      quantity: { $gt: 1 },
      $expr: { $ne: ["$revenue", "$sellingPrice"] },
    });

    for (const order of orders) {
      const revenue = Number(order.sellingPrice || 0);
      const totalCost =
        Number(order.quantity || 0) * Number(order.costPrice || 0) +
        Number(order.ebayFee || 0) +
        Number(order.adFee || 0) +
        Number(order.deliveryCost || 0);
      const profit = round2(revenue - totalCost);

      order.revenue = revenue;
      order.profit = profit;
      order.margin = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;
      await order.save();
    }

    if (orders.length) {
      console.log(`Fixed revenue on ${orders.length} synced order(s) with quantity 2+.`);
    }
    return orders.length;
  } catch (err) {
    console.log("Order revenue fix failed:", err.message);
    return 0;
  }
}

module.exports = { isLineTotalOrder, fixAutomatedOrderRevenue };
