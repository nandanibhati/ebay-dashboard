import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";

export default function Analytics() {
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

  const highestMargin =
    orders.length > 0
      ? Math.max(
          ...orders.map((o) =>
            Number(o.margin || 0)
          )
        ).toFixed(2)
      : 0;

  const topProduct =
    orders.length > 0
      ? orders.reduce((a, b) =>
          Number(a.quantity || 0) >
          Number(b.quantity || 0)
            ? a
            : b
        ).sku
      : "-";

  const employeeCounts = {};

  orders.forEach((order) => {
    const name =
      order.employeeName || "Unknown";

    employeeCounts[name] =
      (employeeCounts[name] || 0) + 1;
  });

  const topEmployee =
    Object.keys(employeeCounts).length > 0
      ? Object.keys(employeeCounts).reduce(
          (a, b) =>
            employeeCounts[a] >
            employeeCounts[b]
              ? a
              : b
        )
      : "-";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Business Analytics
        </h1>

        <div className="grid md:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Total Orders
            </h3>

            <p className="text-3xl font-bold mt-3">
              {orders.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Top Product
            </h3>

            <p className="text-xl font-bold mt-3">
              {topProduct}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Highest Margin
            </h3>

            <p className="text-3xl font-bold mt-3 text-green-600">
              {highestMargin}%
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Top Employee
            </h3>

            <p className="text-xl font-bold mt-3">
              {topEmployee}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Total Revenue
            </h3>

            <p className="text-3xl font-bold mt-3 text-green-600">
              £{totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Total Profit
            </h3>

            <p className="text-3xl font-bold mt-3 text-purple-600">
              £{totalProfit.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow mt-8 p-6">
          <h2 className="text-xl font-bold mb-4">
            Latest Orders Analysis
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">
                  Order ID
                </th>

                <th className="text-left py-3">
                  Employee
                </th>

                <th className="text-left py-3">
                  Revenue
                </th>

                <th className="text-left py-3">
                  Profit
                </th>

                <th className="text-left py-3">
                  Margin
                </th>
              </tr>
            </thead>

            <tbody>
              {orders
                .slice(-10)
                .reverse()
                .map((order) => (
                  <tr
                    key={order._id}
                    className="border-b"
                  >
                    <td className="py-3">
                      {order.orderId}
                    </td>

                    <td>
                      {order.employeeName}
                    </td>

                    <td>
                      £
                      {Number(
                        order.revenue || 0
                      ).toFixed(2)}
                    </td>

                    <td className="text-green-600">
                      £
                      {Number(
                        order.profit || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      {Number(
                        order.margin || 0
                      ).toFixed(2)}
                      %
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