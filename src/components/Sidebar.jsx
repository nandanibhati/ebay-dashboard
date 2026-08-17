import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  PlusCircle,
  Clock3,
  DollarSign,
  ClipboardList,
  Package,
  CalendarDays,
  LogOut,
  Sparkles,
  FileText,
  Store,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";

/* Design tokens - BuildMaster reference palette
   Gold: #F4B400  Blue: #2563EB  Emerald: #22C55E
   Dark navy: #0F172A / #0B1220
*/

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
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
      path: "/tasks",
    },
    {
      name: "Stock",
      icon: Package,
      path: "/stock",
    },

    {
      name: "Purchases",
      icon: Package,
      path: "/purchases",
    },
    {
      name: "Subscriptions",
      icon: DollarSign,
      path: "/subscriptions",
    },
    {
      name: "Employees",
      icon: Users,
      path: "/employees",
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    {
      name: "Attendance",
      icon: Clock3,
      path: "/admin-attendance",
    },
    {
      name: "Salary",
      icon: DollarSign,
      path: "/admin-salary",
    },
    {
      name: "Leaves",
      icon: CalendarDays,
      path: "/admin-leaves",
    },
    {
      name: "Notes",
      icon: ClipboardList,
      path: "/notes",
    },
    {
      name: "Templates",
      icon: FileText,
      path: "/templates",
    },
    {
      name: "eBay Integration",
      icon: Store,
      path: "/ebay-integration",
    },
  ];

  return (
    <div
      className="fixed left-0 top-0 h-screen w-72 border-r border-white/[0.06] flex flex-col"
      style={{ background: "linear-gradient(180deg, #0F172A 0%, #0B1220 100%)" }}
    >

      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", boxShadow: "0 0 24px rgba(244,180,0,0.35)" }}
          >
            <Sparkles className="text-[#0F172A]" size={22} />
          </div>

          <div>
            <h1 className="text-white text-xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>
              eBay Analytics
            </h1>

            <p className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: "#F4B400" }}>
              ADMIN WORKSPACE
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-4 px-3">
          Main Menu
        </p>

        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300"
                style={
                  active
                    ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A", fontWeight: 600, boxShadow: "0 4px 16px rgba(244,180,0,0.25)" }
                    : { color: "#CBD5E1" }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#CBD5E1";
                  }
                }}
              >
                {active && (
                  <span
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full"
                    style={{ background: "#F4B400", boxShadow: "0 0 8px #F4B400" }}
                  />
                )}
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Profile */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
            >
              A
            </div>

            <div className="flex-1">
              <h3 className="text-white font-semibold">
                Admin
              </h3>

              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl transition-all duration-300"
            style={{ background: "rgba(239,68,68,0.1)", color: "#F87171" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#EF4444";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#F87171";
            }}
          >
            <LogOut size={18} />
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
