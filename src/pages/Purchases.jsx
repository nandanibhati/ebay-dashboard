import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Menu, X } from "lucide-react";
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

const SUPPLIER_CONFIG = {
  Temu: {
    badge: "bg-orange-100 text-orange-700 ring-orange-200",
    dot: "bg-orange-400",
  },
  AliExpress: {
    badge: "bg-red-100 text-red-700 ring-red-200",
    dot: "bg-red-400",
  },
};

function SupplierBadge({ supplier }) {
  const cfg = SUPPLIER_CONFIG[supplier] || {
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {supplier}
    </span>
  );
}

export default function Purchases() {
  const role = localStorage.getItem("role");

  const [purchases, setPurchases] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [expandedNote, setExpandedNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state

  const [form, setForm] = useState({
    supplier: "",
    product: "",
    sku: "",
    quantity: "",
    cost: "",
    purchaseDate: "",
    notes: "",
  });

  useEffect(() => {
    ensureFonts();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await apiFetch("/api/purchases");
      const data = await res.json();
      if (data.success) setPurchases(data.purchases);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchPurchases(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addPurchase = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `/api/purchases/${editingId}`
        : "/api/purchases";
      const method = editingId ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert(editingId ? "Purchase Updated ✅" : "Purchase Added ✅");
        setEditingId(null);
        setForm({ supplier: "", product: "", sku: "", quantity: "", cost: "", purchaseDate: "", notes: "" });
        fetchPurchases();
      }
    } catch (err) { console.log(err); }
  };

  const editPurchase = (item) => {
    setEditingId(item._id);
    setForm({ supplier: item.supplier, product: item.product, sku: item.sku, quantity: item.quantity, cost: item.cost, purchaseDate: item.purchaseDate, notes: item.notes || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletePurchase = async (id) => {
    if (!window.confirm("Delete Purchase?")) return;
    try {
      await apiFetch(`/api/purchases/${id}`, { method: "DELETE" });
      fetchPurchases();
    } catch (err) { console.log(err); }
  };

  const filteredPurchases = purchases.filter((item) => {
    const matchesSearch =
      item.product?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesSupplier = supplierFilter === "All" ? true : item.supplier === supplierFilter;
    return matchesSearch && matchesSupplier;
  });

  const totalPurchases = purchases.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const temuTotal = purchases.filter(i => i.supplier === "Temu").reduce((s, i) => s + Number(i.cost || 0), 0);
  const aliTotal = purchases.filter(i => i.supplier === "AliExpress").reduce((s, i) => s + Number(i.cost || 0), 0);

  if (role !== "admin") {
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

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: "#F8FAFC", fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
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
            <Sidebar />
          </div>
        </div>
      )}

      <div className="p-4 lg:p-8 max-w-[1300px]">

        {/* Top bar */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-500" style={{ fontFamily: "Sora, sans-serif" }}>
            Inventory Intake
          </span>
        </div>

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 text-white mb-8 shadow-lg"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-2xl"
            style={{ background: "rgba(244,180,0,0.18)" }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full blur-2xl"
            style={{ background: "rgba(37,99,235,0.18)" }}
          />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#F4B400" }}>Admin</p>
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Purchases</h1>
              <p className="mt-1.5 text-slate-400 text-sm max-w-sm">
                Track supplier orders, costs, and inventory intake.
              </p>
            </div>
            <div
              className="flex items-center gap-2 backdrop-blur-sm border rounded-2xl px-4 py-2.5"
              style={{ background: "rgba(244,180,0,0.12)", borderColor: "rgba(244,180,0,0.3)" }}
            >
              <span className="text-2xl font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>£{totalPurchases.toFixed(2)}</span>
              <span className="text-slate-300 text-sm leading-tight">Total<br />Spend</span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Orders", value: purchases.length, color: "text-slate-800", icon: "📦", gradient: "bg-gradient-to-br from-slate-50 to-blue-50" },
            { label: "Temu Spend", value: `£${temuTotal.toFixed(2)}`, color: "text-orange-500", icon: "🟠", gradient: "bg-gradient-to-br from-orange-50/60 to-amber-50/60" },
            { label: "AliExpress Spend", value: `£${aliTotal.toFixed(2)}`, color: "text-red-500", icon: "🔴", gradient: "bg-gradient-to-br from-red-50/60 to-rose-50/60" },
          ].map(({ label, value, color, icon, gradient }) => (
            <div key={label} className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{label}</span>
                  <span className="text-xl">{icon}</span>
                </div>
                <p className={`text-3xl font-bold tracking-tight tabular-nums ${color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search product or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200"
            />
          </div>

          <div className="flex gap-1.5">
            {["All", "Temu", "AliExpress"].map((s) => (
              <button
                key={s}
                onClick={() => setSupplierFilter(s)}
                className="text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-150"
                style={
                  supplierFilter === s
                    ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A", boxShadow: "0 4px 12px -2px rgba(244,180,0,0.4)" }
                    : { background: "#F1F5F9", color: "#64748B" }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors duration-200"
                    style={
                      editingId
                        ? { background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff" }
                        : { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }
                    }
                  >
                    {editingId ? "✏️" : "➕"}
                  </div>
                  <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
                    {editingId ? "Edit Purchase" : "New Purchase"}
                  </h2>
                </div>
                {editingId && (
                  <button
                    onClick={() => { setEditingId(null); setForm({ supplier: "", product: "", sku: "", quantity: "", cost: "", purchaseDate: "", notes: "" }); }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>

              <form onSubmit={addPurchase} className="space-y-3.5">
                {[
                  { name: "product", placeholder: "Product name", type: "text", required: true },
                  { name: "sku", placeholder: "SKU", type: "text" },
                  { name: "quantity", placeholder: "Quantity", type: "number", required: true },
                  { name: "cost", placeholder: "Cost (£)", type: "number", required: true },
                  { name: "purchaseDate", placeholder: "Purchase Date", type: "date", required: true },
                ].map(({ name, placeholder, type, required }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 capitalize">
                      {name === "purchaseDate" ? "Purchase Date" : name === "sku" ? "SKU" : name}
                    </label>
                    <input
                      type={type}
                      name={name}
                      placeholder={placeholder}
                      value={form[name]}
                      onChange={handleChange}
                      required={required}
                      className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Supplier</label>
                  <select
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200 cursor-pointer"
                  >
                    <option value="">Select Supplier</option>
                    <option value="Temu">Temu</option>
                    <option value="AliExpress">AliExpress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Optional notes…"
                    value={form.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-sm shadow-md active:scale-[0.98] transition-all duration-200"
                  style={
                    editingId
                      ? { background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff", boxShadow: "0 8px 20px -6px rgba(245,158,11,0.4)" }
                      : { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A", boxShadow: "0 8px 20px -6px rgba(244,180,0,0.4)" }
                  }
                >
                  {editingId ? "💾 Update Purchase" : "+ Add Purchase"}
                </button>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>Purchase Records</h2>
                <span className="text-xs text-slate-400 font-medium">{filteredPurchases.length} record{filteredPurchases.length !== 1 ? "s" : ""}</span>
              </div>

              {filteredPurchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-slate-500 text-sm font-medium">No purchases found.</p>
                  <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["Supplier", "Product", "SKU", "Qty", "Cost", "Date", "Notes", ""].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredPurchases.map((item) => (
                        <tr key={item._id} className="hover:bg-[#F4B400]/[0.05] transition-colors duration-100 group">
                          <td className="px-4 py-3">
                            <SupplierBadge supplier={item.supplier} />
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 max-w-[140px] truncate">
                            {item.product}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {item.sku || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-semibold text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            £{Number(item.cost).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                            {item.purchaseDate
                              ? new Date(item.purchaseDate).toLocaleDateString("en-GB")
                              : "—"}
                          </td>
                          <td className="px-4 py-3 max-w-[120px]">
                            {item.notes ? (
                              <div>
                                <button
                                  onClick={() => setExpandedNote(expandedNote === item._id ? null : item._id)}
                                  className="text-xs font-semibold transition-colors"
                                  style={{ color: "#2563EB" }}
                                >
                                  {expandedNote === item._id ? "Hide ▲" : "View ▼"}
                                </button>
                                {expandedNote === item._id && (
                                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-lg p-2 border border-slate-100">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300 italic">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <button
                                onClick={() => editPurchase(item)}
                                title="Edit"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-all duration-150 active:scale-95"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => deletePurchase(item._id)}
                                title="Delete"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all duration-150 active:scale-95"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) { .anim-slide-in { animation: none !important; } }
      `}</style>
    </div>
  );
}
