
import EmployeeSidebar from "../components/EmployeeSidebar";
import { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("https://ebay-dashboard-z7h2.onrender.com/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <EmployeeSidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Orders
        </h1>

        <div className="bg-white rounded-xl shadow p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="text-left py-3">Order ID</th>
                <th className="text-left py-3">SKU</th>
                <th className="text-left py-3">Product</th>
                <th className="text-left py-3">Category</th>
                <th className="text-left py-3">Qty</th>
                <th className="text-left py-3">Employee</th>
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

                  <td>{order.category}</td>

                  <td>{order.quantity}</td>

                  <td>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {order.employeeId}
                    </span>
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
            {orders.length}
          </p>
        </div>
      </div>
    </div>
  );
}

