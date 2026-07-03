const EbayStore = require("../models/EbayStore");

const {
  getAuthorizationUrl,
  getAccessToken,
} = require("../services/ebayOAuthService");

// ========================================
// CONNECT STORE
// ========================================

exports.connectStore = async (
  req,
  res
) => {
  try {
    const { storeName } = req.params;

    const store =
      await EbayStore.findOne({
        storeName,
      });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const authUrl =
      getAuthorizationUrl(
        store.storeName
      );

    return res.redirect(authUrl);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// OAUTH CALLBACK (START)
// ========================================

exports.callback = async (
  req,
  res
) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message:
          "Authorization code missing.",
      });
    }

    const token =
      await getAccessToken(code);
          const store = await EbayStore.findOne({
      storeName: state,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    // ==============================
    // Save OAuth Tokens
    // ==============================

    store.connected = true;

    store.connectionStatus = "Connected";

    store.accessToken =
      token.access_token;

    store.refreshToken =
      token.refresh_token;

    store.tokenType =
      token.token_type;

    store.expiresAt = new Date(
      Date.now() +
        token.expires_in * 1000
    );

    store.lastSync = new Date();

    store.lastError = "";

    await store.save();
      return res.redirect(
  "https://YOUR-FRONTEND-DOMAIN/ebay-integration?success=true"
);
  } catch (err) {
    console.log(
      err.response?.data || err.message
    );

   return res.redirect(
  "https://YOUR-FRONTEND-DOMAIN/ebay-integration?success=false"
);
  }
};