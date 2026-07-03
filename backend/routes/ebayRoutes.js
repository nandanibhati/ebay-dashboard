const express = require("express");
const router = express.Router();

const EbayStore = require("../models/EbayStore");
const {
  connectStore,
  callback,
} = require("../controllers/ebayController");
const {
  verification,
  receiveNotification,
} = require("../controllers/ebayNotificationController");

// =========================================
// GET ALL STORES
// =========================================

router.get("/stores", async (req, res) => {
  try {
    let stores = await EbayStore.find().sort({
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

      stores = await EbayStore.find().sort({
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

router.get("/store/:name", async (req, res) => {
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
// =========================================

router.get(
  "/connect/:storeName",
  connectStore
);

// =========================================
// EBAY OAUTH CALLBACK
// =========================================

router.get(
  "/callback",
  callback
);


// =========================================
// DISCONNECT STORE
// =========================================

router.post("/disconnect", async (req, res) => {
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
// SYNC STORE (Temporary)
// =========================================

router.post("/sync", async (req, res) => {
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

    store.lastSync = new Date();

    await store.save();

    res.json({
      success: true,
      message: `${storeName} synced successfully.`,
      lastSync: store.lastSync,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
// =========================================
// GET CONNECTION STATUS
// =========================================

router.get("/status", async (req, res) => {
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

router.delete("/reset/:name", async (req, res) => {
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
// EBAY NOTIFICATION VERIFICATION
// =========================================

router.get("/notifications", verification);

// =========================================
// EBAY MARKETPLACE NOTIFICATIONS
// =========================================

router.post("/notifications", receiveNotification);

// =========================================
// EXPORT ROUTER
// =========================================

module.exports = router;