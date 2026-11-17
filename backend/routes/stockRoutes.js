
const express = require("express");
const router = express.Router();

const Stock = require("../models/Stock");
const User = require("../models/User");
const EbayListing = require("../models/EbayListing");
const { protect, managerOrAdmin } = require("../middleware/auth");
const {
  refreshAllListings,
  updatePriceForSku,
  EbayApiError,
  LISTINGS_MAX_AGE_MS,
} = require("../services/ebayListingService");

router.use(protect);

// =========================================
// eBay selling prices
// =========================================

// Live eBay listings grouped by SKU, for the Stock page's eBay Price column.
// ?refresh=1 forces a fresh read from eBay; otherwise the local copy is
// refreshed only if older than 30 minutes.
router.get("/ebay-listings", managerOrAdmin, async (req, res) => {
  try {
    const refresh = await refreshAllListings({ maxAgeMs: req.query.refresh ? 0 : LISTINGS_MAX_AGE_MS });
    const listings = await EbayListing.find({ sku: { $ne: "" } })
      .select("sku storeName itemId isVariation title price currency quantity url")
      .lean();

    const bySku = {};
    for (const l of listings) (bySku[l.sku] = bySku[l.sku] || []).push(l);

    res.json({
      success: true,
      bySku,
      errors: refresh.filter((r) => r.error).map((r) => `${r.store}: ${r.error}`),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Push a new selling price to every eBay listing with this item's SKU.
// A change of more than 50% vs the live eBay price needs `confirm: true`,
// to catch typos like £31 instead of £310.
router.post("/:id/ebay-price", managerOrAdmin, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ success: false, message: "Stock item not found" });

    const price = Math.round(Number(req.body.price) * 100) / 100;
    if (!(price > 0)) return res.status(400).json({ success: false, message: "Enter a price above £0." });
    if (!stock.sku) return res.status(400).json({ success: false, message: "This stock item has no SKU." });

    if (req.body.confirm !== true) {
      const live = await EbayListing.find({ sku: stock.sku.trim() }).select("price").lean();
      const prices = live.map((l) => l.price).filter((p) => p > 0);
      const big = prices.find((p) => Math.abs(price - p) / p > 0.5);
      if (big) {
        return res.status(409).json({
          success: false,
          needsConfirm: true,
          message: `£${price.toFixed(2)} is very different from the current eBay price (£${big.toFixed(2)}). Update anyway?`,
        });
      }
    }

    const results = await updatePriceForSku(stock.sku, price);
    const okCount = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok);

    const user = await User.findById(req.user.id).select("name");
    stock.ebayPrice = price;
    stock.ebayPriceStatus = {
      state: results.length === 0 ? "no-listing" : failed.length === 0 ? "ok" : okCount ? "partial" : "error",
      message:
        results.length === 0
          ? "No active eBay listing has this SKU."
          : failed.length
            ? failed.map((f) => `${f.store} #${f.itemId}: ${f.error}`).join(" · ").slice(0, 500)
            : `Updated ${okCount} listing${okCount === 1 ? "" : "s"}.`,
      at: new Date(),
      by: user?.name || "",
    };
    await stock.save();

    res.json({ success: failed.length === 0 && results.length > 0, stock, results });
  } catch (error) {
    const status = error instanceof EbayApiError ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
});


// Get All Stock
router.get("/", async (req, res) => {
  try {
    const stock = await Stock.find();

    res.json(stock);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// Add Stock
router.post("/", async (req, res) => {
  try {
    const stock = new Stock(req.body);

    await stock.save();

    res.json({
      success: true,
      stock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.get("/sku/:sku", async (req, res) => {
  try {
    const stock = await Stock.findOne({
      sku: req.params.sku,
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
      });
    }

    res.json(stock);
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
});
//delete stock
router.delete("/:id", async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Stock Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// Update Stock
router.put("/:id", async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      stock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;