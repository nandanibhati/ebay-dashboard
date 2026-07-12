import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  User,
  Edit3,
  Trash2,
  Boxes,
  PlusCircle,
  RotateCcw,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import { apiFetch } from "../api";

/* Design tokens - BuildMaster reference palette
   Gold: #F4B400  Blue: #2563EB  Emerald: #22C55E
   Amber: #F59E0B  Red: #EF4444  Dark navy: #0F172A
*/

const FONT_LINK_ID = "ebay-dash-fonts";
function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap";
  document.head.appendChild(link);
}

function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: "#F8FAFC" }} />
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
        }}
      />
      <div
        className="absolute -top-40 -left-32 w-[34rem] h-[34rem] rounded-full blur-[110px] anim-drift-a"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.10), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 right-[-6rem] w-[28rem] h-[28rem] rounded-full blur-[100px] anim-drift-b"
        style={{ background: "radial-gradient(circle, rgba(244,180,0,0.10), transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full blur-[100px] anim-drift-c"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.08), transparent 70%)" }}
      />
    </div>
  );
}

export default function Stock() {
  const role = localStorage.getItem("role");
  const [stock, setStock] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state
  const employeeName = localStorage.getItem("employeeName") || "Unknown";

  const [form, setForm] = useState({
    sku: "",
    product: "",
    quantity: "",
    price: "",
    masterSku: "",
    packQty: 1,
    minimumStock: 5,
  });

  useEffect(() => {
    ensureFonts();
  }, []);

  useEffect(() => {
    apiFetch("/api/stock")
      .then((res) => res.json())
      .then((data) => setStock(data))
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addStock = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/stock/${editingId}`
        : "/api/stock";

      const method = editingId ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...form,
          updatedBy: employeeName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (editingId) {
          setStock(
            stock.map((item) =>
              item._id === editingId ? data.stock : item
            )
          );
          alert("Stock Updated ✅");
          setEditingId(null);
        } else {
          setStock([...stock, data.stock]);
          alert("Stock Added ✅");
        }

        setForm({
          sku: "",
          product: "",
          quantity: "",
          price: "",
          masterSku: "",
          packQty: 1,
          minimumStock: 5,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteStock = async (id) => {
    const confirmDelete = window.confirm("Delete this stock item?");
    if (!confirmDelete) return;

    try {
      await apiFetch(`/api/stock/${id}`, {
        method: "DELETE",
      });
      setStock(stock.filter((item) => item._id !== id));
    } catch (error) {
      console.log(error);
      alert("Failed to delete stock");
    }
  };

  const editStock = (item) => {
    setEditingId(item._id);
    setForm({
      sku: item.sku,
      product: item.product,
      quantity: item.quantity,
      price: item.price || "",
      masterSku: item.masterSku || "",
      packQty: item.packQty || 1,
      minimumStock: item.minimumStock || 5,
    });
  };

  // Inventory metrics
  const metrics = useMemo(() => {
    const totalSkus = stock.length;
    const lowStockCount = stock.filter((item) => item.quantity <= 5).length;
    const healthyStockCount = totalSkus - lowStockCount;
    return { totalSkus, lowStockCount, healthyStockCount };
  }, [stock]);

  const filteredStock = stock.filter(
    (item) =>
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.toLowerCase().includes(search.toLowerCase()) ||
      item.masterSku?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls =
    "w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#F4B400] focus:bg-white focus:ring-4 focus:ring-[#F4B400]/12 transition-all duration-200 text-slate-800 placeholder:text-slate-400 font-medium hover:border-slate-300";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5";

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      <PremiumBackground />

      {/* Sidebar drawer (hamburger-triggered, not sticky) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl anim-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={17} />
            </button>
            {role === "admin" ? <Sidebar /> : <EmployeeSidebar />}
          </div>
        </div>
      )}

      <div className="relative z-10 p-4 md:p-8 flex flex-col gap-6 w-full overflow-x-hidden">

        {/* Top bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-500" style={{ fontFamily: "Sora, sans-serif" }}>
            Inventory
          </span>
        </div>

        {/* Module Hero Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div className="absolute right-0 bottom-0 opacity-[0.06] translate-x-12 translate-y-12 pointer-events-none">
            <Package size={240} />
          </div>
          <div
            className="absolute -top-16 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(244,180,0,0.18)" }}
          />
          <div
            className="absolute bottom-0 right-1/3 w-40 h-40 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(37,99,235,0.18)" }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"
                style={{ background: "rgba(244,180,0,0.14)", border: "1px solid rgba(244,180,0,0.3)", color: "#F4B400" }}
              >
                <Boxes size={11} /> Inventory Control
              </span>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5" style={{ fontFamily: "Sora, sans-serif" }}>
                Stock Management
              </h1>
              
            </div>
            <AnimatePresence>
              {editingId && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ sku: "", product: "", quantity: "", price: "", masterSku: "", packQty: 1, minimumStock: 5 });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all text-white backdrop-blur-sm self-start sm:self-center"
                >
                  <RotateCcw size={13} />
                  <span>Reset Editor</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* KPI Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0, ease: "easeOut" }}
            className="relative bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md overflow-hidden"
            style={{ background: "linear-gradient(160deg, rgba(37,99,235,0.06), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Catalog SKUs</p>
              <h2
                className="text-xl font-bold mt-1 text-slate-900 tracking-tight tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {metrics.totalSkus} Listed
              </h2>
            </div>
            <div className="bg-white/80 border border-blue-100 p-2.5 rounded-xl text-blue-600 shadow-sm">
              <Layers size={16} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.07, ease: "easeOut" }}
            className="relative bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md overflow-hidden"
            style={{ background: "linear-gradient(160deg, rgba(239,68,68,0.06), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Low Stock Warnings</p>
              <h2
                className={`text-xl font-bold mt-1 tracking-tight tabular-nums ${
                  metrics.lowStockCount > 0 ? "text-red-600 animate-pulse" : "text-slate-900"
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {metrics.lowStockCount} At Risk
              </h2>
            </div>
            <div
              className={`p-2.5 rounded-xl border transition-colors shadow-sm ${
                metrics.lowStockCount > 0
                  ? "bg-red-50 border-red-100 text-red-600"
                  : "bg-white/80 border-slate-100 text-slate-400"
              }`}
            >
              <AlertTriangle size={16} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14, ease: "easeOut" }}
            className="relative bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md overflow-hidden"
            style={{ background: "linear-gradient(160deg, rgba(34,197,94,0.06), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Healthy Stock</p>
              <h2
                className="text-xl font-bold mt-1 text-emerald-600 tracking-tight tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {metrics.healthyStockCount} Stable
              </h2>
            </div>
            <div className="bg-white/80 border border-emerald-100 p-2.5 rounded-xl text-emerald-600 shadow-sm">
              <CheckCircle2 size={16} />
            </div>
          </motion.div>
        </div>

        {/* Record Ingestion / Update Console */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/70 p-5 shadow-[0_20px_45px_-14px_rgba(30,41,59,0.14)]"
        >
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <div
              className="p-1.5 rounded-lg"
              style={
                editingId
                  ? { background: "rgba(245,158,11,0.1)", color: "#B45309", border: "1px solid rgba(245,158,11,0.28)" }
                  : { background: "rgba(244,180,0,0.12)", color: "#B45F06", border: "1px solid rgba(244,180,0,0.28)" }
              }
            >
              {editingId ? <RefreshCw size={14} className="animate-spin" /> : <PlusCircle size={14} />}
            </div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {editingId ? "Modify Existing Stock Item" : "Add New Inventory Record"}
            </h3>
          </div>

          <form onSubmit={addStock} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div>
              <label className={labelCls}>Master SKU</label>
              <input
                type="text"
                name="masterSku"
                placeholder="M-SKU-001"
                value={form.masterSku}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Pack Qty</label>
              <input
                type="number"
                name="packQty"
                placeholder="1"
                value={form.packQty}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Listing SKU Code</label>
              <input
                type="text"
                name="sku"
                placeholder="L-SKU-102"
                value={form.sku}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </div>

            <div className="lg:col-span-1">
              <label className={labelCls}>Product Name</label>
              <input
                type="text"
                name="product"
                placeholder="Product Descriptor Label"
                value={form.product}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Current Volume Qty</label>
              <input
                type="number"
                name="quantity"
                placeholder="0"
                value={form.quantity}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Price (£)</label>

              <input
                type="number"
                step="0.01"
                name="price"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                className={inputCls}
              />
            </div>


            <div>
              <label className={labelCls}>Minimum Floor Limit</label>
              <input
                type="number"
                name="minimumStock"
                placeholder="5"
                value={form.minimumStock}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-6 flex justify-end mt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all duration-200 active:scale-[0.99] w-full sm:w-auto hover:shadow-lg"
                style={
                  editingId
                    ? { background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff", boxShadow: "0 8px 20px -6px rgba(245,158,11,0.4)" }
                    : { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A", boxShadow: "0 8px 20px -6px rgba(244,180,0,0.4)" }
                }
              >
                {editingId ? "Save Changes" : "Add Stock Item"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Master Stock Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/70 shadow-[0_24px_50px_-14px_rgba(30,41,59,0.16)] overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-slate-100 bg-white/60">

            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#2563EB" }} />
                <span className="text-xs font-bold text-slate-700">
                  Stock List
                </span>
              </div>

              <span
                className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {filteredStock.length} ITEMS
              </span>
            </div>

            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search SKU or Product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#F4B400] focus:ring-4 focus:ring-[#F4B400]/12 bg-white/70"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="overflow-auto h-[70vh] w-full">
            <table className="text-left border-collapse min-w-[1200px] table-fixed">
              <thead className="sticky top-0 z-20 bg-slate-50">
                <tr className="border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="w-48 px-6 py-3.5">Listing SKU</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="w-32 px-4 py-3.5 text-center">Quantity</th>
                  <th className="w-32 px-4 py-3.5 text-center">
                    Price
                  </th>
                  <th className="w-36 px-4 py-3.5 text-center">Status</th>
                  <th className="w-48 px-4 py-3.5 text-center">Updated By</th>
                  <th className="w-28 px-6 py-3.5 text-center sticky right-0 bg-slate-50/90 backdrop-blur-sm shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {filteredStock.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-slate-400 font-bold bg-white">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                          <Boxes size={22} className="text-slate-300" />
                        </div>
                        <span>No stock items found.</span>
                        <span className="text-[10px] text-slate-300 font-medium">
                          Add an item above to get started.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredStock.map((item, idx) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
                    className="hover:bg-[#F4B400]/[0.05] transition-colors group"
                  >
                    <td className="px-6 py-3.5">
                      <span
                        className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-bold"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {item.sku}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-slate-800 font-bold truncate pr-4" title={item.product}>
                      {item.product}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-center font-black text-sm ${
                        item.quantity <= 5 ? "text-red-600" : "text-emerald-600"
                      }`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {item.quantity}
                    </td>

                    <td className="px-4 py-3.5 text-center font-semibold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      £{Number(item.price || 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {item.quantity <= 5 ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border bg-red-50 border-red-200 text-red-700"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          LOW STOCK
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border bg-emerald-50 border-emerald-200 text-emerald-700"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          IN STOCK
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-semibold text-[11px] inline-flex items-center gap-1">
                        <User size={10} className="stroke-[2.5]" />
                        {item.updatedBy || "System"}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-center sticky right-0 bg-white group-hover:bg-slate-50/90 transition-all backdrop-blur-sm shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)]">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editStock(item)}
                          className="p-1.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all active:scale-95"
                          title="Edit Item"
                        >
                          <Edit3 size={12} className="stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStock(item._id)}
                          className="p-1.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
                          title="Delete Item"
                        >
                          <Trash2 size={12} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes driftA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(28px,20px); } }
        @keyframes driftB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-24px,22px); } }
        @keyframes driftC { 0%,100% { transform: translate(0,0); } 50% { transform: translate(18px,-18px); } }
        .anim-drift-a { animation: driftA 14s ease-in-out infinite; }
        .anim-drift-b { animation: driftB 17s ease-in-out infinite; }
        .anim-drift-c { animation: driftC 20s ease-in-out infinite; }

        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }

        @media (prefers-reduced-motion: reduce) {
          .anim-drift-a, .anim-drift-b, .anim-drift-c, .anim-slide-in { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
