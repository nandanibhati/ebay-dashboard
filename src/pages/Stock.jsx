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
  RefreshCw
} from "lucide-react";

export default function Stock() {
  const role = localStorage.getItem("role");
  const [stock, setStock] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const employeeName = localStorage.getItem("employeeName") || "Unknown";

  const [form, setForm] = useState({
    sku: "",
    product: "",
    quantity: "",
    masterSku: "",
    packQty: 1,
    minimumStock: 5,
  });

  useEffect(() => {
    fetch("https://ebay-dashboard-z7h2.onrender.com/api/stock")
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
        ? `https://ebay-dashboard-z7h2.onrender.com/api/stock/${editingId}`
        : "https://ebay-dashboard-z7h2.onrender.com/api/stock";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
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
      await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/stock/${id}`, {
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
      masterSku: item.masterSku || "",
      packQty: item.packQty || 1,
      minimumStock: item.minimumStock || 5,
    });
  };

  // Real-time Inventory Micro-Metrics Calculations
  const metrics = useMemo(() => {
    const totalSkus = stock.length;
    const lowStockCount = stock.filter((item) => item.quantity <= 5).length;
    const healthyStockCount = totalSkus - lowStockCount;
    return { totalSkus, lowStockCount, healthyStockCount };
  }, [stock]);

  // Unified Workspace Styling Architecture Specs
  const inputCls = "w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 placeholder:text-slate-400 font-medium";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {role === "admin" ? <Sidebar /> : <EmployeeSidebar />}

      <div className="flex-1 ml-64 p-8 max-w-[1800px] mx-auto flex flex-col gap-6 w-full overflow-hidden">
        
        {/* Module Hero Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none">
            <Package size={240} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                Stock Management Matrix
              </h1>
              <p className="mt-1 text-blue-100/90 text-xs max-w-xl font-medium">
                Map product architectures to parent Master SKUs, audit warehouse volume counts, configure defensive reorder points, and manage catalog data.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ sku: "", product: "", quantity: "", masterSku: "", packQty: 1, minimumStock: 5 });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all text-white backdrop-blur-sm self-start sm:self-center"
              >
                <RotateCcw size={13} />
                <span>Reset Structural Editor</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Storage Vector KPI Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Catalog Track Vectors</p>
              <h2 className="text-xl font-black mt-1 text-slate-900 tracking-tight">{metrics.totalSkus} SKUs Listed</h2>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-600">
              <Layers size={16} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Deficient Stock Warnings</p>
              <h2 className={`text-xl font-black mt-1 tracking-tight ${metrics.lowStockCount > 0 ? "text-rose-600 animate-pulse" : "text-slate-900"}`}>
                {metrics.lowStockCount} Units At Risk
              </h2>
            </div>
            <div className={`p-2.5 rounded-xl border ${metrics.lowStockCount > 0 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Optimized Store Reserves</p>
              <h2 className="text-xl font-black mt-1 text-emerald-600 tracking-tight">{metrics.healthyStockCount} Stable Profiles</h2>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
        </div>

        {/* Unified Record Ingestion / Update Console */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <div className={`p-1.5 rounded-lg ${editingId ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
              {editingId ? <RefreshCw size={14} className="animate-spin" /> : <PlusCircle size={14} />}
            </div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {editingId ? "Modify Existing Storage Instance" : "Ingest New Inventory Record"}
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
                className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-[0.99] w-full sm:w-auto ${
                  editingId
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/10 hover:from-amber-600 hover:to-orange-600"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-600/10 hover:from-blue-500 hover:to-indigo-500"
                }`}
              >
                {editingId ? "Commit Instance Mutations" : "Insert Active Stock Item"}
              </button>
            </div>
          </form>
        </div>

        {/* Master Stock Ledger Array Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/10 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">Storage Arrays Vector Logs</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 border px-2 py-0.5 rounded-md">
              CATALOG POOL SIZE: {stock.length} NODES
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1100px] table-fixed">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="w-48 px-6 py-3.5">Listing SKU Target</th>
                  <th className="px-6 py-3.5">Structural Item Label</th>
                  <th className="w-32 px-4 py-3.5 text-center">Quantities</th>
                  <th className="w-36 px-4 py-3.5 text-center">Threat Status</th>
                  <th className="w-48 px-4 py-3.5 text-center">Mutated Operator</th>
                  <th className="w-28 px-6 py-3.5 text-center sticky right-0 bg-slate-50/90 backdrop-blur-sm shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {stock.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-slate-400 font-bold bg-white">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Boxes size={24} className="text-slate-300" />
                        <span>Empty storage grid tracking registry array data lines.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {stock.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-3.5">
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
                        {item.sku}
                      </span>
                    </td>
                    
                    <td className="px-6 py-3.5 text-slate-800 font-bold truncate pr-4" title={item.product}>
                      {item.product}
                    </td>

                    <td className={`px-4 py-3.5 text-center font-mono font-black text-sm ${item.quantity <= 5 ? "text-rose-600" : "text-emerald-600"}`}>
                      {item.quantity}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {item.quantity <= 5 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border bg-rose-50 border-rose-200 text-rose-700 font-mono">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border bg-emerald-50 border-emerald-200 text-emerald-700 font-mono">
                          IN STOCK
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-semibold text-[11px] inline-flex items-center gap-1">
                        <User size={10} className="stroke-[2.5]" />
                        {item.updatedBy || "Automated Matrix System"}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-center sticky right-0 bg-white group-hover:bg-slate-50/90 transition-all backdrop-blur-sm shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)]">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editStock(item)}
                          className="p-1.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                          title="Edit Line Item"
                        >
                          <Edit3 size={12} className="stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStock(item._id)}
                          className="p-1.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                          title="Purge Stock Node"
                        >
                          <Trash2 size={12} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}