// One-off backfill: recompute revenue/profit/margin for manually-entered
// orders using the corrected formula (revenue = quantity * sellingPrice).
// Skips orders created by the eBay/Backmarket sync (employeeName ===
// "Automated") — their sellingPrice is already the marketplace's line-item
// total, not a per-unit price, so multiplying by quantity would be wrong.
//
// Usage:
//   node scripts/backfillOrderFinancials.js          (dry run — reports only)
//   node scripts/backfillOrderFinancials.js --apply  (writes the fix)

require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/Order");

const APPLY = process.argv.includes("--apply");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected. Mode: ${APPLY ? "APPLY (writing changes)" : "DRY RUN (no writes)"}`);

  const orders = await Order.find({ employeeName: { $ne: "Automated" } });
  console.log(`Scanning ${orders.length} manually-entered order(s)...`);

  let changed = 0;
  let unchanged = 0;

  for (const order of orders) {
    const quantity = Number(order.quantity || 0);
    const costPrice = Number(order.costPrice || 0);
    const sellingPrice = Number(order.sellingPrice || 0);
    const ebayFee = Number(order.ebayFee || 0);
    const adFee = Number(order.adFee || 0);
    const deliveryCost = Number(order.deliveryCost || 0);

    const correctRevenue = quantity * sellingPrice;
    const correctTotalCost = quantity * costPrice + ebayFee + adFee + deliveryCost;
    const correctProfit = correctRevenue - correctTotalCost;
    const correctMargin =
      correctRevenue > 0 ? Number(((correctProfit / correctRevenue) * 100).toFixed(2)) : 0;

    const oldRevenue = Number(order.revenue || 0);
    const oldProfit = Number(order.profit || 0);

    if (oldRevenue === correctRevenue && oldProfit === correctProfit) {
      unchanged++;
      continue;
    }

    changed++;
    console.log(
      `[${order.orderId}] qty=${quantity} revenue ${oldRevenue} -> ${correctRevenue}, profit ${oldProfit} -> ${correctProfit}`
    );

    if (APPLY) {
      order.revenue = correctRevenue;
      order.profit = correctProfit;
      order.margin = correctMargin;
      await order.save();
    }
  }

  console.log("---");
  console.log(`${changed} order(s) ${APPLY ? "updated" : "would be updated"}, ${unchanged} already correct.`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
