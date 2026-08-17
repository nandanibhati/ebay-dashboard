const Order = require("../models/Order");
const Stock = require("../models/Stock");
const { fetchEbayOrders } = require("./ebayOrderService");
const {
  adjustStockForOrder,
  RESTOCKED_STATUSES,
} = require("../utils/stockAdjustment");

const DEFAULT_LOOKBACK_DAYS = 30;

function mapStatus(ebayOrder) {
  if (ebayOrder.cancelStatus?.cancelState === "CANCELED") {
    return "Cancelled";
  }

  const refunds = ebayOrder.paymentSummary?.refunds || [];
  const refundedTotal = refunds.reduce(
    (sum, r) => sum + Number(r.amount?.value || 0),
    0
  );
  const orderTotal = Number(ebayOrder.pricingSummary?.total?.value || 0);

  if (refundedTotal > 0 && orderTotal > 0) {
    return refundedTotal >= orderTotal ? "Returned" : "Partial Refund";
  }

  if (ebayOrder.orderFulfillmentStatus === "FULFILLED") {
    return "Shipped";
  }

  return "Pending";
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

// New line items become new Order rows; existing ones only have their
// status refreshed so manually-entered cost/fee data is never overwritten.
async function upsertLineItem(store, ebayOrder, lineItem, orderId, status, deliveryCost, ebayFee) {
  const existing = await Order.findOne({ orderId });

  if (!existing) {
    const quantity = Number(lineItem.quantity || 1);
    const sellingPrice = Number(
      lineItem.total?.value ?? lineItem.lineItemCost?.value ?? 0
    );

    // eBay doesn't tell us our purchase cost, but if this SKU is already in
    // Stock we know what we paid for it - use that instead of leaving 0.
    const sku = (lineItem.sku || "").trim();
    const stockItem = sku ? await Stock.findOne({ sku }) : null;
    const costPrice = Number(stockItem?.price || 0);

    const adFee = 0;

    const { revenue, profit, margin } = computeFinancials({
      quantity,
      costPrice,
      sellingPrice,
      ebayFee,
      adFee,
      deliveryCost,
    });

    await Order.create({
      site: store.storeName,
      date: ebayOrder.creationDate,
      orderId,
      sku,
      product: lineItem.title || "",
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
      notes: ebayOrder.buyer?.username
        ? `Buyer: ${ebayOrder.buyer.username}`
        : "",
    });

    await adjustStockForOrder(sku, quantity, -1);

    return "created";
  }

  if (existing.status !== status) {
    const wasRestocked = RESTOCKED_STATUSES.includes(existing.status);
    const isRestocked = RESTOCKED_STATUSES.includes(status);

    existing.status = status;
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

async function syncStoreOrders(store) {
  const since =
    store.lastSync ||
    new Date(Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const ebayOrders = await fetchEbayOrders(store, since);

  let created = 0;
  let updated = 0;

  for (const ebayOrder of ebayOrders) {
    const lineItems = ebayOrder.lineItems || [];
    const status = mapStatus(ebayOrder);

    const deliveryCostTotal = Number(
      ebayOrder.pricingSummary?.deliveryCost?.value || 0
    );
    const perItemDelivery = lineItems.length
      ? Number((deliveryCostTotal / lineItems.length).toFixed(2))
      : 0;

    // eBay's marketplace fee is a % of item price, so split it by each line
    // item's share of the order total rather than splitting it evenly.
    const totalFee = Number(ebayOrder.totalMarketplaceFee?.value || 0);
    const orderTotal = Number(ebayOrder.pricingSummary?.total?.value || 0);

    for (let i = 0; i < lineItems.length; i++) {
      const orderId =
        lineItems.length > 1
          ? `${ebayOrder.orderId}-${i + 1}`
          : ebayOrder.orderId;

      const itemValue = Number(
        lineItems[i].total?.value ?? lineItems[i].lineItemCost?.value ?? 0
      );
      const perItemFee =
        totalFee > 0 && orderTotal > 0
          ? Number(((itemValue / orderTotal) * totalFee).toFixed(2))
          : 0;

      const result = await upsertLineItem(
        store,
        ebayOrder,
        lineItems[i],
        orderId,
        status,
        perItemDelivery,
        perItemFee
      );

      if (result === "created") created++;
      if (result === "updated") updated++;
    }
  }

  store.lastSync = new Date();
  store.totalOrders = await Order.countDocuments({ site: store.storeName });
  store.lastError = "";

  await store.save();

  return { created, updated, fetched: ebayOrders.length };
}

module.exports = { syncStoreOrders };
