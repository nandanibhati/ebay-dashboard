
import EmployeeSidebar from "../components/EmployeeSidebar";
import { useState } from "react";

export default function AddOrder() {
  const [form, setForm] = useState({
    orderId: "",
    sku: "",
    product: "",
    category: "",
    quantity: "",
    costPrice: "",
    sellingPrice: "",
    ebayFee: "",
    adFee: "",
    deliveryCost: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
            orderId: form.orderId,
            employeeId: "EMP001",
            sku: form.sku,
            product: form.product,
            category: form.category,
            quantity,
            costPrice,
            sellingPrice,
            ebayFee,
            adFee,
            deliveryCost,
            revenue,
            profit,
            margin,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Order Saved Successfully ✅");

        setForm({
          orderId: "",
          sku: "",
          product: "",
          category: "",
          quantity: "",
          costPrice: "",
          sellingPrice: "",
          ebayFee: "",
          adFee: "",
          deliveryCost: "",
        });
      }
    } catch (error) {
      console.log(error);
      alert("Failed to Save Order ❌");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <EmployeeSidebar />

      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold">
          Manual Entry
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          Logged in as EMP001
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-8 w-full max-w-6xl grid md:grid-cols-2 gap-5"
        >
          <input
            type="text"
            name="orderId"
            placeholder="Order ID"
            value={form.orderId}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <div className="border p-3 rounded-lg bg-slate-50">
            EMP001
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
            type="text"
            name="product"
            placeholder="Product Name"
            value={form.product}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            step="0.01"
            name="costPrice"
            placeholder="Cost Price (£)"
            value={form.costPrice}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            step="0.01"
            name="sellingPrice"
            placeholder="Selling Price (£)"
            value={form.sellingPrice}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            step="0.01"
            name="ebayFee"
            placeholder="eBay Fee (£)"
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
            placeholder="Delivery Cost (£)"
            value={form.deliveryCost}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <button
            type="submit"
            className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          >
            Save Order
          </button>
        </form>
      </div>
    </div>
  );
}

