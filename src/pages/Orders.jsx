import EmployeeSidebar from "../components/EmployeeSidebar";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import {
  ShoppingBag,
  Search,
  Filter,
  UploadCloud,
  Pencil,
  Trash2,
  Calendar,
  Layers,
  Activity,
  DollarSign,
  TrendingUp,
  Percent,
  Truck,
  User,
  X
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    fetch("https://ebay-dashboard-z7h2.onrender.com/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));
  }, []);

  const editOrder = (order) => {
    setEditingOrder(order);
  };

  const saveEdit = async () => {
    try {
      const quantity = Number(editingOrder.quantity || 0);
      const costPrice = Number(editingOrder.costPrice || 0);
      const sellingPrice = Number(editingOrder.sellingPrice || 0);
      const ebayFee = Number(editingOrder.ebayFee || 0);
      const adFee = Number(editingOrder.adFee || 0);
      const deliveryCost = Number(editingOrder.deliveryCost || 0);

      const revenue = quantity * sellingPrice;
      const totalCost = quantity * costPrice + ebayFee + adFee + deliveryCost;
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;

      const updatedOrder = {
        ...editingOrder,
        revenue,
        profit,
        margin,
      };

      const response = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/orders/${editingOrder._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedOrder),
        }
      );

      const data = await response.json();

      setOrders(
        orders.map((order) =>
          order._id === data.order._id ? data.order : order
        )
      );

      setEditingOrder(null);
      alert("Order Updated Successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to update order");
    }
  };

  const deleteOrder = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/orders/${id}`,
        {
          method: "DELETE",
        }
      );

      setOrders(orders.filter((order) => order._id !== id));
    } catch (error) {
      console.log(error);
      alert("Failed to delete order");
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log(jsonData);
      await uploadOrders(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const uploadOrders = async (ordersData) => {
    try {
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/orders/bulk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ordersData),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Orders Imported Successfully");
        const res = await fetch(
          "https://ebay-dashboard-z7h2.onrender.com/api/orders"
        );
        const updatedOrders = await res.json();
        setOrders(updatedOrders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      order.sku?.toLowerCase().includes(search.toLowerCase()) ||
      order.product?.toLowerCase().includes(search.toLowerCase());

    const matchesSite = !siteFilter || order.site === siteFilter;
    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesSite && matchesStatus;
  });

  // Micro-Derivative Analytical Computations for High-Density Visibility
  const totalCount = filteredOrders.length;
  const metrics = filteredOrders.reduce(
    (acc, cur) => {
      acc.revenue += Number(cur.revenue || 0);
      acc.profit += Number(cur.profit || 0);
      return acc;
    },
    { revenue: 0, profit: 0 }
  );
  const aggregateMargin = metrics.revenue > 0 ? ((metrics.profit / metrics.revenue) * 100).toFixed(1) : 0;

  // Global Style Configuration Reference Variables
  const inputCls = "w-full px-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-800 placeholder:text-slate-400 font-medium";
  const selectCls = "px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-700 font-semibold cursor-pointer shadow-sm shadow-slate-100/50";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1";

  // Status Badge Component Router Matrix
  const renderStatusBadge = (status) => {
    const map = {
      Pending: "bg-amber-50 border-amber-200 text-amber-700",
      Packed: "bg-blue-50 border-blue-200 text-blue-700",
      Shipped: "bg-indigo-50 border-indigo-200 text-indigo-700",
      Delivered: "bg-emerald-50 border-emerald-200 text-emerald-700",
      Returned: "bg-purple-50 border-purple-200 text-purple-700",
      Cancelled: "bg-rose-50 border-rose-200 text-rose-700",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${map[status] || "bg-slate-50 border-slate-200 text-slate-600"}`}>
        {status || "Staged"}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <EmployeeSidebar />

      <div className="flex-1 ml-64 p-8 max-w-[1800px] mx-auto flex flex-col gap-6 w-full overflow-hidden">
        
        {/* Module Hero Header Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-14 translate-y-14 pointer-events-none">
            <ShoppingBag size={260} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                Multi-Channel Order Grid
              </h1>
              <p className="mt-1 text-violet-100/90 text-xs max-w-xl font-medium">
                Consolidate multi-site logic tracking arrays, ingest logistical data dumps, evaluate bottom-line margins, and parse structural item variables.
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Data Streaming Analytics Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Active Workspace Array</p>
              <h2 className="text-xl font-black mt-1 text-slate-900 tracking-tight">{totalCount} Units</h2>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-600">
              <Layers size={16} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Gross Volume Pipeline</p>
              <h2 className="text-xl font-black mt-1 text-slate-900 tracking-tight">£{metrics.revenue.toFixed(2)}</h2>
            </div>
            <div className="bg-violet-50 border border-violet-100 p-2.5 rounded-xl text-violet-600">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Net Retained Yield</p>
              <h2 className={`text-xl font-black mt-1 tracking-tight ${metrics.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                £{metrics.profit.toFixed(2)}
              </h2>
            </div>
            <div className={`p-2.5 rounded-xl border ${metrics.profit >= 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"}`}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Aggregated Margin Metric</p>
              <h2 className="text-xl font-black mt-1 text-indigo-600 tracking-tight">{aggregateMargin}%</h2>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-indigo-600">
              <Percent size={16} />
            </div>
          </div>
        </div>

        {/* Global Filter Toolbar & Data Pipeline Ingestion Controllers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm shadow-slate-100/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            
            {/* Context Search Engine Component */}
            <div className="relative min-w-[280px] flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Query Order ID, SKU, or Product ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} pl-9 py-2.5`}
              />
            </div>

            {/* Filter: Source Node Platform */}
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-slate-400 stroke-[2.5]" />
              <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className={selectCls}>
                <option value="">All Channels</option>
                <option value="TPS">TPS</option>
                <option value="Smartzone">Smartzone</option>
                <option value="Veluntra">Veluntra</option>
                <option value="Amazon">Amazon</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>

            {/* Filter: Operations Progress State */}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
              <option value="">All Progress States</option>
              <option value="Pending">Pending</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Integrated Bulk Spreadsheet Upload Form Action Trigger */}
          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 border-dashed hover:border-violet-400 hover:bg-violet-50/30 rounded-xl cursor-pointer text-xs font-bold text-slate-600 hover:text-violet-700 transition-all active:scale-[0.99] whitespace-nowrap">
            <UploadCloud size={14} className="stroke-[2.5]" />
            <span>Parse Excel Matrix Stream</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Master Transaction Ledger Display Component */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">Fulfillment Arrays Vector Real-time Sync</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 border px-2 py-0.5 rounded-md">
              BUFFER SIZE: {orders.length} ITEMS
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[2200px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3.5">Platform Channel</th>
                  <th className="px-4 py-3.5">Epoch Date</th>
                  <th className="px-4 py-3.5">Transaction Order ID</th>
                  <th className="px-4 py-3.5">System SKU Code</th>
                  <th className="px-3 py-3.5 text-center">Qty</th>
                  <th className="px-4 py-3.5">Unit Price</th>
                  <th className="px-4 py-3.5">Material Cost</th>
                  <th className="px-4 py-3.5">Gross Revenue</th>
                  <th className="px-4 py-3.5">Net Profit Node</th>
                  <th className="px-4 py-3.5">Logistics Waybill Tracking</th>
                  <th className="px-4 py-3.5">Fulfillment Status</th>
                  <th className="px-4 py-3.5">Courier Hub Code</th>
                  <th className="px-4 py-3.5">Accountable Operator</th>
                  <th className="px-4 py-3.5 text-center sticky right-0 bg-slate-50/90 backdrop-blur-sm shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)]">System Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="14" className="text-center py-16 text-slate-400 font-bold bg-white font-sans">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Activity size={24} className="text-slate-300 stroke-[2]" />
                        <span>Zero matched vector traces matching current logic filter state arrays.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-4 py-3.5 text-slate-900 font-black tracking-tight">{order.site}</td>
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap font-mono">{order.date || "-"}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-700 font-bold">{order.orderId}</td>
                    <td className="px-4 py-3.5"><span className="bg-slate-100 border text-slate-600 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">{order.sku}</span></td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-900">{order.quantity}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">£{Number(order.sellingPrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">£{Number(order.costPrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-800 font-bold">£{Number(order.revenue || 0).toFixed(2)}</td>
                    <td className={`px-4 py-3.5 font-mono font-bold ${Number(order.profit || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      £{Number(order.profit || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 max-w-[180px] truncate font-mono text-slate-400" title={order.trackingNo}>
                      {order.trackingNo || <span className="opacity-30">—</span>}
                    </td>
                    <td className="px-4 py-3.5">{renderStatusBadge(order.status)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{order.courierScanned || <span className="opacity-30">—</span>}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-md font-semibold text-[11px] inline-flex items-center gap-1">
                        <User size={10} className="stroke-[2.5]" />
                        {order.employeeName || order.employeeId || "Automated Platform Node"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center sticky right-0 bg-white group-hover:bg-slate-50/90 transition-all backdrop-blur-sm shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)]">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => editOrder(order)}
                          className="p-1.5 text-slate-500 bg-slate-50 border rounded-lg hover:bg-violet-50 hover:text-violet-700 transition-all"
                          title="Modify Record Configurations"
                        >
                          <Pencil size={12} className="stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="p-1.5 text-slate-500 bg-slate-50 border rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all"
                          title="Purge Document Instance"
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

      {/* Structural Micro-Form Multi-field Overlay Editor Modal */}
      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              
              {/* Modal Core Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                    <ShoppingBag size={16} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Edit Operational Metrics Record</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Vector Registry ID: <span className="font-mono font-bold text-slate-500">{editingOrder._id}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
                >
                  <X size={16} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Form Complex Fields Container Framework */}
              <div className="p-6 overflow-y-auto flex flex-col gap-5">
                
                {/* Partition Block I: Source Node Parameter Specifications */}
                <div>
                  <h3 className="text-[11px] font-black text-violet-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Layers size={11} /> 1. Channel Metadata Parameters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Source Site Node</label>
                      <input
                        type="text"
                        value={editingOrder.site || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, site: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. eBay Platform"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Unique Order ID</label>
                      <input
                        type="text"
                        value={editingOrder.orderId || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, orderId: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Platform Core SKU</label>
                      <input
                        type="text"
                        value={editingOrder.sku || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, sku: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Registry Ingestion Date</label>
                      <div className="relative">
                        <Calendar size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="date"
                          value={editingOrder.date ? editingOrder.date.split("T")[0] : ""}
                          onChange={(e) => setEditingOrder({ ...editingOrder, date: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Accountable Staff Operator</label>
                      <input
                        type="text"
                        value={editingOrder.employeeName || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, employeeName: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Lifecycle Progress Module State</label>
                      <select
                        value={editingOrder.status}
                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                        className={`${inputCls} cursor-pointer font-semibold`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Partition Block II: Ledger Accounting Variables */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-[11px] font-black text-violet-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <DollarSign size={11} /> 2. Granular Cost Calculation Vectors
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div>
                      <label className={labelCls}>Quantity Matrix Count</label>
                      <input
                        type="number"
                        value={editingOrder.quantity}
                        onChange={(e) => setEditingOrder({ ...editingOrder, quantity: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Sales Price (£)</label>
                      <input
                        type="number"
                        value={editingOrder.sellingPrice || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, sellingPrice: e.target.value })}
                        className={inputCls}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Unit Cost Price (£)</label>
                      <input
                        type="number"
                        value={editingOrder.costPrice || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, costPrice: e.target.value })}
                        className={inputCls}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Channel Broker Fee (£)</label>
                      <input
                        type="number"
                        value={editingOrder.ebayFee || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, ebayFee: e.target.value })}
                        className={inputCls}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Marketing Ad Premium (£)</label>
                      <input
                        type="number"
                        value={editingOrder.adFee || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, adFee: e.target.value })}
                        className={inputCls}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Fulfillment Handling Cost (£)</label>
                      <input
                        type="number"
                        value={editingOrder.deliveryCost || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, deliveryCost: e.target.value })}
                        className={inputCls}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Partition Block III: Logistical Parameters */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-[11px] font-black text-violet-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Truck size={11} /> 3. Logistical Distribution Tokens
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Waybill Tracking Identification Sequence</label>
                      <input
                        type="text"
                        value={editingOrder.trackingNo || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, trackingNo: e.target.value })}
                        className={`${inputCls} font-mono`}
                        placeholder="Tracking Token Index Strings"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Hub Scanning Identifier</label>
                      <input
                        type="text"
                        value={editingOrder.courierScanned || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, courierScanned: e.target.value })}
                        className={`${inputCls} font-mono`}
                        placeholder="Courier Metadata Label"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Execution Trigger Controls Panel */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  Abort Update
                </button>
                <button
                  onClick={saveEdit}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-md shadow-violet-600/10 active:scale-[0.98]"
                >
                  Commit Vector Ingestion
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}