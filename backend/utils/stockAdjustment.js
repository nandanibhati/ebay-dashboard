const Stock = require("../models/Stock");

// Statuses that mean the stock never actually left / should be put back.
const RESTOCKED_STATUSES = ["Cancelled", "Returned"];

// direction -1 deducts stock (order sold), +1 restocks it (order cancelled/returned)
async function adjustStockForOrder(sku, quantity, direction = -1) {
  if (!sku) return;

  const item = await Stock.findOne({ sku: sku.trim() });

  if (!item) return;

  const masterStock = await Stock.findOne({
    sku: (item.masterSku || "").trim(),
  });

  if (!masterStock) return;

  const amount = Number(item.packQty) * Number(quantity);

  masterStock.quantity = Number(masterStock.quantity) + amount * direction;

  await masterStock.save();
}

module.exports = { adjustStockForOrder, RESTOCKED_STATUSES };
