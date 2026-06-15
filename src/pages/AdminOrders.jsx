
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));
  }, []);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.revenue || 0),
    0
  );

  const totalProfit = orders.reduce(
    (sum, order) => sum + (order.profit || 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            Orders Management
          </h1>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Export Report
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="text-left py-3">Order ID</th>
                <th className="text-left py-3">SKU</th>
                <th className="text-left py-3">Product</th>
                <th className="text-left py-3">Qty</th>
                <th className="text-left py-3">Employee</th>
                <th className="text-left py-3">Revenue</th>
                <th className="text-left py-3">Profit</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="py-4 font-medium">
                    {order.orderId}
                  </td>

                  <td>{order.sku}</td>

                  <td>{order.product}</td>

                  <td>{order.quantity}</td>

                  <td>{order.employeeId}</td>

                  <td className="text-green-600 font-semibold">
                    £{order.revenue}
                  </td>

                  <td className="text-purple-600 font-semibold">
                    £{order.profit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-5 mt-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500">
              Total Orders
            </h3>

            <p className="text-3xl font-bold mt-2">
              {orders.length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500">
              Total Revenue
            </h3>

            <p className="text-3xl font-bold mt-2 text-green-600">
              £{totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500">
              Total Profit
            </h3>

            <p className="text-3xl font-bold mt-2 text-purple-600">
              £{totalProfit.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
