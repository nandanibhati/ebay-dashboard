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