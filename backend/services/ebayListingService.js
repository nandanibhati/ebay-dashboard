const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");

const ebayConfig = require("../config/ebayConfig");
const EbayStore = require("../models/EbayStore");
const EbayListing = require("../models/EbayListing");
const { getValidAccessToken } = require("./ebayOrderService");

// Reads active eBay listings and updates their prices by SKU, using eBay's
// Trading API (works for listings created in Seller Hub / on ebay.co.uk,
// which the Inventory REST API can't change). Authenticates with the
// store's existing OAuth token, so stores don't need reconnecting.

const SITE_ID_UK = "3";
const COMPATIBILITY_LEVEL = "1349";
// eBay's listing cache is refreshed if older than this before a price push.
const LISTINGS_MAX_AGE_MS = 30 * 60 * 1000;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Keep everything as text: SKUs like "00123" and long ItemIDs must not
  // be turned into numbers.
  parseTagValue: false,
  isArray: (name) => ["Item", "Variation", "Errors", "InventoryStatus", "NameValueList"].includes(name),
});

const xmlEscape = (s) =>
  String(s ?? "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

class EbayApiError extends Error {}

// One Trading API call. Returns the parsed response body (e.g. the
// <GetSellerListResponse> element). Throws EbayApiError on Failure.
async function callTrading(store, callName, innerXml, http = axios) {
  const token = await getValidAccessToken(store);
  const body = `<?xml version="1.0" encoding="utf-8"?>
<${callName}Request xmlns="urn:ebay:apis:eBLBaseComponents">
  <ErrorLanguage>en_GB</ErrorLanguage>
  <WarningLevel>High</WarningLevel>
${innerXml}
</${callName}Request>`;

  const res = await http.post(`${ebayConfig.apiUrl}/ws/api.dll`, body, {
    headers: {
      "Content-Type": "text/xml",
      "X-EBAY-API-CALL-NAME": callName,
      "X-EBAY-API-SITEID": SITE_ID_UK,
      "X-EBAY-API-COMPATIBILITY-LEVEL": COMPATIBILITY_LEVEL,
      "X-EBAY-API-IAF-TOKEN": token,
    },
    timeout: 60 * 1000,
    responseType: "text",
    transformResponse: (data) => data,
    validateStatus: () => true,
  });

  const parsed = parser.parse(String(res.data || ""));
  const response = parsed[`${callName}Response`];
  if (!response) {
    throw new EbayApiError(`eBay returned an unexpected response (HTTP ${res.status}).`);
  }

  const errors = (response.Errors || []).filter((e) => e.SeverityCode === "Error");
  if (response.Ack === "Failure" || errors.length) {
    const message = errors.map((e) => e.LongMessage || e.ShortMessage).filter(Boolean).join(" ") || "eBay rejected the request.";
    throw new EbayApiError(message);
  }
  return response;
}

const toNumber = (v) => {
  const n = Number(typeof v === "object" && v !== null ? v["#text"] : v);
  return Number.isFinite(n) ? n : null;
};

// Flatten one eBay <Item> into listing rows (one per variation if any).
function itemToRows(item) {
  const base = {
    itemId: String(item.ItemID || ""),
    title: String(item.Title || ""),
    url: String(item.ListingDetails?.ViewItemURL || ""),
  };
  const variations = item.Variations?.Variation || [];
  if (variations.length) {
    return variations.map((v) => ({
      ...base,
      sku: String(v.SKU || "").trim(),
      isVariation: true,
      price: toNumber(v.StartPrice),
      currency: v.StartPrice?.["@_currencyID"] || "GBP",
      quantity: toNumber(v.Quantity) !== null ? toNumber(v.Quantity) - (toNumber(v.SellingStatus?.QuantitySold) || 0) : null,
    }));
  }
  const price = toNumber(item.SellingStatus?.CurrentPrice) ?? toNumber(item.StartPrice);
  return [
    {
      ...base,
      sku: String(item.SKU || "").trim(),
      isVariation: false,
      price,
      currency: item.SellingStatus?.CurrentPrice?.["@_currencyID"] || item.StartPrice?.["@_currencyID"] || "GBP",
      quantity: toNumber(item.Quantity) !== null ? toNumber(item.Quantity) - (toNumber(item.SellingStatus?.QuantitySold) || 0) : null,
    },
  ];
}

// All active listings of a store (GetSellerList, 200 per page).
async function fetchActiveListings(store, http) {
  const now = new Date();
  // GTC listings end within ~30 days and renew; 119 days covers everything.
  const to = new Date(now.getTime() + 119 * 24 * 60 * 60 * 1000);
  const rows = [];

  for (let page = 1; page <= 50; page++) {
    const response = await callTrading(
      store,
      "GetSellerList",
      `  <DetailLevel>ReturnAll</DetailLevel>
  <IncludeVariations>true</IncludeVariations>
  <EndTimeFrom>${now.toISOString()}</EndTimeFrom>
  <EndTimeTo>${to.toISOString()}</EndTimeTo>
  <Pagination><EntriesPerPage>200</EntriesPerPage><PageNumber>${page}</PageNumber></Pagination>
  <OutputSelector>ItemID</OutputSelector>
  <OutputSelector>SKU</OutputSelector>
  <OutputSelector>Title</OutputSelector>
  <OutputSelector>StartPrice</OutputSelector>
  <OutputSelector>Quantity</OutputSelector>
  <OutputSelector>SellingStatus</OutputSelector>
  <OutputSelector>Variations</OutputSelector>
  <OutputSelector>ListingDetails</OutputSelector>
  <OutputSelector>HasMoreItems</OutputSelector>`,
      http
    );

    const items = response.ItemArray?.Item || [];
    for (const item of items) {
      const status = item.SellingStatus?.ListingStatus;
      if (status && status !== "Active") continue;
      rows.push(...itemToRows(item));
    }
    if (String(response.HasMoreItems) !== "true" || items.length === 0) break;
  }
  return rows;
}

// Replace the local copy of a store's listings with what eBay has now.
async function refreshStoreListings(store, http) {
  const rows = await fetchActiveListings(store, http);
  const seenAt = new Date();

  if (rows.length) {
    await EbayListing.bulkWrite(
      rows.map((row) => ({
        updateOne: {
          filter: { store: store._id, itemId: row.itemId, sku: row.sku },
          update: { $set: { ...row, store: store._id, storeName: store.storeName, lastSeenAt: seenAt } },
          upsert: true,
        },
      })),
      { ordered: false }
    );
  }
  // Ended/removed listings.
  await EbayListing.deleteMany({ store: store._id, lastSeenAt: { $lt: seenAt } });

  store.listingsRefreshedAt = seenAt;
  store.totalProducts = new Set(rows.map((r) => r.itemId)).size;
  await store.save();
  return rows.length;
}

async function refreshAllListings({ maxAgeMs = 0, http } = {}) {
  const stores = await EbayStore.find({ connected: true });
  const results = [];
  for (const store of stores) {
    const fresh = store.listingsRefreshedAt && Date.now() - store.listingsRefreshedAt.getTime() < maxAgeMs;
    if (fresh) continue;
    try {
      results.push({ store: store.storeName, listings: await refreshStoreListings(store, http) });
    } catch (error) {
      results.push({ store: store.storeName, error: error.message });
    }
  }
  return results;
}

// Change the price of every active listing (and variation) with this SKU,
// across all connected stores. Returns one result per listing.
async function updatePriceForSku(sku, price, { http } = {}) {
  const cleanSku = String(sku || "").trim();
  const amount = Math.round(Number(price) * 100) / 100;
  if (!cleanSku) throw new EbayApiError("This stock item has no SKU.");
  if (!(amount > 0)) throw new EbayApiError("Enter a price above £0.");

  await refreshAllListings({ maxAgeMs: LISTINGS_MAX_AGE_MS, http });
  const listings = await EbayListing.find({ sku: cleanSku });
  const stores = new Map((await EbayStore.find({ connected: true })).map((s) => [String(s._id), s]));

  const results = [];
  for (const listing of listings) {
    const store = stores.get(String(listing.store));
    if (!store) continue;
    try {
      await callTrading(
        store,
        "ReviseInventoryStatus",
        `  <InventoryStatus>
    <ItemID>${xmlEscape(listing.itemId)}</ItemID>${listing.isVariation ? `\n    <SKU>${xmlEscape(listing.sku)}</SKU>` : ""}
    <StartPrice>${amount.toFixed(2)}</StartPrice>
  </InventoryStatus>`,
        http
      );
      const oldPrice = listing.price;
      listing.price = amount;
      await listing.save();
      results.push({ ok: true, store: store.storeName, itemId: listing.itemId, title: listing.title, oldPrice, newPrice: amount });
    } catch (error) {
      results.push({ ok: false, store: store.storeName, itemId: listing.itemId, title: listing.title, error: error.message });
    }
  }
  return results;
}

module.exports = {
  callTrading,
  itemToRows,
  fetchActiveListings,
  refreshStoreListings,
  refreshAllListings,
  updatePriceForSku,
  EbayApiError,
  LISTINGS_MAX_AGE_MS,
};
