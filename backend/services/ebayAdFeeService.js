const axios = require("axios");

const ebayConfig = require("../config/ebayConfig");
const EbayAdFee = require("../models/EbayAdFee");
const Order = require("../models/Order");
const {
  refreshAccessToken,
  isTokenExpired,
  FINANCES_SCOPE,
} = require("./ebayOAuthService");

// Promoted Listings ad fees aren't part of eBay's order data — they're
// separate charges in the Finances API (what Seller Hub → Payments shows),
// each tagged with the order number. This reads them, stores each charge
// once, and writes the total onto the matching order rows so profit and
// margin include it.

const DAY_MS = 24 * 60 * 60 * 1000;
// First run goes back this far (roughly what eBay keeps for this view).
const FIRST_RUN_LOOKBACK_DAYS = 90;
// Later runs re-read a few days before the last run: eBay can post an ad
// fee hours after the sale, and re-reading is harmless (deduped by id).
const OVERLAP_DAYS = 3;
// Ask eBay for at most this many days per request.
const WINDOW_DAYS = 30;
const PAGE_LIMIT = 200;

class NeedsReconnectError extends Error {}

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// eBay names the Promoted Listings fee "AD_FEE"; accept close variants.
function isAdFeeType(feeType) {
  return /(^|_)ADS?_FEES?($|_)|PROMOTED/i.test(String(feeType || ""));
}

// A token that can read Finances. Uses its own refresh so a store that was
// connected before this scope existed only loses ad fees, not order sync.
async function getFinancesToken(store, refresh = refreshAccessToken) {
  if (!store.refreshToken) {
    throw new Error("Store is not connected to eBay.");
  }

  if (store.financesAccessToken && !isTokenExpired(store.financesExpiresAt)) {
    return store.financesAccessToken;
  }

  let token;
  try {
    token = await refresh(store.refreshToken, [FINANCES_SCOPE]);
  } catch (err) {
    const code = err.response?.data?.error;
    if (code === "invalid_scope" || code === "invalid_grant") {
      throw new NeedsReconnectError(
        "Reconnect this store once so the dashboard can read ad fees."
      );
    }
    throw err;
  }

  store.financesAccessToken = token.access_token;
  // Refresh a minute early so a request never goes out with a dying token.
  store.financesExpiresAt = new Date(Date.now() + (token.expires_in - 60) * 1000);
  await store.save();

  return store.financesAccessToken;
}

// Turn one Finances API transaction into an EbayAdFee record, or null if
// it isn't an ad fee linked to an order.
function toAdFee(store, tx) {
  if (!isAdFeeType(tx.feeType)) return null;

  const refs = tx.references || [];
  const orderId = String(
    tx.orderId || refs.find((r) => r.referenceType === "ORDER_ID")?.referenceId || ""
  ).trim();
  // Cost-per-click (Promoted Listings Advanced) fees aren't tied to an
  // order, so they can't be put on one.
  if (!orderId || !tx.transactionId) return null;

  const itemId = String(
    refs.find((r) => r.referenceType === "ITEM_ID")?.referenceId || ""
  ).trim();

  const value = Math.abs(Number(tx.amount?.value || 0));
  const amount = tx.bookingEntry === "CREDIT" ? -value : value;

  return {
    transactionId: String(tx.transactionId),
    storeName: store.storeName,
    orderId,
    itemId,
    amount: round2(amount),
    currency: tx.amount?.currency || "GBP",
    feeType: String(tx.feeType || ""),
    transactionDate: tx.transactionDate ? new Date(tx.transactionDate) : null,
  };
}

// Every NON_SALE_CHARGE (ad fees live there) between `from` and `to`.
async function fetchChargeTransactions(token, from, to, http = axios) {
  const transactions = [];

  for (let start = from; start < to; ) {
    const end = new Date(Math.min(start.getTime() + WINDOW_DAYS * DAY_MS, to.getTime()));

    for (let offset = 0; ; offset += PAGE_LIMIT) {
      let res;
      try {
        res = await http.get(`${ebayConfig.financesApiUrl}/sell/finances/v1/transaction`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-EBAY-C-MARKETPLACE-ID": "EBAY_GB",
          },
          params: {
            filter: `transactionType:{NON_SALE_CHARGE},transactionDate:[${start.toISOString()}..${end.toISOString()}]`,
            limit: PAGE_LIMIT,
            offset,
          },
          timeout: 60 * 1000,
        });
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          throw new NeedsReconnectError(
            "eBay didn't allow reading ad fees. Reconnect this store once."
          );
        }
        throw err;
      }

      const batch = res.data?.transactions || [];
      transactions.push(...batch);

      const total = Number(res.data?.total ?? 0);
      if (batch.length < PAGE_LIMIT || offset + PAGE_LIMIT >= total) break;
    }

    start = end;
  }

  return transactions;
}

// Save fee records; returns the order numbers whose fees are new or changed.
async function saveAdFees(fees) {
  const changed = new Set();
  if (!fees.length) return changed;

  // Compare with what's stored ourselves: the overlap window re-reads the
  // same charges every run, and those must not count as changes (that
  // would overwrite a hand-typed ad fee on every sync).
  const existing = new Map(
    (
      await EbayAdFee.find(
        { transactionId: { $in: fees.map((f) => f.transactionId) } },
        { transactionId: 1, orderId: 1, itemId: 1, amount: 1 }
      ).lean()
    ).map((f) => [f.transactionId, f])
  );

  for (const fee of fees) {
    const old = existing.get(fee.transactionId);
    if (old && old.amount === fee.amount && old.orderId === fee.orderId && old.itemId === fee.itemId) {
      continue;
    }

    await EbayAdFee.updateOne(
      { transactionId: fee.transactionId },
      { $set: fee },
      { upsert: true }
    );
    changed.add(fee.orderId);
    if (old && old.orderId !== fee.orderId) changed.add(old.orderId);
  }

  return changed;
}

function recomputeFinancials(order) {
  const quantity = Number(order.quantity || 0);
  const revenue = Number(order.revenue ?? order.sellingPrice ?? 0);
  const totalCost =
    quantity * Number(order.costPrice || 0) +
    Number(order.ebayFee || 0) +
    Number(order.adFee || 0) +
    Number(order.deliveryCost || 0);
  const profit = round2(revenue - totalCost);

  order.profit = profit;
  order.margin = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;
}

// Work out each row's share of the order's ad fees. Single-item orders get
// the whole amount; multi-item orders match by listing number where known
// and split anything else by each row's share of the selling price.
function splitFees(rows, fees) {
  const shares = new Map(rows.map((r) => [String(r._id), 0]));

  if (rows.length === 1) {
    shares.set(String(rows[0]._id), round2(fees.reduce((s, f) => s + f.amount, 0)));
    return shares;
  }

  let unmatched = 0;
  for (const fee of fees) {
    const matches = fee.itemId ? rows.filter((r) => r.ebayItemId === fee.itemId) : [];
    if (matches.length === 1) {
      const key = String(matches[0]._id);
      shares.set(key, shares.get(key) + fee.amount);
    } else {
      unmatched += fee.amount;
    }
  }

  if (unmatched) {
    const totalValue = rows.reduce((s, r) => s + Number(r.sellingPrice || 0), 0);
    let given = 0;
    rows.forEach((r, i) => {
      const key = String(r._id);
      const part =
        i === rows.length - 1
          ? round2(unmatched - given)
          : round2(
              totalValue > 0
                ? (unmatched * Number(r.sellingPrice || 0)) / totalValue
                : unmatched / rows.length
            );
      given += part;
      shares.set(key, shares.get(key) + part);
    });
  }

  for (const [key, value] of shares) shares.set(key, round2(value));
  return shares;
}

// Re-total ad fees for these eBay order numbers and update their rows.
// eBay's figure replaces any hand-typed ad fee. Returns rows changed.
async function applyAdFeesToOrders(orderIds) {
  let updated = 0;

  for (const orderId of orderIds) {
    const fees = await EbayAdFee.find({ orderId }).lean();
    if (!fees.length) continue;

    const rows = await Order.find({
      $or: [
        { orderId },
        { orderId: { $regex: `^${escapeRegex(orderId)}-\\d+$` } },
      ],
    }).sort({ orderId: 1 });
    if (!rows.length) continue; // order not synced yet; applied when it is

    const shares = splitFees(rows, fees);

    for (const row of rows) {
      const adFee = shares.get(String(row._id)) || 0;
      if (Number(row.adFee || 0) === adFee && row.adFeeSource === "ebay") continue;

      row.adFee = adFee;
      row.adFeeSource = "ebay";
      recomputeFinancials(row);
      await row.save();
      updated++;
    }
  }

  return updated;
}

// Read new ad fees for one store and put them on its orders. `alsoApplyTo`
// is order numbers just created by the order sync, whose fees may have
// been read on an earlier run before the order itself existed.
// Never throws: problems are recorded on the store instead, so the order
// sync it runs after is never affected.
async function syncStoreAdFees(store, { alsoApplyTo = [], http = axios, refresh } = {}) {
  try {
    const token = await getFinancesToken(store, refresh);

    const to = new Date();
    const from = store.adFeeLastSync
      ? new Date(store.adFeeLastSync.getTime() - OVERLAP_DAYS * DAY_MS)
      : new Date(to.getTime() - FIRST_RUN_LOOKBACK_DAYS * DAY_MS);

    const transactions = await fetchChargeTransactions(token, from, to, http);
    const fees = transactions.map((tx) => toAdFee(store, tx)).filter(Boolean);
    const changed = await saveAdFees(fees);

    for (const id of alsoApplyTo) changed.add(id);
    const ordersUpdated = await applyAdFeesToOrders([...changed]);

    store.adFeeStatus = "ok";
    store.adFeeError = "";
    store.adFeeLastSync = to;
    await store.save();

    return { ok: true, feesRead: fees.length, ordersUpdated };
  } catch (err) {
    const needsReconnect = err instanceof NeedsReconnectError;
    const message = needsReconnect
      ? err.message
      : err.response?.data?.errors?.[0]?.message || err.message;

    console.log(`eBay ad fees (${store.storeName}):`, message);

    store.adFeeStatus = needsReconnect ? "needs-reconnect" : "error";
    store.adFeeError = message;
    if (needsReconnect) {
      store.financesAccessToken = "";
      store.financesExpiresAt = null;
    }
    try {
      await store.save();
    } catch (saveErr) {
      console.log(saveErr);
    }

    return { ok: false, needsReconnect, message };
  }
}

module.exports = {
  syncStoreAdFees,
  applyAdFeesToOrders,
  splitFees,
  toAdFee,
  isAdFeeType,
  getFinancesToken,
  NeedsReconnectError,
};
