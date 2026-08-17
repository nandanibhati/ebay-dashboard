import { useState, useEffect } from "react";
import {
  Store,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Plug,
  Unplug,
  Clock3,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { apiFetch, API_BASE_URL, getToken } from "../api";

export default function EbayIntegration() {
  const [stores, setStores] = useState([
    {
      name: "TPS",
      connected: false,
      lastSync: null,
      marketplace: "eBay UK",
    },
    {
      name: "SmartZone",
      connected: false,
      lastSync: null,
      marketplace: "eBay UK",
    },
  ]);
  const [syncingStore, setSyncingStore] = useState(null);
  const isAdmin = localStorage.getItem("role") === "admin";

  useEffect(() => {
    loadStores();
  }, []);

  async function syncOrders(storeName) {
    setSyncingStore(storeName);
    try {
      const res = await apiFetch("/api/ebay/sync", {
        method: "POST",
        body: JSON.stringify({ storeName }),
      });

      const data = await res.json();

      alert(data.message || (data.success ? "Sync complete." : "Sync failed."));

      await loadStores();
    } catch (err) {
      console.log(err);
      alert("Failed to sync orders. Please try again.");
    } finally {
      setSyncingStore(null);
    }
  }

  async function loadStores() {
    try {
      const res = await apiFetch(
        "/api/ebay/stores"
      );

      const data = await res.json();

      if (data.success) {
        setStores(data.stores);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      {/* Header */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            eBay Integration
          </h1>

          <p className="text-slate-500 mt-1">
            Connect and manage your eBay UK seller accounts.
          </p>

        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 shadow-sm">

          <ShieldCheck className="text-emerald-500" size={22} />

          <span className="font-semibold text-slate-700">
            Official eBay API
          </span>

        </div>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

  {stores.map((store) => (
          <div
            key={store.name}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
          >
            {/* Card Header */}

            <div className="flex items-center justify-between px-7 py-6 border-b border-slate-100">

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">

                  <Store className="text-white" size={30} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-slate-800">

                    {store.name}

                  </h2>

                  <p className="text-slate-500">

                    {store.marketplace}

                  </p>

                </div>

              </div>

              {store.connected ? (
                <div className="flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-4 py-2">

                  <CheckCircle2 size={18} />

                  Connected

                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-red-100 text-red-600 px-4 py-2">

                  <XCircle size={18} />

                  Not Connected

                </div>
              )}

            </div>

            {/* Body */}

            <div className="p-7">

              <div className="grid grid-cols-3 gap-6">

                <div className="rounded-2xl bg-slate-50 p-5">

                  <Activity
                    className="text-violet-600 mb-3"
                    size={24}
                  />

                  <p className="text-xs uppercase text-slate-400">

                    Status

                  </p>

                  <h3 className="mt-2 font-bold text-slate-800">

                    {store.connected
                      ? "Connected"
                      : "Disconnected"}

                  </h3>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <Clock3
                    className="text-indigo-600 mb-3"
                    size={24}
                  />

                  <p className="text-xs uppercase text-slate-400">

                    Last Sync

                  </p>

                  <h3 className="mt-2 font-bold text-slate-800">

                    {store.lastSync
                      ? new Date(
                          store.lastSync
                        ).toLocaleString()
                      : "Never"}

                  </h3>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <ShieldCheck
                    className="text-emerald-600 mb-3"
                    size={24}
                  />

                  <p className="text-xs uppercase text-slate-400">

                    Marketplace

                  </p>

                  <h3 className="mt-2 font-bold text-slate-800">

                    UK

                  </h3>

                </div>

              </div>

              {/* Buttons (admin only - connecting/syncing/disconnecting stores is an admin action) */}

              {isAdmin ? (
              <div className="flex gap-4 mt-8">

                {!store.connected ? (
                <button
  onClick={() => {
    window.location.href =
      `${API_BASE_URL}/api/ebay/connect/${store.storeName}?token=${getToken()}`;
  }}
  className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 font-semibold transition"
>
  <Plug size={18} />
  Connect Store
</button>
                ) : (
                  <>
                   <button
  onClick={() => syncOrders(store.storeName)}
  disabled={syncingStore === store.storeName}
  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 font-semibold transition"
>
  <RefreshCw size={18} className={syncingStore === store.storeName ? "animate-spin" : ""} />
  {syncingStore === store.storeName ? "Syncing..." : "Sync Orders"}
</button>

                    <button
  onClick={async () => {
    await apiFetch(
      "/api/ebay/disconnect",
      {
        method: "POST",
        body: JSON.stringify({
          storeName: store.storeName,
        }),
      }
    );

    loadStores();
  }}
  className="flex items-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-semibold transition"
>
  <Unplug size={18} />
  Disconnect
</button>
                  </>
                )}

              </div>
              ) : (
                <p className="mt-8 text-sm text-slate-400 italic">
                  View only — ask an admin to connect, sync, or disconnect this store.
                </p>
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}