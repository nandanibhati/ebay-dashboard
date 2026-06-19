import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";

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
      const updatedOrder = { ...editingOrder, revenue, profit, margin };

      const response = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/orders/${editingOrder._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedOrder),
        }
      );

      const data = await response.json();
      setOrders(orders.map((order) => (order._id === data.order._id ? data.order : order)));
      setEditingOrder(null);
      alert("Order Updated Successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to update order");
    }
  };

  const deleteOrder = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;
    try {
      await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/orders/${id}`, { method: "DELETE" });
      setOrders(orders.filter((order) => order._id !== id));
    } catch (error) {
      console.log(error);
      alert("Failed to delete order");
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
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

  const uploadOrders = async (orders) => {
    try {
      const response = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orders),
      });
      const data = await response.json();
      if (data.success) {
        alert("Orders Imported Successfully");
        const res = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/orders");
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

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const packedCount = orders.filter((o) => o.status === "Packed").length;
  const shippedCount = orders.filter((o) => o.status === "Shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const cancelledCount = orders.filter((o) => o.status === "Cancelled").length;
  const returnedCount = orders.filter((o) => o.status === "Returned").length;
  const courierScannedCount = orders.filter((o) => o.courierScanned === "Yes").length;

  const totalRevenue = filteredOrders.reduce((acc, cur) => acc + Number(cur.revenue || 0), 0);
  const totalProfit = filteredOrders.reduce((acc, cur) => acc + Number(cur.profit || 0), 0);
  const aggregateMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  const statusConfig = {
    Pending: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 ring-amber-200" },
    Packed: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 ring-blue-200" },
    Shipped: { dot: "bg-indigo-400", badge: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
    Delivered: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    Returned: { dot: "bg-purple-400", badge: "bg-purple-50 text-purple-700 ring-purple-200" },
    Cancelled: { dot: "bg-rose-400", badge: "bg-rose-50 text-rose-700 ring-rose-200" },
  };

  const inputCls =
    "w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-slate-800 placeholder:text-slate-400 hover:border-slate-300";

  const labelCls = "block text-xs font-semibold text-slate-500 mb-1.5";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-violet-50/40">
      <Sidebar />

      <div className="ml-64 flex-1 p-6 lg:p-8 max-w-[1800px] space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          @keyframes rowIn { from { opacity: 0; } to { opacity: 1; } }
          .row-anim { animation: rowIn 0.3s ease-out; }
        `}</style>

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {orders.length} total orders across all channels
            </p>
          </div>
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] text-white text-sm font-semibold rounded-xl cursor-pointer transition-all duration-200 shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:-translate-y-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
          </label>
        </div>

        {/* ── Summary Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Filtered Orders",
              value: `${filteredOrders.length}`,
              sub: "currently shown",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              ),
              color: "text-slate-700",
              bg: "bg-slate-100",
              ring: "hover:ring-slate-200",
            },
            {
              label: "Revenue",
              value: `£${totalRevenue.toFixed(2)}`,
              sub: "gross sales",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              ),
              color: "text-violet-700",
              bg: "bg-violet-100",
              ring: "hover:ring-violet-200",
            },
            {
              label: "Net Profit",
              value: `£${totalProfit.toFixed(2)}`,
              sub: "after all costs",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              ),
              color: totalProfit >= 0 ? "text-emerald-700" : "text-rose-600",
              bg: totalProfit >= 0 ? "bg-emerald-100" : "bg-rose-100",
              ring: totalProfit >= 0 ? "hover:ring-emerald-200" : "hover:ring-rose-200",
            },
            {
              label: "Avg. Margin",
              value: `${aggregateMargin}%`,
              sub: "profit margin",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
              ),
              color: "text-indigo-700",
              bg: "bg-indigo-100",
              ring: "hover:ring-indigo-200",
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`bg-white rounded-2xl border border-slate-200/70 p-5 flex items-center gap-4 shadow-sm hover:shadow-md ring-4 ring-transparent ${m.ring} transition-all duration-300 hover:-translate-y-0.5`}
            >
              <div className={`${m.bg} ${m.color} p-3 rounded-xl flex-shrink-0`}>{m.icon}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{m.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${m.color} truncate`}>{m.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{m.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Status Pipeline ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Pending", count: pendingCount, dot: "bg-amber-400", ring: "ring-amber-100", num: "text-amber-700" },
            { label: "Packed", count: packedCount, dot: "bg-orange-400", ring: "ring-orange-100", num: "text-orange-700" },
            { label: "Shipped", count: shippedCount, dot: "bg-blue-400", ring: "ring-blue-100", num: "text-blue-700" },
            { label: "Delivered", count: deliveredCount, dot: "bg-emerald-400", ring: "ring-emerald-100", num: "text-emerald-700" },
            { label: "Cancelled", count: cancelledCount, dot: "bg-rose-400", ring: "ring-rose-100", num: "text-rose-700" },
            { label: "Returned", count: returnedCount, dot: "bg-purple-400", ring: "ring-purple-100", num: "text-purple-700" },
            { label: "Scanned", count: courierScannedCount, dot: "bg-slate-400", ring: "ring-slate-100", num: "text-slate-700" },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-white border border-slate-200/70 rounded-2xl p-4 shadow-sm ring-4 ${s.ring} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                <p className="text-xs font-semibold text-slate-500 truncate">{s.label}</p>
              </div>
              <p className={`text-2xl font-black ${s.num}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* ── Filters Bar ── */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search by Order ID, SKU or Product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-slate-700 font-medium cursor-pointer hover:bg-white"
          >
            <option value="">All Sites</option>
            <option value="TPS">TPS</option>
            <option value="Smartzone">Smartzone</option>
            <option value="Veluntra">Veluntra</option>
            <option value="Amazon">Amazon</option>
            <option value="TikTok">TikTok</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-slate-700 font-medium cursor-pointer hover:bg-white"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Returned">Returned</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {(search || siteFilter || statusFilter) && (
            <button
              onClick={() => { setSearch(""); setSiteFilter(""); setStatusFilter(""); }}
              className="px-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors duration-200 active:scale-[0.97]"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Orders Table ── */}
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-slate-600">Live Orders</span>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
              {filteredOrders.length} / {orders.length} shown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1400px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Site", "Date", "Order ID", "SKU", "Qty", "Unit Price", "Cost", "Revenue", "Profit", "Tracking", "Status", "Courier", "Employee", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="14" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="p-4 bg-slate-50 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                        <p className="text-sm font-medium text-slate-500">No orders match your filters</p>
                        <p className="text-xs">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredOrders.map((order) => {
                  const sc = statusConfig[order.status] || { dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 ring-slate-200" };
                  const profit = Number(order.profit || 0);
                  return (
                    <tr key={order._id} className="row-anim hover:bg-violet-50/40 transition-colors duration-150 group">
                      <td className="px-4 py-3 font-bold text-slate-900 text-sm whitespace-nowrap">{order.site}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                        {order.date ? new Date(order.date).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-slate-700 whitespace-nowrap">{order.orderId}</td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-xs font-semibold">
                          {order.sku}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-mono font-bold text-slate-800">{order.quantity}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-600">£{Number(order.sellingPrice || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-400">£{Number(order.costPrice || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-mono font-bold text-slate-800">£{Number(order.revenue || 0).toFixed(2)}</td>
                      <td className={`px-4 py-3 text-sm font-mono font-bold ${profit >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        £{profit.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 max-w-[160px] truncate font-mono text-xs text-slate-400" title={order.trackingNo}>
                        {order.trackingNo || <span className="opacity-30">—</span>}
                      </td>
                      {/* Status inline select */}
                      <td className="px-4 py-3">
                        <select
                          value={order.status || "Pending"}
                          onChange={async (e) => {
                            const updatedStatus = e.target.value;
                            await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/orders/${order._id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ...order, status: updatedStatus }),
                            });
                            setOrders(orders.map((o) => (o._id === order._id ? { ...o, status: updatedStatus } : o)));
                          }}
                          className={`text-xs font-semibold px-2 py-1.5 rounded-lg border outline-none cursor-pointer ring-1 transition-all duration-200 hover:shadow-sm ${sc.badge} ${sc.dot.replace("bg-", "border-")}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Returned">Returned</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Courier inline select */}
                      <td className="px-4 py-3">
                        <select
                          value={order.courierScanned || "No"}
                          onChange={async (e) => {
                            const courierValue = e.target.value;
                            await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/orders/${order._id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ...order, courierScanned: courierValue }),
                            });
                            setOrders(orders.map((o) => (o._id === order._id ? { ...o, courierScanned: courierValue } : o)));
                          }}
                          className={`text-xs font-semibold px-2 py-1.5 rounded-lg border outline-none cursor-pointer transition-all duration-200 hover:shadow-sm ${
                            (order.courierScanned || "No") === "Yes"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-lg text-xs font-semibold">
                          {order.employeeName || order.employeeId || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => editOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-100 rounded-lg transition-all duration-150 hover:scale-110"
                            title="Edit"
                          >
                            <FaEdit size={13} />
                          </button>
                          <button
                            onClick={() => deleteOrder(order._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all duration-150 hover:scale-110"
                            title="Delete"
                          >
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editingOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            style={{ animation: "modalIn 0.2s ease-out" }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50/70 to-white">
              <div>
                <h2 className="text-base font-bold text-slate-900">Edit Order</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{editingOrder._id}</p>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-150 hover:rotate-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Section 1: Channel Info */}
              <div>
                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-3">Channel & Identity</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Site</label>
                    <input type="text" value={editingOrder.site || ""} onChange={(e) => setEditingOrder({ ...editingOrder, site: e.target.value })} className={inputCls} placeholder="e.g. eBay" />
                  </div>
                  <div>
                    <label className={labelCls}>Order ID</label>
                    <input type="text" value={editingOrder.orderId || ""} onChange={(e) => setEditingOrder({ ...editingOrder, orderId: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>SKU</label>
                    <input type="text" value={editingOrder.sku || ""} onChange={(e) => setEditingOrder({ ...editingOrder, sku: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Date</label>
                    <input type="date" value={editingOrder.date ? editingOrder.date.split("T")[0] : ""} onChange={(e) => setEditingOrder({ ...editingOrder, date: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Employee</label>
                    <input type="text" value={editingOrder.employeeName || ""} onChange={(e) => setEditingOrder({ ...editingOrder, employeeName: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={editingOrder.status} onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })} className={inputCls + " cursor-pointer"}>
                      <option value="Pending">Pending</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Financials */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-3">Costs & Pricing</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Quantity", key: "quantity", ph: "" },
                    { label: "Selling Price (£)", key: "sellingPrice", ph: "0.00" },
                    { label: "Cost Price (£)", key: "costPrice", ph: "0.00" },
                    { label: "Platform Fee (£)", key: "ebayFee", ph: "0.00" },
                    { label: "Ad Fee (£)", key: "adFee", ph: "0.00" },
                    { label: "Delivery Cost (£)", key: "deliveryCost", ph: "0.00" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className={labelCls}>{f.label}</label>
                      <input
                        type="number"
                        value={editingOrder[f.key] || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, [f.key]: e.target.value })}
                        className={inputCls + " font-mono"}
                        placeholder={f.ph}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Logistics */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-3">Logistics</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Tracking Number</label>
                    <input type="text" value={editingOrder.trackingNo || ""} onChange={(e) => setEditingOrder({ ...editingOrder, trackingNo: e.target.value })} className={inputCls + " font-mono"} placeholder="Enter tracking…" />
                  </div>
                  <div>
                    <label className={labelCls}>Courier Scanned</label>
                    <input type="text" value={editingOrder.courierScanned || ""} onChange={(e) => setEditingOrder({ ...editingOrder, courierScanned: e.target.value })} className={inputCls + " font-mono"} placeholder="Yes / No" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
              <button
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-150 active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl transition-all duration-200 shadow-md shadow-violet-600/25 hover:shadow-lg hover:shadow-violet-600/35 active:scale-[0.97]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
