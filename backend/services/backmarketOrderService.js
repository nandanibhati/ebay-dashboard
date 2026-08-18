const axios = require("axios");

const backmarketConfig = require("../config/backmarketConfig");

// Backmarket's "Direct API connexion" token from the seller backoffice is
// already a ready-to-use Basic-auth value - no OAuth/client-secret exchange
// needed like eBay.
function authHeaders() {
  return {
    Authorization: `Basic ${backmarketConfig.apiToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "en-gb",
  };
}

// Pulls every order created on/after `since`, following Backmarket's
// cursor-style pagination (`next` URL) until exhausted.
async function fetchBackmarketOrders(since) {
  const orders = [];
  let url = `${backmarketConfig.baseUrl}/orders`;
  let params = {
    date_creation: since.toISOString(),
    page: 1,
  };

  while (url) {
    const response = await axios.get(url, {
      headers: authHeaders(),
      params,
    });

    orders.push(...(response.data.results || []));

    url = response.data.next || null;
    params = undefined; // `next` is already a full URL with its own query string
  }

  return orders;
}

module.exports = { fetchBackmarketOrders };
