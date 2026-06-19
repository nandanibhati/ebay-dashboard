import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  TrendingUp, ShoppingBag, DollarSign, BarChart2,
  ArrowUpRight, ArrowDownRight, Clock, Search, Bell, ChevronDown,
} from "lucide-react";

// ─── Purely visual StatCard — replaces the imported one ───────────────────────
function StatCard({ title, value, icon: Icon, accent, trend, trendLabel }) {
  const up = trend >= 0;
  return (
    <div
      className="relative bg-white rounded-2xl p-5 flex flex-col gap-4 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: `0 4px 28px 0 ${accent.glow}, 0 1px 4px 0 rgba(0,0,0,0.06)` }}
    >
      {/* top row */}
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent.iconBg}`}>
          <Icon size={18} className={accent.iconColor} />
        </div>
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
          }`}
        >
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </span>
      </div>

      {/* value */}
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-wider">{title}</p>
      </div>

      {/* bottom label */}
      {trendLabel && (
        <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-3">
          {trendLabel}
        </p>
      )}

      {/* subtle accent bar at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent.bar}`} />
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────
function ProfitPill({ value }) {
  const n = Number(value || 0);
  const pos = n >= 0;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold text-sm ${pos ? "text-emerald-600" : "text-rose-500"}`}>
      {pos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      £{n.toFixed(2)}
    </span>
  );
}

// ─── Avatar initials ──────────────────────────────────────────────────────────
const COLORS = [
  "from-violet-500 to-indigo-500",
  "from-sky-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
];
function Avatar({ name = "?" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const color = COLORS[initials.charCodeAt(0) % COLORS.length];
  return (
    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Main export — ALL logic below is UNTOUCHED ───────────────────────────────
export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("https://ebay-dashboard-z7h2.onrender.com/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));
  }, []);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.revenue || 0),
    0
  );

  const totalProfit = orders.reduce(
    (sum, order) => sum + Number(order.profit || 0),
    0
  );

  const avgMargin =
    orders.length > 0
      ? (
          orders.reduce(
            (sum, order) => sum + Number(order.margin || 0),
            0
          ) / orders.length
        ).toFixed(2)
      : "0.00";

  // ─── UI only from here ─────────────────────────────────────────────────────
  const stats = [
    {
      title: "Total Revenue",
      value: `£${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: 12.4,
      trendLabel: "vs last 30 days",
      accent: {
        iconBg: "bg-violet-100",
        iconColor: "text-violet-600",
        glow: "rgba(124,58,237,0.15)",
        bar: "bg-gradient-to-r from-violet-400 to-indigo-400",
      },
    },
    {
      title: "Total Profit",
      value: `£${totalProfit.toFixed(2)}`,
      icon: TrendingUp,
      trend: 8.1,
      trendLabel: "vs last 30 days",
      accent: {
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        glow: "rgba(16,185,129,0.15)",
        bar: "bg-gradient-to-r from-emerald-400 to-teal-400",
      },
    },
    {
      title: "Orders",
      value: orders.length,
      icon: ShoppingBag,
      trend: 5.3,
      trendLabel: `${orders.length} total orders`,
      accent: {
        iconBg: "bg-sky-100",
        iconColor: "text-sky-600",
        glow: "rgba(14,165,233,0.15)",
        bar: "bg-gradient-to-r from-sky-400 to-blue-400",
      },
    },
    {
      title: "Avg Margin",
      value: `${avgMargin}%`,
      icon: BarChart2,
      trend: -2.0,
      trendLabel: "margin efficiency",
      accent: {
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        glow: "rgba(245,158,11,0.15)",
        bar: "bg-gradient-to-r from-amber-400 to-orange-400",
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-8 py-4 bg-white/70 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search size={14} className="text-gray-400" />
            <input
              className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none w-full"
              placeholder="Search orders, employees…"
              readOnly
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                AD
              </div>
              <span className="text-sm text-gray-700 font-medium">Admin</span>
              <ChevronDown size={13} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 px-8 py-8 space-y-8">
          {/* Welcome Banner */}
<div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
  <h1 className="text-3xl font-bold">
    Welcome Back, Admin 👋
  </h1>

  <p className="mt-2 text-violet-100">
    Here's what's happening with your business today.
  </p>
</div>

          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Sales & Profit Overview</p>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>

          {/* ── Recent Orders table ── */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 20px 0 rgba(0,0,0,0.06), 0 1px 4px 0 rgba(0,0,0,0.04)" }}
          >
            {/* table header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last 5 transactions</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
                <Clock size={12} />
                Live
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    {["Date", "Employee", "Order ID", "SKU", "Profit"].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/80">
                  {orders
                    .slice(-5)
                    .reverse()
                    .map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-violet-50/40 transition-colors duration-150 group"
                      >
                        <td className="py-3.5 px-6 text-sm text-gray-500">
                          {order.date || "—"}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={order.employeeName || "?"} />
                            <span className="text-sm font-medium text-gray-700">
                              {order.employeeName || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="text-sm font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                            {order.orderId}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-sm text-gray-500">
                          {order.sku}
                        </td>
                        <td className="py-3.5 px-6">
                          <ProfitPill value={order.profit} />
                        </td>
                      </tr>
                    ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-sm text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingBag size={28} className="text-gray-300" />
                          Loading orders…
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* table footer summary */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
              <p className="text-xs text-gray-400">
                Showing last <span className="font-semibold text-gray-600">5</span> of{" "}
                <span className="font-semibold text-gray-600">{orders.length}</span> orders
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  Revenue:{" "}
                  <strong className="text-violet-600">£{totalRevenue.toFixed(2)}</strong>
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  Profit:{" "}
                  <strong className="text-emerald-600">£{totalProfit.toFixed(2)}</strong>
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  Margin: <strong className="text-amber-600">{avgMargin}%</strong>
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
