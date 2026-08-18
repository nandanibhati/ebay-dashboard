const Order = require("../models/Order");
const BackmarketSync = require("../models/BackmarketSync");
const { fetchBackmarketOrders } = require("./backmarketOrderService");
const {
  adjustStockForOrder,
  RESTOCKED_STATUSES,
} = require("../utils/stockAdjustment");

const DEFAULT_LOOKBACK_DAYS = 30;

// Backmarket orderline.state codes (confirmed against live API responses):
// 0/1 = new/awaiting validation, 2 = accepted/preparing, 3 = shipped,
// 4 = cancelled, 5 = refunded before shipping, 6 = refunded after shipping.
function mapStatus(orderlineState) {
  switch (orderlineState) {
    case 3:
      return "Shipped";
    case 2:
      return "Expecting";
    case 4:
    case 5:
      return "Cancelled";
    case 6:
      return "Returned";
    default:
      return "Pending";
  }
}

function computeFinancials({
  quantity,
  costPrice,
  sellingPrice,
  ebayFee,
  adFee,
  deliveryCost,
}) {
  const revenue = sellingPrice;
  const totalCost = quantity * costPrice + ebayFee + adFee + deliveryCost;
  const profit = revenue - totalCost;
  const margin =
    revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;

  return { revenue, profit, margin };
}

// New orderlines become new Order rows; existing ones only have their
// status refreshed so manually-entered cost/fee data is never overwritten.
async function upsertOrderline(bmOrder, orderline, orderId, status) {
  const existing = await Order.findOne({ orderId });

  if (!existing) {
    const quantity = Number(orderline.quantity || 1);
    const sellingPrice = Number(orderline.price || 0);
    const ebayFee = Number(orderline.orderline_fee || 0);
    const costPrice = 0;
    const adFee = 0;
    const deliveryCost = Number(orderline.shipping_price || 0);

    const { revenue, profit, margin } = computeFinancials({
      quantity,
      costPrice,
      sellingPrice,
      ebayFee,
      adFee,
      deliveryCost,
    });

    await Order.create({
      site: "Backmarket",
      date: orderline.date_creation || bmOrder.date_creation,
      orderId,
      sku: orderline.listing || "",
      product: orderline.product || "",
      employeeName: "Automated",
      quantity,
      costPrice,
      sellingPrice,
      ebayFee,
      adFee,
      deliveryCost,
      revenue,
      profit,
      margin,
      status,
      trackingNo: bmOrder.tracking_number || "",
      notes: bmOrder.shipping_address?.first_name
        ? `Buyer: ${bmOrder.shipping_address.first_name} ${bmOrder.shipping_address.last_name || ""}`.trim()
        : "",
    });

    await adjustStockForOrder(orderline.listing, quantity, -1);

    return "created";
  }

  if (existing.status !== status) {
    const wasRestocked = RESTOCKED_STATUSES.includes(existing.status);
    const isRestocked = RESTOCKED_STATUSES.includes(status);

    existing.status = status;
    if (bmOrder.tracking_number) existing.trackingNo = bmOrder.tracking_number;
    await existing.save();

    if (!wasRestocked && isRestocked) {
      await adjustStockForOrder(existing.sku, existing.quantity, 1);
    } else if (wasRestocked && !isRestocked) {
      await adjustStockForOrder(existing.sku, existing.quantity, -1);
    }

    return "updated";
  }

  return "unchanged";
}

async function syncBackmarketOrders() {
  let sync = await BackmarketSync.findOne();
  if (!sync) sync = await BackmarketSync.create({});

  const since =
    sync.lastSync ||
    new Date(Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const bmOrders = await fetchBackmarketOrders(since);

  let created = 0;
  let updated = 0;

  for (const bmOrder of bmOrders) {
    const orderlines = bmOrder.orderlines || [];

    for (let i = 0; i < orderlines.length; i++) {
      const orderline = orderlines[i];
      const orderId =
        orderlines.length > 1
          ? `${bmOrder.order_id}-${i + 1}`
          : String(bmOrder.order_id);

      const status = mapStatus(orderline.state);

      const result = await upsertOrderline(bmOrder, orderline, orderId, status);

      if (result === "created") created++;
      if (result === "updated") updated++;
    }
  }

  sync.lastSync = new Date();
  sync.totalOrders = await Order.countDocuments({ site: "Backmarket" });
  sync.lastError = "";
  await sync.save();

  return { created, updated, fetched: bmOrders.length };
}

module.exports = { syncBackmarketOrders };
