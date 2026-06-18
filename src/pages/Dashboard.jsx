import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(
      "https://ebay-dashboard-z7h2.onrender.com/api/orders"
    )
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));
  }, []);

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + Number(order.revenue || 0),
    0
  );

  const totalProfit = orders.reduce(
    (sum, order) =>
      sum + Number(order.profit || 0),
    0
  );

  const avgMargin =
    orders.length > 0
      ? (
          orders.reduce(
            (sum, order) =>
              sum + Number(order.margin || 0),
            0
          ) / orders.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Sales & Profit Overview
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          <StatCard
            title="Total Revenue"
            value={`£${totalRevenue.toFixed(2)}`}
          />

          <StatCard
            title="Total Profit"
            value={`£${totalProfit.toFixed(2)}`}
          />

          <StatCard
            title="Orders"
            value={orders.length}
          />

          <StatCard
            title="Avg Margin"
            value={`${avgMargin}%`}
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Recent Orders
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-100">
                <th className="text-left py-3 px-4">
                  Date
                </th>

                <th className="text-left py-3 px-4">
                  Employee
                </th>

                <th className="text-left py-3 px-4">
                  Order ID
                </th>

                <th className="text-left py-3 px-4">
                  SKU
                </th>

                <th className="text-left py-3 px-4">
                  Profit
                </th>
              </tr>
            </thead>

            <tbody>
              {orders
                .slice(-5)
                .reverse()
                .map((order) => (
                  <tr
                    key={order._id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="py-3 px-4">
                      {order.date || "-"}
                    </td>

                    <td className="px-4">
                      {order.employeeName ||
                        "-"}
                    </td>

                    <td className="px-4">
                      {order.orderId}
                    </td>

                    <td className="px-4">
                      {order.sku}
                    </td>

                    <td className="px-4 font-semibold text-green-600">
                      £
                      {Number(
                        order.profit || 0
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}