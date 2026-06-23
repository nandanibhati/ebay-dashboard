import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

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

  const [form, setForm] = useState({
    supplier: "",
    product: "",
    sku: "",
    quantity: "",
    cost: "",
    purchaseDate: "",
    notes: "",
  });

  const fetchPurchases = async () => {
    try {
      const res = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/purchases");
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
        ? `https://ebay-dashboard-z7h2.onrender.com/api/purchases/${editingId}`
        : "https://ebay-dashboard-z7h2.onrender.com/api/purchases";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
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
      await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/purchases/${id}`, { method: "DELETE" });
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
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />

      <div className="flex-1 ml-64 p-8 max-w-[1300px]">

        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-3xl p-8 text-white mb-8 shadow-lg">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-indigo-400/30 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
              <h1 className="text-3xl font-extrabold tracking-tight">Purchases 🛒</h1>
              <p className="mt-1.5 text-blue-100 text-sm max-w-sm">
                Track supplier orders, costs, and inventory intake.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5">
              <span className="text-2xl font-extrabold">£{totalPurchases.toFixed(2)}</span>
              <span className="text-blue-100 text-sm leading-tight">Total<br />Spend</span>
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
                <p className={`text-3xl font-extrabold tracking-tight ${color}`}>{value}</p>
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
              className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex gap-1.5">
            {["All", "Temu", "AliExpress"].map((s) => (
              <button
                key={s}
                onClick={() => setSupplierFilter(s)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-150 ${
                  supplierFilter === s
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
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
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm transition-colors duration-200 ${editingId ? "bg-amber-500" : "bg-blue-600"}`}>
                    {editingId ? "✏️" : "➕"}
                  </div>
                  <h2 className="text-base font-bold text-slate-800">
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
                      className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
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
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
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
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full text-white py-3 rounded-xl font-semibold text-sm shadow-md active:scale-[0.98] transition-all duration-200 ${
                    editingId
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-200"
                      : "bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-blue-200"
                  }`}
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
                <h2 className="text-base font-bold text-slate-800">Purchase Records</h2>
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
                        <tr key={item._id} className="hover:bg-slate-50/70 transition-colors duration-100 group">
                          <td className="px-4 py-3">
                            <SupplierBadge supplier={item.supplier} />
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 max-w-[140px] truncate">
                            {item.product}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                            {item.sku || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-semibold text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
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
                                  className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition-colors"
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
    </div>
  );
}
