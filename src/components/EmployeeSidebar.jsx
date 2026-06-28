import {
  ShoppingCart,
  PlusCircle,
  LayoutDashboard,
  Package,
  ClipboardList,
  Clock3,
  Wallet,
  LogOut,
  CalendarDays,
  Sparkles,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function EmployeeSidebar() {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/employee-dashboard",
    },
    {
  name: "Team Chat",
  icon: MessageCircle,
  path: "/chat",
},
    {
      name: "Manual Entry",
      icon: PlusCircle,
      path: "/manual-entry",
    },
    {
      name: "Orders",
      icon: ShoppingCart,
      path: "/orders",
    },
    {
      name: "Tasks",
      icon: ClipboardList,
      path: "/employee-tasks",
    },
    {
      name: "Stock",
      icon: Package,
      path: "/stock",
    },
    {
      name: "Attendance",
      icon: Clock3,
      path: "/attendance",
    },
    {
      name: "Leaves",
      icon: CalendarDays,
      path: "/leaves",
    },
    {
      name: "Salary",
      icon: Wallet,
      path: "/salary",
    },
    {
  name: "Notes",
  icon: ClipboardList,
  path: "/notes",
},
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-slate-950 border-r border-slate-800 flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={22} />
          </div>

          <div>
            <h1 className="text-white text-xl font-bold">
              eBay Analytics
            </h1>

            <p className="text-slate-400 text-xs">
              Employee Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-4 px-3">
          Main Menu
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
                  
                  ${
                    active
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }
                `}
              >
                <Icon size={20} />

                <span className="font-medium">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Employee Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              {(
                localStorage.getItem(
                  "employeeName"
                ) || "E"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="flex-1">
              <h3 className="text-white font-semibold">
                {localStorage.getItem(
                  "employeeName"
                ) || "Employee"}
              </h3>

              <p className="text-emerald-400 text-xs">
                ● Online
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="mt-4 flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white py-3 rounded-xl transition-all duration-300"
          >
            <LogOut size={18} />
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}