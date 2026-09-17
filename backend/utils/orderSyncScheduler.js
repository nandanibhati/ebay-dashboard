const EbayStore = require("../models/EbayStore");
const { syncStoreOrders } = require("../services/ebayOrderSyncService");
const { syncBackmarketOrders } = require("../services/backmarketOrderSyncService");

// Orders used to only sync when an admin clicked the button on the
// Integrations page. That's fine for a one-off check, but profit/stock
// figures drift stale between visits — so this runs the same sync
// automatically in the background instead.
async function runEbaySync() {
  const stores = await EbayStore.find({ connected: true });

  for (const store of stores) {
    try {
      const result = await syncStoreOrders(store);
      console.log(
        `eBay auto-sync (${store.storeName}): ${result.created} new, ${result.updated} updated.`
      );
    } catch (error) {
      const message =
        error.response?.data?.errors?.[0]?.message || error.message;
      console.log(`eBay auto-sync (${store.storeName}) failed:`, message);
      try {
        store.lastError = message;
        await store.save();
      } catch (saveError) {
        console.log(saveError);
      }
    }
  }
}

async function runBackmarketSync() {
  try {
    const result = await syncBackmarketOrders();
    console.log(
      `Backmarket auto-sync: ${result.created} new, ${result.updated} updated.`
    );
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    console.log("Backmarket auto-sync failed:", message);
  }
}

function startOrderSyncScheduler() {
  const intervalMinutes = Number(process.env.ORDER_SYNC_INTERVAL_MINUTES) || 60;

  setInterval(() => {
    runEbaySync();
    runBackmarketSync();
  }, intervalMinutes * 60 * 1000);

  console.log(`Order auto-sync scheduler started — every ${intervalMinutes} minute(s) ⏰`);

  // Run once on boot too, instead of waiting for the first interval tick.
  runEbaySync();
  runBackmarketSync();
}

module.exports = { startOrderSyncScheduler, runEbaySync, runBackmarketSync };
