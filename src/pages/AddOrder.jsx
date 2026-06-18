import Sidebar from "../components/Sidebar";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { useState } from "react";

export default function AddOrder() {
  const role = localStorage.getItem("role");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
  site: "",
  date:
    localStorage.getItem("selectedDate") ||
    new Date().toISOString().split("T")[0],
  orderId: "",
  sku: "",
  quantity: "",
  costPrice: "",
  sellingPrice: "",
  ebayFee: "",
  adFee: "",
  deliveryCost: "",
  trackingNo: "",
  status: "Pending",
  courierScanned: "",
  notes: "",
});

 const handleChange = (e) => {
  const { name, value } = e.target;

  setForm({
    ...form,
    [name]: value,
  });

  if (name === "date") {
    localStorage.setItem(
      "selectedDate",
      value
    );
  }
};
  const employeeName =
  localStorage.getItem("employeeName") || "Employee";

const employeeEmail =
  localStorage.getItem("employeeEmail") || "";                       

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return;

  setLoading(true);
   if (
  !form.site ||
  !form.date ||
  !form.orderId ||
  !form.sku ||
  !form.quantity
) {
  alert(
    "Please fill Site, Date, Order ID, SKU and Quantity"
  );

  setLoading(false);
  return;
}

    const quantity = Number(form.quantity);
    const costPrice = Number(form.costPrice);
    const sellingPrice = Number(form.sellingPrice);
    const ebayFee = Number(form.ebayFee);
    const adFee = Number(form.adFee);
    const deliveryCost = Number(form.deliveryCost);

    const revenue = quantity * sellingPrice;

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

    try {
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            site: form.site,
            date: form.date,

            orderId: form.orderId,
            employeeId: "EMP001",

             employeeName,
             employeeEmail,

            sku: form.sku,
            product: form.product,

            quantity,
            costPrice,
            sellingPrice,

            ebayFee,
            adFee,
            deliveryCost,

            revenue, 
            profit,
            margin,

            trackingNo: form.trackingNo,
            status: form.status,
            courierScanned: form.courierScanned,
            notes: form.notes,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Order Saved Successfully ✅");

       setForm({
  site: form.site,
  date: form.date,

  orderId: "",
  sku: "",
  product: "",
  quantity: "",
  costPrice: "",
  sellingPrice: "",
  ebayFee: "",
  adFee: "",
  deliveryCost: "",
  trackingNo: "",
  status: "Pending",
  courierScanned: "",
  notes: "",
});
setLoading(false);

      }
      else {
  alert(data.message);
  setLoading(false);
}
    } catch (error) {
      console.log(error);
      alert("Failed to Save Order ❌");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
  {role === "admin" ? (
    <Sidebar />
  ) : (
    <EmployeeSidebar />
  )}

  <div className="flex-1 ml-64 p-8">
        <h1 className="text-4xl font-bold">
          Manual Entry
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
         Logged in as {employeeName}
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-8 w-full max-w-6xl grid md:grid-cols-2 gap-5"
        >
          <select
            name="site"
            value={form.site}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="">Select Site</option>
            <option value="TPS">TPS</option>
            <option value="Smartzone">Smartzone</option>
            <option value="Veluntra">Veluntra</option>
            <option value="Amazon">Amazon</option>
            <option value="TikTok">TikTok</option>
          </select>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            name="orderId"
            placeholder="Order ID"
            value={form.orderId}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <div className="border p-3 rounded-lg bg-slate-50">
  {employeeName}
</div>

          <input
            type="text"
            name="sku"
            placeholder="SKU"
            value={form.sku}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />


          <input
            type="number"
            name="quantity"
            placeholder="Quantity Sold"
            value={form.quantity}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            step="0.01"
            name="costPrice"
            placeholder="Unit LP / Cost (£)"
            value={form.costPrice}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            step="0.01"
            name="sellingPrice"
            placeholder="Sales Amount (£)"
            value={form.sellingPrice}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            step="0.01"
            name="ebayFee"
            placeholder="eBay Transaction Fee (£)"
            value={form.ebayFee}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            step="0.01"
            name="adFee"
            placeholder="Ad Fee (£)"
            value={form.adFee}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            step="0.01"
            name="deliveryCost"
            placeholder="Shipping Cost (£)"
            value={form.deliveryCost}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            name="trackingNo"
            placeholder="Tracking Number"
            value={form.trackingNo}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
           
            <option value="Pending">Pending</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Returned">Returned</option>
          </select>

          <select
            name="courierScanned"
            value={form.courierScanned}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="">Courier Scanned?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <button
  type="submit"
  disabled={loading}
  className={`col-span-2 text-white py-3 rounded-lg font-semibold ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {loading
    ? "Saving..."
    : "Save Order"}
</button>
        </form>
      </div>
    </div>
  );
}