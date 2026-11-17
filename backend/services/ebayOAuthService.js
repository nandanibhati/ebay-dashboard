const axios = require("axios");

const ebayConfig = require("../config/ebayConfig");

const FINANCES_SCOPE = "https://api.ebay.com/oauth/api_scope/sell.finances";
exports.FINANCES_SCOPE = FINANCES_SCOPE;

// ========================================
// Generate eBay Login URL
// ========================================

exports.getAuthorizationUrl = (
  storeName
) => {
  const scopes = [
    "https://api.ebay.com/oauth/api_scope",
    "https://api.ebay.com/oauth/api_scope/sell.inventory",
    "https://api.ebay.com/oauth/api_scope/sell.account",
    "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
    "https://api.ebay.com/oauth/api_scope/sell.marketing",
    "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
    // Ad fees per order come from the Finances API.
    FINANCES_SCOPE,
  ];

  const params = new URLSearchParams({
    client_id: ebayConfig.clientId,

    redirect_uri:
      ebayConfig.redirectUri,

    response_type: "code",

    scope: scopes.join(" "),

    state: storeName,
  });

  return `${ebayConfig.authUrl}?${params.toString()}`;
};

// ========================================
// Exchange Code → Access Token
// ========================================

exports.getAccessToken =
  async (code) => {
    try {
      const body =
        new URLSearchParams();

      body.append(
        "grant_type",
        "authorization_code"
      );

      body.append("code", code);

      body.append(
        "redirect_uri",
        ebayConfig.redirectUri
      );

      const auth = Buffer.from(
        `${ebayConfig.clientId}:${ebayConfig.clientSecret}`
      ).toString("base64");

      const response =
        await axios.post(
          ebayConfig.tokenUrl,
          body,
          {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
          }
        );

      return response.data;
    } catch (err) {
      console.log(err.response?.data);

      throw err;
    }
  };
  // ========================================
// Refresh Access Token
// ========================================

// `scopes` defaults to the scopes every store has had since it was first
// connected. Asking for a scope the store never granted (e.g. sell.finances
// on an older connection) makes eBay refuse the whole refresh, so newer
// scopes are only ever requested on their own (see ebayAdFeeService).
exports.refreshAccessToken = async (
  refreshToken,
  scopes
) => {
  try {
    const body = new URLSearchParams();

    body.append(
      "grant_type",
      "refresh_token"
    );

    body.append(
      "refresh_token",
      refreshToken
    );

    body.append(
      "scope",
      scopes ? scopes.join(" ") : [
        "https://api.ebay.com/oauth/api_scope",
        "https://api.ebay.com/oauth/api_scope/sell.inventory",
        "https://api.ebay.com/oauth/api_scope/sell.account",
        "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
        "https://api.ebay.com/oauth/api_scope/sell.marketing",
        "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
      ].join(" ")
    );

    const auth = Buffer.from(
      `${ebayConfig.clientId}:${ebayConfig.clientSecret}`
    ).toString("base64");

    const response = await axios.post(
      ebayConfig.tokenUrl,
      body,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.log(
      err.response?.data || err.message
    );

    throw err;
  }
};

// ========================================
// Check Token Expiry
// ========================================

exports.isTokenExpired = (
  expiresAt
) => {
  if (!expiresAt) return true;

  return (
    new Date(expiresAt).getTime() <=
    Date.now()
  );
};