import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Paperclip, Printer, Search } from "lucide-react";
import { apiFetch } from "../api";

// The devices on one supplier invoice, opened in its own browser tab from
// the Supplier Ledger ("View devices").

const MONO = { fontFamily: "'JetBrains Mono', monospace" };
const SORA = { fontFamily: "Sora, sans-serif" };
const money = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n || 0));
const formatDay = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export default function InvoiceDevices() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/api/supplier-ledger/${id}`);
        const data = await res.json();
        if (data.success) setEntry(data.entry);
        else setError(data.message || "Couldn't load this invoice");
      } catch {
        setError("Couldn't load this invoice. Check the internet and refresh.");
      }
    })();
  }, [id]);

  useEffect(() => {
    if (entry) document.title = `${entry.supplier} ${entry.reference || ""} — devices`.trim();
  }, [entry]);

  const devices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (entry?.devices || [])
      .map((d, i) => ({ ...d, n: i + 1 }))
      .filter((d) => !q || `${d.model} ${d.imei}`.toLowerCase().includes(q));
  }, [entry, search]);

  if (error) return <p className="p-10 text-center text-sm text-red-600">{error}</p>;
  if (!entry) return <p className="p-10 text-center text-sm text-slate-400">Loading…</p>;

  const all = entry.devices || [];
  const priced = all.filter((d) => d.price !== null && d.price !== undefined);
  const devicesTotal = priced.reduce((s, d) => s + Number(d.price), 0);

  return (
    <div className="min-h-screen w-full bg-slate-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Devices bought</p>
            <h1 className="text-2xl font-bold text-slate-800 mt-1" style={SORA}>{entry.supplier}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {formatDay(entry.date)}
              {entry.reference ? ` · Invoice ${entry.reference}` : ""}
            </p>
            {entry.file && (
              <a href={entry.file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-blue-600 hover:underline">
                <Paperclip size={13} />
                {entry.fileName || "View invoice file"}
              </a>
            )}
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs text-slate-400">Devices</p>
              <p className="text-xl font-bold text-slate-800" style={MONO}>{all.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Invoice amount</p>
              <p className="text-xl font-bold text-slate-800" style={MONO}>{money(entry.amount)}</p>
            </div>
          </div>
        </div>

        {priced.length > 0 && Math.abs(devicesTotal - Number(entry.amount)) > 0.05 && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            The device prices add up to {money(devicesTotal)}, but the invoice amount is {money(entry.amount)} — some devices may be missing or a price may be wrong.
          </p>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex flex-wrap items-center gap-2 print:hidden">
            <div className="relative flex-1 min-w-[12rem]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search model or IMEI…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-sm pl-9 pr-3 py-2 rounded-xl outline-none focus:border-[#F4B400]"
              />
            </div>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <Printer size={14} />
              Print
            </button>
          </div>

          {all.length === 0 ? (
            <p className="p-10 text-center text-sm text-slate-400">No devices were saved with this invoice.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/60">
                    <th className="px-4 py-2.5 font-semibold w-12">#</th>
                    <th className="px-4 py-2.5 font-semibold">Device</th>
                    <th className="px-4 py-2.5 font-semibold">IMEI</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {devices.map((d) => (
                    <tr key={d.n} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 text-slate-400 tabular-nums">{d.n}</td>
                      <td className="px-4 py-2.5 text-slate-800">{d.model || "—"}</td>
                      <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap" style={MONO}>{d.imei || "—"}</td>
                      <td className="px-4 py-2.5 text-right text-slate-800 whitespace-nowrap tabular-nums" style={MONO}>
                        {d.price !== null && d.price !== undefined ? money(d.price) : ""}
                      </td>
                    </tr>
                  ))}
                  {devices.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No device matches “{search}”.</td>
                    </tr>
                  )}
                </tbody>
                {!search && priced.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-slate-200 font-bold text-slate-800">
                      <td className="px-4 py-2.5" colSpan={3}>Total</td>
                      <td className="px-4 py-2.5 text-right tabular-nums" style={MONO}>{money(devicesTotal)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
