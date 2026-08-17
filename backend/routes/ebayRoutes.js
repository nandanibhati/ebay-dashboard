const express = require("express");
const router = express.Router();

const EbayStore = require("../models/EbayStore");
const { protect, adminOnly } = require("../middleware/auth");
const {
  connectStore,
  callback,
} = require("../controllers/ebayController");
const {
  verification,
  receiveNotification,
} = require("../controllers/ebayNotificationController");
const { syncStoreOrders } = require("../services/ebayOrderSyncService");

const HIDDEN_FIELDS = "-accessToken -refreshToken -tokenType";

// =========================================
// GET ALL STORES
// =========================================

router.get("/stores", protect, adminOnly, async (req, res) => {
  try {
    let stores = await EbayStore.find()
      .select(HIDDEN_FIELDS)
      .sort({
        createdAt: 1,
      });

    if (stores.length === 0) {
      await EbayStore.insertMany([
        {
          storeName: "TPS",
          marketplace: "eBay UK",
        },
        {
          storeName: "SmartZone",
          marketplace: "eBay UK",
        },
      ]);

      stores = await EbayStore.find()
        .select(HIDDEN_FIELDS)
        .sort({
          createdAt: 1,
        });
    }

    res.json({
      success: true,
      stores,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =========================================
// GET SINGLE STORE
// =========================================

router.get("/store/:name", protect, adminOnly, async (req, res) => {
  try {
    const store = await EbayStore.findOne({
      storeName: req.params.name,
    }).select(HIDDEN_FIELDS);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.json({
      success: true,
      store,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
// =========================================
// CONNECT STORE (OAuth)
// Triggered by a full browser navigation, so the token travels
// as a query param (?token=) instead of an Authorization header.
// =========================================

router.get(
  "/connect/:storeName",
  protect,
  adminOnly,
  connectStore
);

// =========================================
// EBAY OAUTH CALLBACK
// eBay's servers hit this directly, not a logged-in browser session,
// so it can't require our own JWT here.
// =========================================

router.get(
  "/callback",
  callback
);


// =========================================
// DISCONNECT STORE
// =========================================

router.post("/disconnect", protect, adminOnly, async (req, res) => {
  try {
    const { storeName } = req.body;

    const store = await EbayStore.findOne({
      storeName,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    store.connected = false;
    store.connectionStatus = "Disconnected";

    store.accessToken = "";
    store.refreshToken = "";
    store.tokenType = "";
    store.expiresAt = null;

    await store.save();

    res.json({
      success: true,
      message: `${storeName} disconnected successfully.`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =========================================
// SYNC STORE ORDERS (pulls orders from eBay's Fulfillment API)
// =========================================

router.post("/sync", protect, adminOnly, async (req, res) => {
  const { storeName } = req.body;

  try {
    const store = await EbayStore.findOne({
      storeName,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (!store.connected) {
      return res.status(400).json({
        success: false,
        message: "Store is not connected to eBay.",
      });
    }

    const result = await syncStoreOrders(store);

    res.json({
      success: true,
      message: `${storeName}: ${result.created} new order(s), ${result.updated} updated.`,
      lastSync: store.lastSync,
      ...result,
    });
  } catch (err) {
    const message =
      err.response?.data?.errors?.[0]?.message || err.message;

    console.log("eBay sync failed:", message);

    try {
      const store = await EbayStore.findOne({ storeName });

      if (store) {
        store.lastError = message;

        if (err.response?.status === 401) {
          store.connectionStatus = "Expired";
        }

        await store.save();
      }
    } catch (saveErr) {
      console.log(saveErr);
    }

    res.status(500).json({
      success: false,
      message,
    });
  }
});
// =========================================
// GET CONNECTION STATUS
// =========================================

router.get("/status", protect, adminOnly, async (req, res) => {
  try {
    const stores = await EbayStore.find(
      {},
      {
        storeName: 1,
        connected: 1,
        connectionStatus: 1,
        lastSync: 1,
      }
    );

    res.json({
      success: true,
      stores,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =========================================
// RESET STORE (Development)
// =========================================

router.delete("/reset/:name", protect, adminOnly, async (req, res) => {
  try {
    const store = await EbayStore.findOne({
      storeName: req.params.name,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    store.connected = false;
    store.connectionStatus = "Disconnected";
    store.accessToken = "";
    store.refreshToken = "";
    store.tokenType = "";
    store.expiresAt = null;
    store.lastSync = null;
    store.totalOrders = 0;
    store.totalProducts = 0;
    store.lastError = "";

    await store.save();

    res.json({
      success: true,
      message: `${store.storeName} reset successfully.`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =========================================
// EBAY NOTIFICATION VERIFICATION (public - called by eBay)
// =========================================

router.get("/notifications", verification);

// =========================================
// EBAY MARKETPLACE NOTIFICATIONS (public - called by eBay)
// =========================================

router.post("/notifications", receiveNotification);

// =========================================
// EXPORT ROUTER
// =========================================

module.exports = router;
