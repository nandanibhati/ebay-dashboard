import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  PlusCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-10">
        eBay Analytics
      </h1>

      <ul className="space-y-5">

        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
        </li>
       

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
  to="/admin-orders"
  className="flex items-center gap-3 hover:text-blue-400"
>
  <ShoppingCart size={20} />
  Orders
</Link>
        </li>
        <li>
       <Link
  to="/tasks"
  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700"
>
  📋 Tasks
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
            to="/employees"
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <Users size={20} />
            Employees
          </Link>
        </li>

        <li>
          <Link
            to="/analytics"
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <BarChart3 size={20} />
            Analytics
          </Link>
        </li>
        <li>
  <Link
    to="/admin-attendance"
    className="flex items-center gap-3 hover:text-blue-400"
  >
    <Clock size={20} />
    Attendance
  </Link>
</li>

<li>
  <Link
    to="/admin-salary"
    className="flex items-center gap-3 hover:text-blue-400"
  >
    <DollarSign size={20} />
    Salary
  </Link>
</li>
<Link
  to="/admin-leaves"
  className="flex items-center gap-3 hover:text-blue-400"
>
  Leave Requests
</Link>

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