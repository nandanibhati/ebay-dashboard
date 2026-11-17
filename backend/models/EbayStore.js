const mongoose = require("mongoose");

const ebayStoreSchema = new mongoose.Schema(
  {
    // ==========================
    // Store Information
    // ==========================

    storeName: {
      type: String,
      required: true,
      unique: true,
    },

    marketplace: {
      type: String,
      default: "eBay UK",
    },

    sellerEmail: {
      type: String,
      default: "",
    },

    sellerUsername: {
      type: String,
      default: "",
    },

    // ==========================
    // Connection
    // ==========================

    connected: {
      type: Boolean,
      default: false,
    },

    connectionStatus: {
      type: String,
      enum: [
        "Disconnected",
        "Connected",
        "Expired",
      ],
      default: "Disconnected",
    },

    // ==========================
    // OAuth
    // ==========================

    accessToken: {
      type: String,
      default: "",
    },

    refreshToken: {
      type: String,
      default: "",
    },

    tokenType: {
      type: String,
      default: "",
    },

    expiresAt: {
      type: Date,
      default: null,
    },
        // ==========================
    // Sync Information
    // ==========================

    lastSync: {
      type: Date,
      default: null,
    },

    // Set after the first sync that asked eBay for orders *changed* since
    // a date (not just created), which re-checks older orders once.
    statusBackfillDone: {
      type: Boolean,
      default: false,
    },

    // When the local copy of active listings (EbayListing) was last
    // refreshed from eBay.
    listingsRefreshedAt: {
      type: Date,
      default: null,
    },

    // ==========================
    // Ad fees (Finances API)
    // ==========================

    // Separate short-lived token with only the sell.finances scope, so
    // stores connected before ad fees existed keep syncing orders.
    financesAccessToken: {
      type: String,
      default: "",
    },

    financesExpiresAt: {
      type: Date,
      default: null,
    },

    // "unknown" (not tried yet), "ok", "needs-reconnect" or "error".
    adFeeStatus: {
      type: String,
      default: "unknown",
    },

    adFeeLastSync: {
      type: Date,
      default: null,
    },

    adFeeError: {
      type: String,
      default: "",
    },

    autoSync: {
      type: Boolean,
      default: false,
    },

    syncInterval: {
      type: Number,
      default: 15, // minutes
    },

    // ==========================
    // Statistics
    // ==========================

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalProducts: {
      type: Number,
      default: 0,
    },

    // ==========================
    // Error Handling
    // ==========================

    lastError: {
      type: String,
      default: "",
    },

    // ==========================
    // Store Status
    // ==========================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EbayStore",
  ebayStoreSchema
);