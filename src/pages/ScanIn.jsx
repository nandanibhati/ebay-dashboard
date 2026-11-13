import { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Menu,
  X,
  ScanLine,
  PackagePlus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  Search,
  Lock,
  Unlock,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import ManagerSidebar from "../components/ManagerSidebar";
import { apiFetch } from "../api";
import useLiveRefresh from "../useLiveRefresh";

/* Design tokens - BuildMaster reference palette
   Gold: #F4B400  Blue: #2563EB  Emerald: #22C55E
   Amber: #F59E0B  Red: #EF4444  Dark navy: #0F172A
*/

const MONO = { fontFamily: "'JetBrains Mono', monospace" };
const SORA = { fontFamily: "Sora, sans-serif" };
const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const money = (n) => gbp.format(Number(n || 0));
const todayStr = () => new Date().toLocaleDateString("en-CA");
const fmtDay = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const inputCls =
  "w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all";
const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

// Short beeps so the person scanning knows the result without looking.
let audioCtx = null;
function beep(kind) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const tones = kind === "ok" ? [[1046, 0.09]] : kind === "warn" ? [[660, 0.12], [660, 0.12]] : [[220, 0.35]];
    let t = audioCtx.currentTime;
    for (const [freq, dur] of tones) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = kind === "error" ? "square" : "sine";
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur + 0.06;
    }
  } catch {
    // no audio available
  }
}

function ResultBanner({ result, onForce }) {
  if (!result) return null;
  const styles = {
    ok: { cls: "bg-emerald-50 border-emerald-200 text-emerald-800", Icon: CheckCircle2 },
    warn: { cls: "bg-amber-50 border-amber-200 text-amber-800", Icon: AlertTriangle },
    error: { cls: "bg-red-50 border-red-200 text-red-800", Icon: XCircle },
  }[result.kind];
  const { Icon } = styles;
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${styles.cls}`} role="status" aria-live="polite">
      <Icon size={22} className="shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">{result.title}</p>
        {result.detail && <p className="text-sm mt-0.5 break-words">{result.detail}</p>}
      </div>
      {result.kind === "warn" && result.code && (
        <button
          onClick={() => onForce(result.code)}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700"
        >
          Add anyway
        </button>
      )}
    </div>
  );
}

function NewBatchForm({ vendors, onCreated }) {
  const [form, setForm] = useState({ vendor: "", date: todayStr(), reference: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch("/api/scan/batches", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setForm({ vendor: "", date: todayStr(), reference: "" });
        onCreated(data.batch);
      } else toast.error(data.message || "Couldn't start batch");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className={labelCls}>Vendor *</label>
        <select required className={inputCls} value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })}>
          <option value="">{vendors.length ? "Select vendor" : "No vendors — add them in Supplier Ledger"}</option>
          {vendors.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Received on *</label>
          <input type="date" required className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Invoice no.</label>
          <input className={inputCls} placeholder="Optional" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 rounded-xl text-sm font-bold text-[#0F172A] disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)" }}
      >
        <PackagePlus size={15} className="inline mr-1.5 -mt-0.5" />
        Start scanning
      </button>
    </form>
  );
}

function DevicesTab() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [devices, setDevices] = useState(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const params = new URLSearchParams({ search });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      try {
        const res = await apiFetch(`/api/scan/devices?${params}`);
        const data = await res.json();
        if (!data.success) toast.error(data.message || "Couldn't load devices");
        setDevices(data.success ? data.devices : []);
      } catch {
        toast.error("Couldn't load devices");
        setDevices([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [search, from, to]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Scan or type an IMEI, or search product / vendor…"
            className={`${inputCls} pl-9`}
          />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-slate-200 bg-slate-50 px-2 py-2 rounded-lg" />
          <span>to</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-slate-200 bg-slate-50 px-2 py-2 rounded-lg" />
        </div>
      </div>
      {devices === null ? (
        <p className="text-center text-sm text-slate-400 py-10">Loading…</p>
      ) : devices.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-10">No devices found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60 text-left">
                <th className="px-5 py-2.5">IMEI / Serial</th>
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Vendor (bought from)</th>
                <th className="px-4 py-2.5">Received</th>
                <th className="px-4 py-2.5 text-right">Cost</th>
                <th className="px-5 py-2.5">Scanned by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50">
                  <td className="px-5 py-2.5 font-semibold text-slate-800" style={MONO}>{d.imei}</td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {d.product || "—"}
                    {d.sku && <span className="block text-[11px] text-slate-400">{d.sku}</span>}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-700">{d.vendor}</td>
                  <td className="px-4 py-2.5 text-slate-600">{fmtDay(d.receivedDate)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums" style={MONO}>{money(d.cost)}</td>
                  <td className="px-5 py-2.5 text-slate-500">{d.scannedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ScanIn() {
  const role = localStorage.getItem("role");
  const allowed = role === "admin" || role === "manager";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState("scan");
  const [vendors, setVendors] = useState([]);
  const [stock, setStock] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState(() => {
    try {
      return localStorage.getItem("scanIn.batch") || "";
    } catch {
      return "";
    }
  });
  const [batch, setBatch] = useState(null);
  const [devices, setDevices] = useState([]);

  // What's being scanned right now — kept until changed, since a delivery
  // is usually many units of the same model.
  const [sku, setSku] = useState("");
  const [cost, setCost] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scanFocused, setScanFocused] = useState(false);
  const scanRef = useRef(null);

  const stockItem = useMemo(() => stock.find((s) => s.sku === sku) || null, [stock, sku]);

  const loadLists = async () => {
    const [v, s, b] = await Promise.all([
      apiFetch("/api/scan/vendors").then((r) => r.json()),
      apiFetch("/api/stock").then((r) => r.json()),
      apiFetch("/api/scan/batches").then((r) => r.json()),
    ]);
    if (v.success) setVendors(v.vendors);
    if (Array.isArray(s)) setStock(s.filter((x) => x.sku).sort((a, b2) => a.sku.localeCompare(b2.sku)));
    if (b.success) setBatches(b.batches);
  };

  const loadBatch = async (id = batchId) => {
    if (!id) {
      setBatch(null);
      setDevices([]);
      return;
    }
    const res = await apiFetch(`/api/scan/batches/${id}`);
    const data = await res.json();
    if (data.success) {
      setBatch(data.batch);
      setDevices(data.devices);
    } else {
      selectBatch("");
    }
  };

  const selectBatch = (id) => {
    setBatchId(id);
    setResult(null);
    try {
      if (id) localStorage.setItem("scanIn.batch", id);
      else localStorage.removeItem("scanIn.batch");
    } catch {
      // storage unavailable
    }
  };

  useEffect(() => {
    if (!allowed) return;
    loadLists().catch(() => toast.error("Couldn't load vendors / stock"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allowed) loadBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  useLiveRefresh(["scanbatches", "devices"], () => {
    loadLists();
    loadBatch();
  }, allowed);

  // Default the cost from Stock when the product changes.
  useEffect(() => {
    if (stockItem) setCost(String(stockItem.price ?? ""));
  }, [stockItem]);

  const focusScan = () => setTimeout(() => scanRef.current?.focus(), 50);

  const submitScan = async (raw, force = false) => {
    const value = String(raw || "").trim();
    if (!value || !batch || busy) return;
    setBusy(true);
    setCode("");
    try {
      const res = await apiFetch(`/api/scan/batches/${batch._id}/devices`, {
        method: "POST",
        body: { imei: value, sku, product: stockItem?.product || "", cost: Number(cost) || 0, force },
      });
      const data = await res.json();
      if (data.success) {
        beep("ok");
        setResult({ kind: "ok", title: `Added ${data.device.imei}`, detail: `${data.device.product || "No product selected"} · ${money(data.device.cost)}` });
        setBatch(data.batch);
        setBatches((list) => list.map((b) => (b._id === data.batch._id ? data.batch : b)));
        setDevices((list) => [data.device, ...list]);
      } else if (data.warning) {
        beep("warn");
        setResult({ kind: "warn", title: "Check this scan", detail: data.message, code: data.code });
      } else {
        beep("error");
        setResult({ kind: "error", title: data.duplicate ? "Already scanned in" : "Not added", detail: data.message });
      }
    } catch {
      beep("error");
      setResult({ kind: "error", title: "Not added", detail: "Couldn't reach the server. Check the internet and scan again." });
    } finally {
      setBusy(false);
      focusScan();
    }
  };

  const removeDevice = async (device) => {
    if (!window.confirm(`Remove ${device.imei} from this batch? It will also be taken out of stock.`)) return;
    const res = await apiFetch(`/api/scan/batches/${batch._id}/devices/${device._id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setBatch(data.batch);
      setBatches((list) => list.map((b) => (b._id === data.batch._id ? data.batch : b)));
      setDevices((list) => list.filter((d) => d._id !== device._id));
    } else toast.error(data.message || "Couldn't remove");
    focusScan();
  };

  const updateBatch = async (changes) => {
    const res = await apiFetch(`/api/scan/batches/${batch._id}`, { method: "PATCH", body: changes });
    const data = await res.json();
    if (data.success) {
      setBatch(data.batch);
      loadLists();
    } else toast.error(data.message || "Couldn't update batch");
  };

  const deleteBatch = async () => {
    if (!window.confirm("Delete this empty batch?")) return;
    const res = await apiFetch(`/api/scan/batches/${batch._id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      selectBatch("");
      loadLists();
    } else toast.error(data.message || "Couldn't delete");
  };

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-red-600 mb-1">Access Denied</h2>
          <p className="text-slate-500 text-sm">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const open = batch?.status === "open";
  const openBatches = batches.filter((b) => b.status === "open");
  const recentClosed = batches.filter((b) => b.status === "closed").slice(0, 8);

  return (
    <div className="min-h-screen w-full relative" style={{ background: "#F8FAFC", fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      <Toaster position="top-right" reverseOrder={false} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl anim-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X size={17} />
            </button>
            {role === "manager" ? <ManagerSidebar /> : <Sidebar />}
          </div>
        </div>
      )}

      <div className="p-4 lg:p-8 w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={SORA}>Scan In</h1>
            <p className="text-sm text-slate-500">Scan each device's IMEI with the barcode scanner — it's recorded with the vendor and date, added to stock and to the vendor's invoice.</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
          {[
            ["scan", "Scan devices"],
            ["devices", "Received devices"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
              style={tab === key ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" } : { color: "#64748B" }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "devices" ? (
          <DevicesTab />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Batches */}
            <div className="xl:col-span-1 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-slate-800 mb-3" style={SORA}>New delivery</h2>
                <NewBatchForm
                  vendors={vendors}
                  onCreated={(b) => {
                    selectBatch(b._id);
                    loadLists();
                    focusScan();
                  }}
                />
              </div>

              {(openBatches.length > 0 || recentClosed.length > 0) && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
                  {[["Open", openBatches], ["Recently closed", recentClosed]].map(([label, list]) =>
                    list.length ? (
                      <div key={label} className="mb-2 last:mb-0">
                        <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                        {list.map((b) => (
                          <button
                            key={b._id}
                            onClick={() => selectBatch(b._id)}
                            className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${b._id === batchId ? "bg-amber-50 ring-1 ring-amber-200" : "hover:bg-slate-50"}`}
                          >
                            <p className="text-sm font-semibold text-slate-800 truncate">{b.vendor}</p>
                            <p className="text-xs text-slate-500 tabular-nums">
                              {fmtDay(b.date)} · {b.deviceCount} device{b.deviceCount === 1 ? "" : "s"} · {money(b.totalCost)}
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>

            {/* Scanning */}
            <div className="xl:col-span-3 flex flex-col gap-4">
              {!batch ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                  <ScanLine size={36} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-semibold">Start a new delivery or pick an open one to begin scanning.</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery from</p>
                        <p className="text-xl font-bold text-slate-900" style={SORA}>{batch.vendor}</p>
                        <p className="text-sm text-slate-500">
                          {fmtDay(batch.date)}
                          {batch.reference && ` · Invoice ${batch.reference}`} · started by {batch.createdBy}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-3xl font-bold text-slate-900 tabular-nums" style={MONO}>{batch.deviceCount}</p>
                          <p className="text-xs text-slate-500">devices</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-slate-900 tabular-nums" style={MONO}>{money(batch.totalCost)}</p>
                          <p className="text-xs text-slate-500">invoice total</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <input
                        defaultValue={batch.reference}
                        key={`ref-${batch._id}`}
                        placeholder="Invoice no."
                        onBlur={(e) => e.target.value !== batch.reference && updateBatch({ reference: e.target.value })}
                        className="border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg text-sm w-40"
                      />
                      <input
                        type="date"
                        value={batch.date}
                        onChange={(e) => e.target.value && updateBatch({ date: e.target.value })}
                        className="border border-slate-200 bg-slate-50 px-2 py-1.5 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => updateBatch({ status: open ? "closed" : "open" })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        {open ? <Lock size={14} /> : <Unlock size={14} />}
                        {open ? "Finish delivery" : "Reopen"}
                      </button>
                      {batch.deviceCount === 0 && (
                        <button onClick={deleteBatch} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50">
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {open && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className={labelCls}>Product being scanned</label>
                          <select value={sku} onChange={(e) => { setSku(e.target.value); focusScan(); }} className={inputCls}>
                            <option value="">— Choose SKU from Stock —</option>
                            {stock.map((s) => (
                              <option key={s._id} value={s.sku}>
                                {s.sku} — {s.product}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Cost per device (£)</label>
                          <input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} className={inputCls} />
                        </div>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitScan(code);
                        }}
                      >
                        <label className={labelCls}>Scan IMEI / serial</label>
                        <div className={`relative rounded-2xl border-2 transition-colors ${scanFocused ? "border-emerald-400 bg-emerald-50/40" : "border-slate-300 bg-slate-50"}`}>
                          <ScanLine size={22} className={`absolute left-4 top-1/2 -translate-y-1/2 ${scanFocused ? "text-emerald-500" : "text-slate-400"}`} />
                          <input
                            ref={scanRef}
                            autoFocus
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={(e) => {
                              // Most scanners end with Enter (submits the form);
                              // some are set to end with Tab instead.
                              if (e.key === "Tab" && code.trim()) {
                                e.preventDefault();
                                submitScan(code);
                              }
                            }}
                            onFocus={() => setScanFocused(true)}
                            onBlur={() => setScanFocused(false)}
                            placeholder={sku ? "Scan now…" : "Choose the product first, then scan"}
                            className="w-full bg-transparent pl-14 pr-4 py-4 text-xl font-semibold outline-none tracking-wider"
                            style={MONO}
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>
                        <p className={`mt-1.5 text-xs font-semibold ${scanFocused ? "text-emerald-600" : "text-amber-600"}`}>
                          {scanFocused ? "● Scanner ready" : "Click the box above before scanning"}
                        </p>
                      </form>

                      <ResultBanner result={result} onForce={(c) => submitScan(c, true)} />
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 text-sm font-bold text-slate-800" style={SORA}>
                      Scanned in this delivery
                    </div>
                    {devices.length === 0 ? (
                      <p className="text-center text-sm text-slate-400 py-8">Nothing scanned yet.</p>
                    ) : (
                      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                        <table className="w-full text-sm min-w-[720px]">
                          <thead className="sticky top-0 bg-white">
                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">
                              <th className="px-5 py-2">#</th>
                              <th className="px-4 py-2">IMEI / Serial</th>
                              <th className="px-4 py-2">Product</th>
                              <th className="px-4 py-2 text-right">Cost</th>
                              <th className="px-4 py-2">Time</th>
                              <th className="px-4 py-2">By</th>
                              <th className="px-4 py-2" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {devices.map((d, i) => (
                              <tr key={d._id} className="hover:bg-slate-50">
                                <td className="px-5 py-2 text-slate-400 tabular-nums">{devices.length - i}</td>
                                <td className="px-4 py-2 font-semibold text-slate-800" style={MONO}>{d.imei}</td>
                                <td className="px-4 py-2 text-slate-700">{d.product || <span className="text-amber-600">No product</span>}</td>
                                <td className="px-4 py-2 text-right tabular-nums" style={MONO}>{money(d.cost)}</td>
                                <td className="px-4 py-2 text-slate-500 tabular-nums">{fmtTime(d.createdAt)}</td>
                                <td className="px-4 py-2 text-slate-500">{d.scannedBy}</td>
                                <td className="px-4 py-2 text-right">
                                  {open && (
                                    <button onClick={() => removeDevice(d)} title="Remove" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
