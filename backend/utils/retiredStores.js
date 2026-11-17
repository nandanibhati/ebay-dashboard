const EbayStore = require("../models/EbayStore");
const EbayListing = require("../models/EbayListing");
const Settings = require("../models/Settings");

// eBay accounts that have been closed. On every server start (safe to
// repeat) their store is switched off and its eBay login removed, its
// cached listings are dropped, and the site is taken out of the order
// dropdowns. Past orders from these stores are deliberately kept, so old
// sales and profit figures stay correct.
const RETIRED_EBAY_STORES = ["TPS"];

async function retireClosedStores() {
  try {
    const stores = await EbayStore.find({ storeName: { $in: RETIRED_EBAY_STORES } });
    if (stores.length) {
      await EbayStore.updateMany(
        { _id: { $in: stores.map((s) => s._id) } },
        {
          $set: {
            isActive: false,
            connected: false,
            connectionStatus: "Disconnected",
            autoSync: false,
            accessToken: "",
            refreshToken: "",
            tokenType: "",
            expiresAt: null,
            financesAccessToken: "",
            financesExpiresAt: null,
          },
        }
      );
      await EbayListing.deleteMany({ store: { $in: stores.map((s) => s._id) } });
    }

    await Settings.updateOne(
      { key: "app" },
      { $pull: { orderSites: { $in: RETIRED_EBAY_STORES } } }
    );
  } catch (error) {
    console.log("Retiring closed eBay stores failed:", error.message);
  }
}

module.exports = { RETIRED_EBAY_STORES, retireClosedStores };
