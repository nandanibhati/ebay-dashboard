const axios = require("axios");

const ebayConfig = require("../config/ebayConfig");
const {
  refreshAccessToken,
  isTokenExpired,
} = require("./ebayOAuthService");

// Refreshes the store's eBay access token if it's missing/expired, persists
// the new token on the store doc, and returns a token safe to call eBay with.
async function getValidAccessToken(store) {
  if (!store.refreshToken) {
    throw new Error("Store is not connected to eBay.");
  }

  if (!store.accessToken || isTokenExpired(store.expiresAt)) {
    const token = await refreshAccessToken(store.refreshToken);

    store.accessToken = token.access_token;
    store.expiresAt = new Date(Date.now() + token.expires_in * 1000);

    if (token.refresh_token) {
      store.refreshToken = token.refresh_token;
    }

    await store.save();
  }

  return store.accessToken;
}

// Pulls every order created on/after `since` from eBay's Fulfillment API,
// paging through results (eBay caps each page at 50 orders).
async function fetchEbayOrders(store, since) {
  const accessToken = await getValidAccessToken(store);

  const limit = 50;
  let offset = 0;
  let total = Infinity;
  const orders = [];

  while (offset < total) {
    const response = await axios.get(
      `${ebayConfig.apiUrl}/sell/fulfillment/v1/order`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          filter: `creationdate:[${since.toISOString()}..]`,
          limit,
          offset,
        },
      }
    );

    const batch = response.data.orders || [];
    orders.push(...batch);

    total = response.data.total ?? batch.length;
    offset += limit;

    if (batch.length === 0) break;
  }

  return orders;
}

module.exports = { getValidAccessToken, fetchEbayOrders };
