import { useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, Loader2 } from "lucide-react";
import { apiFetch } from "../api";

const MONO = { fontFamily: "'JetBrains Mono', monospace" };
const gbp = (n) => `£${Number(n || 0).toFixed(2)}`;
const fmtTime = (d) =>
  new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const STATUS_STYLE = {
  ok: "text-emerald-700",
  partial: "text-amber-700",
  error: "text-red-600",
  "no-listing": "text-slate-400",
};

// Stock page cell: shows the price live on eBay for this SKU and lets an
// admin/manager push a new selling price to every listing with the SKU.
// `listings` are the item's eBay listings (null while still loading).
export default function EbayPriceCell({ item, listings, onUpdated, onDraft }) {
  const live = (listings || []).map((l) => l.price).filter((p) => p > 0);
  const min = live.length ? Math.min(...live) : null;
  const max = live.length ? Math.max(...live) : null;

  const [value, setValue] = useState(item.ebayPrice ?? min ?? "");
  const [saving, setSaving] = useState(false);

  const push = async (confirm = false) => {
    const price = Number(value);
    if (!(price > 0)) {
      toast.error("Enter a price above £0");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(`/api/stock/${item._id}/ebay-price`, { method: "POST", body: { price, confirm } });
      const data = await res.json();

      if (data.needsConfirm) {
        setSaving(false);
        if (window.confirm(data.message)) await push(true);
        return;
      }
      if (data.stock) onUpdated(data.stock);

      const okCount = (data.results || []).filter((r) => r.ok).length;
      if (data.success) {
        toast.success(`${item.sku}: eBay price set to ${gbp(price)} on ${okCount} listing${okCount === 1 ? "" : "s"}`);
      } else if (data.stock?.ebayPriceStatus?.state === "no-listing") {
        toast.error(`${item.sku}: no active eBay listing has this SKU`);
      } else {
        toast.error(data.stock?.ebayPriceStatus?.message || data.message || "eBay didn't accept the price");
      }
    } catch {
      toast.error("Couldn't reach the server. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const status = item.ebayPriceStatus || {};

  return (
    <div className="flex flex-col gap-1 items-stretch">
      <div className="text-[11px] text-slate-500 text-left">
        {listings === null ? (
          <span className="text-slate-300">Loading…</span>
        ) : live.length ? (
          <span>
            Live: <span className="font-bold text-slate-800" style={MONO}>{min === max ? gbp(min) : `${gbp(min)}–${gbp(max)}`}</span>
            {" · "}
            {listings.length} listing{listings.length === 1 ? "" : "s"}
            {listings[0]?.url && (
              <a href={listings[0].url} target="_blank" rel="noreferrer" className="inline-flex ml-1 text-blue-500 hover:text-blue-700 align-middle" title="Open on eBay">
                <ExternalLink size={11} />
              </a>
            )}
          </span>
        ) : (
          <span className="text-slate-400">Not on eBay</span>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          push();
        }}
        className="flex items-center gap-1.5"
      >
        <span className="text-slate-400 text-xs">£</span>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            // Lets the Stock page's "Sync all to eBay" pick up unsent edits.
            onDraft?.(e.target.value);
          }}
          className="w-20 border border-slate-200 bg-white px-2 py-1 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#F4B400]"
          style={MONO}
          aria-label={`eBay price for ${item.sku}`}
        />
        <button
          type="submit"
          disabled={saving || value === "" || !listings?.length}
          title={listings?.length ? "Update the price on eBay" : "No eBay listing has this SKU"}
          className="px-2 py-1 rounded-lg text-[11px] font-bold text-[#0F172A] disabled:opacity-40 inline-flex items-center gap-1"
          style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)" }}
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : null}
          Update eBay
        </button>
      </form>

      {status.state && (
        <p className={`text-[10px] leading-tight text-left truncate ${STATUS_STYLE[status.state] || "text-slate-500"}`} title={status.message}>
          {status.state === "ok" ? "✓ " : status.state === "error" ? "✕ " : ""}
          {status.message}
          {status.at && <span className="text-slate-400"> · {fmtTime(status.at)}</span>}
        </p>
      )}
    </div>
  );
}
