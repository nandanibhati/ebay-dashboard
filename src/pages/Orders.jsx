import EmployeeSidebar from "../components/EmployeeSidebar";
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
      const response = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/orders/${editingOrder._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingOrder),
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
      XLSX.utils.sheet_to_json(worksheet);

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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <EmployeeSidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Orders
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search Order ID, SKU or Product"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border p-3 rounded-lg"
          />

          <select
            value={siteFilter}
            onChange={(e) =>
              setSiteFilter(e.target.value)
            }
            className="border p-3 rounded-lg"
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
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border p-3 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
        <div className="mb-6">
  <input
    type="file"
    accept=".xlsx,.xls"
    onChange={handleExcelUpload}
    className="border p-2 rounded"
  />
</div>

        {/* Edit Modal */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[500px]">
              <h2 className="text-xl font-bold mb-4">
                Edit Order
              </h2>

              <input
                type="text"
                value={editingOrder.product}
                onChange={(e) =>
                  setEditingOrder({
                    ...editingOrder,
                    product: e.target.value,
                  })
                }
                className="border p-3 rounded w-full mb-3"
              />
            

              <input
                type="number"
                value={editingOrder.quantity}
                onChange={(e) =>
                  setEditingOrder({
                    ...editingOrder,
                    quantity: e.target.value,
                  })
                }
                className="border p-3 rounded w-full mb-3"
              />

              <select
                value={editingOrder.status}
                onChange={(e) =>
                  setEditingOrder({
                    ...editingOrder,
                    status: e.target.value,
                  })
                }
                className="border p-3 rounded w-full mb-4"
              >
                <option value="Pending">
                  Pending
                </option>
                <option value="Packed">
                  Packed
                </option>
                <option value="Shipped">
                  Shipped
                </option>
                <option value="Delivered">
                  Delivered
                </option>
                <option value="Returned">
                  Returned
                </option>
              </select>

              <div className="flex gap-3">
                <button
                  onClick={saveEdit}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>

                <button
                  onClick={() =>
                    setEditingOrder(null)
                  }
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
          <table className="min-w-[2200px]">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="text-left py-3">Site</th>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Order ID</th>
                <th className="text-left py-3">SKU</th>
                <th className="text-left py-3">Product</th>
                <th className="text-left py-3">Qty</th>
                <th className="text-left py-3">Sales</th>
                <th className="text-left py-3">Cost</th>
                <th className="text-left py-3">Revenue</th>
                <th className="text-left py-3">Profit</th>
                <th className="text-left py-3">Tracking</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Courier</th>
                <th className="text-left py-3">Employee</th>
                <th className="text-left py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-slate-50"
                >
                  <td>{order.site}</td>
                  <td>{order.date}</td>
                  <td>{order.orderId}</td>
                  <td>{order.sku}</td>
                  <td
  className="max-w-[300px] truncate"
  title={order.product}
>
  {order.product}
</td>
                  <td>{order.quantity}</td>

                  <td>
                   £{Number(order.sellingPrice || 0).toFixed(2)}
                  </td>

                  <td>
                   £{Number(order.costPrice || 0).toFixed(2)}
                  </td>

                  <td>
                   £{Number(order.revenue || 0).toFixed(2)}
                  </td>

                 <td className="font-semibold text-green-600">
  £{Number(order.profit || 0).toFixed(2)}
</td>

                 <td
  className="max-w-[180px] truncate"
  title={order.tracking}
>
  {order.tracking}
</td>

                  <td>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      {order.status}
                    </span>
                  </td>

                  <td>
                    {order.courierScanned}
                  </td>

                  <td>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {order.employeeName ||
                        order.employeeId}
                    </span>
                  </td>

                 <td className="min-w-[120px]">
  <div className="flex gap-2">
    <button
      onClick={() => editOrder(order)}
      className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200"
      title="Edit"
    >
      <FaEdit size={14} />
    </button>

    <button
      onClick={() => deleteOrder(order._id)}
      className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
      title="Delete"
    >
      <FaTrash size={14} />
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500">
            Total Orders
          </h3>

          <p className="text-3xl font-bold mt-2">
            {filteredOrders.length}
          </p>
        </div>
      </div>
    </div>
  );
}