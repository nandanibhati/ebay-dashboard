import EmployeeSidebar from "../components/EmployeeSidebar";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Stock() {
const [stock, setStock] = useState([]);
const [editingId, setEditingId] = useState(null);
const employeeName =
  localStorage.getItem("employeeName") || "Unknown";


const [form, setForm] = useState({
  sku: "",
  product: "",
  quantity: "",
  masterSku: "",
  packQty: 1,
  minimumStock: 5,
});

useEffect(() => {
h("https://ebay-dashboard-z7h2.onfetcrender.com/api/stock")
.then((res) => res.json())
.then((data) => setStock(data))
.catch((err) => console.log(err));
}, []);

const handleChange = (e) => {
setForm({
...form,
[e.target.name]: e.target.value,
});
};

const addStock = async (e) => {
  e.preventDefault();

  try {
    const url = editingId
      ? `https://ebay-dashboard-z7h2.onrender.com/api/stock/${editingId}`
      : "https://ebay-dashboard-z7h2.onrender.com/api/stock";

    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
     body: JSON.stringify({
  ...form,
  updatedBy: employeeName,
}),
    });

    const data = await response.json();
    


    if (data.success) {
      if (editingId) {
        setStock(
          stock.map((item) =>
            item._id === editingId ? data.stock : item
          )
        );

        alert("Stock Updated ✅");
        setEditingId(null);
      } else {
        setStock([...stock, data.stock]);
        alert("Stock Added ✅");
      }

   setForm({
  sku: "",
  product: "",
  quantity: "",
  masterSku: "",
  packQty: 1,
  minimumStock: 5,
});
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteStock = async (id) => {
const confirmDelete = window.confirm(
"Delete this stock item?"
);

if (!confirmDelete) return;

try {
 
    await fetch(
  `https://ebay-dashboard-z7h2.onrender.com/api/stock/${id}`,
  {
    method: "DELETE",
  }
);

  setStock(
    stock.filter((item) => item._id !== id)
  );
} catch (error) {
  console.log(error);
  alert("Failed to delete stock");
}


};

const editStock = (item) => {


  setEditingId(item._id);

  setForm({
    sku: item.sku,
    product: item.product,
    quantity: item.quantity,
    masterSku: item.masterSku || "",
    packQty: item.packQty || 1,
    minimumStock: item.minimumStock || 5,
  });
};

return ( <div className="flex min-h-screen bg-slate-100"> <EmployeeSidebar />


 <div className="flex-1 ml-64 p-8">
    <h1 className="text-3xl font-bold mb-6">
      Stock Management
    </h1>

    <form
      onSubmit={addStock}
      className="bg-white rounded-xl shadow p-6 mb-6 flex flex-wrap gap-4"
    >
        <input
  type="text"
  name="masterSku"
  placeholder="Master SKU"
  value={form.masterSku}
  onChange={handleChange}
  className="border p-3 rounded"
/>

<input
  type="number"
  name="packQty"
  placeholder="Pack Qty"
  value={form.packQty}
  onChange={handleChange}
  className="border p-3 rounded"
/>
       


      <input
        type="text"
        name="sku"
        placeholder="SKU"
        value={form.sku}
        onChange={handleChange}
        className="border p-3 rounded"
      />

      <input
        type="text"
        name="product"
        placeholder="Product Name"
        value={form.product}
        onChange={handleChange}
        className="border p-3 rounded"
      />

      <input
        type="number"
        name="quantity"
        placeholder="Stock Qty"
        value={form.quantity}
        onChange={handleChange}
        className="border p-3 rounded"
      />

      <input
        type="number"
        name="minimumStock"
        placeholder="Minimum Stock"
        value={form.minimumStock}
        onChange={handleChange}
        className="border p-3 rounded"
      />

      <button
  type="submit"
  className="bg-blue-600 text-white px-6 rounded"
>
  {editingId ? "Update Stock" : "Add Stock"}
</button>
    </form>

    <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
      <table className="w-full table-fixed">
        <thead>
        <tr className="border-b text-gray-600">
  <th className="w-48 text-left py-3">SKU</th>
  <th className="w-[650px] text-left py-3">Product</th>
  <th className="w-24 text-center py-3">Qty</th>
  <th className="w-32 text-center py-3">Status</th>
  <th className="w-40 text-center py-3">Updated By</th>
  <th className="w-24 text-center py-3">Actions</th>
</tr>
        </thead>

        <tbody>
        {stock.map((item) => (
            <tr
  key={item._id}
  className="border-b hover:bg-slate-50"
>
             
              <td className="py-3 font-medium">
  {item.sku}
</td>

             <td
  className="py-3 pr-4 break-words"
  title={item.product}
>
  {item.product}
</td>

            <td
  className={`text-center py-3 ${
    item.quantity <= 5
      ? "text-red-600 font-bold"
      : "text-green-600 font-bold"
  }`}
>
                {item.quantity}
              </td>

             <td className="text-center py-3">
  {item.quantity <= 5 ? (
    <span className="bg-red-100 text-red-600 px-2 py-1 rounded">
      Low Stock
    </span>
  ) : (
    <span className="bg-green-100 text-green-600 px-2 py-1 rounded">
      In Stock
    </span>
  )}
</td>

<td className="py-3 text-center">
  {item.updatedBy || "-"}
</td>



<td className="py-3">
  <div className="flex justify-center gap-4">
    <button
      type="button"
      onClick={() => editStock(item)}
      className="text-blue-600 hover:text-blue-800"
    >
      <FaEdit />
    </button>

    <button
      type="button"
      onClick={() => deleteStock(item._id)}
      className="text-red-600 hover:text-red-800"
    >
      <FaTrash />
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


);
}
