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
      const quantity = Number(
        editingOrder.quantity || 0
      );

      const costPrice = Number(
        editingOrder.costPrice || 0
      );

      const sellingPrice = Number(
        editingOrder.sellingPrice || 0
      );

      const ebayFee = Number(
        editingOrder.ebayFee || 0
      );

      const adFee = Number(
        editingOrder.adFee || 0
      );

      const deliveryCost = Number(
        editingOrder.deliveryCost || 0
      );

      const revenue =
        quantity * sellingPrice;

      const totalCost =
        quantity * costPrice +
        ebayFee +
        adFee +
        deliveryCost;

      const profit = revenue - totalCost;

      const margin =
        revenue > 0
          ? ((profit / revenue) * 100).toFixed(2)
          : 0;

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
          order._id === data.order._id
            ? data.order
            : order
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

      setOrders(
        orders.filter((order) => order._id !== id)
      );
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

      const workbook = XLSX.read(data, {
        type: "binary",
      });

      const sheetName = workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const jsonData =
        XXLSX.utils.sheet_to_json(worksheet);

      console.log(jsonData);

      await uploadOrders(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const uploadOrders = async (orders) => {
    try {
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/orders/bulk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orders),
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
      order.orderId
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      order.sku
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      order.product
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesSite =
      !siteFilter || order.site === siteFilter;

    const matchesStatus =
      !statusFilter || order.status === statusFilter;

    return (
      matchesSearch &&
      matchesSite &&
      matchesStatus
    );
  });

  // Structural Input Class Styles For Uniformity
  const filterInputCls = "px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-700 placeholder:text-slate-400 shadow-sm shadow-slate-100/50";
  const modalInputCls = "w-full px-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="ml-64 p-8 w-[calc(100%-16rem)] max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orders Registry</h1>
            <p className="text-slate-400 text-xs mt-1">Manage, filter, and modify live marketplace operational logistics.</p>
          </div>
          
          {/* File Upload Row integrated cleanly into header */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2 shadow-sm shadow-slate-100/50">
            <span className="text-xs font-bold text-slate-500 pl-2 uppercase tracking-wider select-none">Bulk Import:</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 file:cursor-pointer cursor-pointer focus:outline-none"
            />
          </div>
        </div>

        {/* Action / Filters Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl shadow-inner shadow-slate-100/40">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <input
              type="text"
              placeholder="Search Order ID, SKU or Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${filterInputCls} min-w-[280px] flex-1 sm:flex-none`}
            />

            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className={`${filterInputCls} cursor-pointer min-w-[140px]`}
            >
              <option value="">All Marketplaces</option>
              <option value="TPS">TPS</option>
              <option value="Smartzone">Smartzone</option>
              <option value="Veluntra">Veluntra</option>
              <option value="Amazon">Amazon</option>
              <option value="TikTok">TikTok</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${filterInputCls} cursor-pointer min-w-[140px]`}
            >
              <option value="">All Fulfillment Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Inline Summary Count Card */}
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm shadow-slate-100/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtered Volume</span>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-sm font-black text-slate-800">{filteredOrders.length} records</span>
          </div>
        </div>

        {/* Main Data Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/30 overflow-hidden w-full">
          <div className="overflow-x-auto w-full max-h-[65vh] scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 sticky top-0 backdrop-blur-sm z-10">
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-4">Site</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Date</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Order ID</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4">SKU</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4 text-center">Qty</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Sales</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Cost</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Revenue</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Profit</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Tracking</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Status</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4 text-center">Courier</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Employee</th>
                  <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900">{order.site}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{order.date}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600 tracking-tight">{order.orderId}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{order.sku}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-800">{order.quantity}</td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium">£{Number(order.sellingPrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-slate-500">£{Number(order.costPrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium">£{Number(order.revenue || 0).toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600 bg-emerald-50/20">
                      £{Number(order.profit || 0).toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-3.5 max-w-[160px] truncate font-mono text-xs text-slate-400 group-hover:text-slate-600 transition-colors"
                      title={order.trackingNo}
                    >
                      {order.trackingNo || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase ${
                          order.status === "Cancelled"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : order.status === "Delivered"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : order.status === "Shipped"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : order.status === "Packed"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${order.courierScanned === 'Yes' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                        {order.courierScanned || "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm">
                        {order.employeeName || order.employeeId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => editOrder(order)}
                          className="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-violet-50 hover:text-violet-600 transition-all border border-slate-200/60 shadow-sm"
                          title="Edit Operational Metrics"
                        >
                          <FaEdit size={13} />
                        </button>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="bg-slate-100 text-slate-500 p-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-200/60 shadow-sm"
                          title="Purge Order Record"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Overview Meta Box at bottom */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Inventory Ledger System</span>
          </div>
          <span className="text-xs text-slate-400">Showing {filteredOrders.length} of {orders.length} gross ledger lines</span>
        </div>

        {/* Edit Modal Refactored for clean structured data inputs */}
        {editingOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 max-h-[90vh] flex flex-col">
              
              {/* Modal Head */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Modify Order Logistics</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Order Target: <span className="font-mono font-bold text-slate-600">{editingOrder.orderId}</span></p>
                </div>
                <button 
                  onClick={() => setEditingOrder(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold bg-slate-200/50 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Modal Fields Grid Wrapper */}
              <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Marketplace Site</label>
                  <input
                    type="text"
                    placeholder="Site"
                    value={editingOrder.site || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, site: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Reference Key</label>
                  <input
                    type="text"
                    placeholder="Order ID"
                    value={editingOrder.orderId || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, orderId: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product SKU Identification</label>
                  <input
                    type="text"
                    placeholder="SKU"
                    value={editingOrder.sku || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, sku: e.target.value })}
                    className={modalInputCls}
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timestamp Date</label>
                  <input
                    type="date"
                    value={editingOrder.date}
                    onChange={(e) => setEditingOrder({ ...editingOrder, date: e.target.value })}
                    className={modalInputCls}
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Volume (Quantity)</label>
                  <input
                    type="number"
                    value={editingOrder.quantity}
                    onChange={(e) => setEditingOrder({ ...editingOrder, quantity: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales Price (£)</label>
                  <input
                    type="number"
                    placeholder="Sales"
                    value={editingOrder.sellingPrice || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, sellingPrice: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supplier Unit Cost (£)</label>
                  <input
                    type="number"
                    placeholder="Cost"
                    value={editingOrder.costPrice || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, costPrice: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">eBay Platform Surcharge (£)</label>
                  <input
                    type="number"
                    placeholder="eBay Fee"
                    value={editingOrder.ebayFee || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, ebayFee: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Marketing / Ad Surcharge (£)</label>
                  <input
                    type="number"
                    placeholder="Ad Fee"
                    value={editingOrder.adFee || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, adFee: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Courier Shipping Outlay (£)</label>
                  <input
                    type="number"
                    placeholder="Delivery Cost"
                    value={editingOrder.deliveryCost || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, deliveryCost: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Courier Tracking String</label>
                  <input
                    type="text"
                    placeholder="Tracking"
                    value={editingOrder.trackingNo || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, trackingNo: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Courier Hub Scan Verified?</label>
                  <input
                    type="text"
                    placeholder="Courier"
                    value={editingOrder.courierScanned || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, courierScanned: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned System Operator</label>
                  <input
                    type="text"
                    placeholder="Employee Name"
                    value={editingOrder.employeeName || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, employeeName: e.target.value })}
                    className={modalInputCls}
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment Execution Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-700 cursor-pointer shadow-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
              </div>
              
              {/* Modal Actions Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 active:scale-[0.98] transition-all"
                >
                  Discard Changes
                </button>
                <button
                  onClick={saveEdit}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-violet-600/10"
                >
                  Save Metrics
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}