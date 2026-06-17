
import { ShoppingCart, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmployeeSidebar() {
  return (
    <div className="w-64 h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-10">
        eBay Analytics
      </h1>

      <ul className="space-y-5">
        <li>
          <Link
            to="/manual-entry"
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <PlusCircle size={20} />
            Manual Entry
          </Link>
        </li>

        <li>
          <Link
            to="/orders"
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <ShoppingCart size={20} />
            Orders
          </Link>
        </li>
        <li>
  <Link
    to="/stock"
    className="flex items-center gap-3 hover:text-blue-400"
  >
    📦 Stock
  </Link>
</li>

        <li>
          <Link
            to="/"
            className="flex items-center gap-3 text-red-400 hover:text-red-300"
          >
            Logout
          </Link>
        </li>
      </ul>
    </div>
  );
}

