import Sidebar from "../components/Sidebar";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Package,
  Percent,
  Award,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  Calendar,
  User,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

/* Design tokens - BuildMaster reference palette
   Gold: #F4B400  Blue: #2563EB  Emerald: #22C55E
   Amber: #F59E0B  Red: #EF4444  Dark navy: #0F172A
*/

const FONT_LINK_ID = "ebay-dash-fonts";
function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap";
  document.head.appendChild(link);
}

// Small inline sparkline built from real bucketed values — no fabricated data
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return <div className="h-8" />;
  const w = 100, h = 32;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPts = `0,${h} ${pts} ${w},${h}`;
  const gradId = `spark-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Gradient KPI card, matched to reference: icon chip, growth pill, big number, sparkline
function StatCard({ label, value, icon: Icon, color, trend, spark, idx = 0 }) {
  const hasTrend = trend !== undefined && trend !== null;
  const up = Number(trend) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: idx * 0.05 }}
      className="relative bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: `linear-gradient(160deg, ${color}14, rgba(255,255,255,0.9))` }}
    >
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/80 shadow-sm"
          style={{ border: `1px solid ${color}33` }}
        >
          <Icon size={17} style={{ color }} />
        </div>
        {hasTrend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold tabular-nums ${up ? "text-emerald-600" : "text-red-500"}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p
        className="mt-3 text-2xl font-bold tracking-tight text-slate-900 relative truncate"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-0.5 font-medium relative">{label}</p>
      {spark && (
        <div className="mt-3 relative">
          <Sparkline data={spark} color={color} />
        </div>
      )}
    </motion.div>
  );
}

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state

  useEffect(() => {
    ensureFonts();
  }, []);

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

  const highestMargin =
    orders.length > 0
      ? Math.max(...orders.map((o) => Number(o.margin || 0))).toFixed(2)
      : 0;

  const topProduct =
    orders.length > 0
      ? orders.reduce((a, b) =>
          Number(a.quantity || 0) > Number(b.quantity || 0) ? a : b
        ).sku
      : "-";

  const employeeCounts = {};

  orders.forEach((order) => {
    const name = order.employeeName || "Unknown";
    employeeCounts[name] = (employeeCounts[name] || 0) + 1;
  });

  const topEmployee =
    Object.keys(employeeCounts).length > 0
      ? Object.keys(employeeCounts).reduce((a, b) =>
          employeeCounts[a] > employeeCounts[b] ? a : b
        )
      : "-";

  /* ── UI-only: bucket real orders by month for trend chart + sparklines ── */
  const monthlyData = useMemo(() => {
    if (orders.length === 0) return [];
    const buckets = {};
    orders.forEach((o) => {
      if (!o.date) return;
      const d = new Date(o.date);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!buckets[key]) {
        buckets[key] = { key, label: d.toLocaleDateString("en-GB", { month: "short" }), revenue: 0, profit: 0, count: 0, sortDate: new Date(d.getFullYear(), d.getMonth(), 1) };
      }
      buckets[key].revenue += Number(o.revenue || 0);
      buckets[key].profit += Number(o.profit || 0);
      buckets[key].count += 1;
    });
    return Object.values(buckets)
      .sort((a, b) => a.sortDate - b.sortDate)
      .slice(-12);
  }, [orders]);

  const revenueSpark = monthlyData.map((m) => m.revenue);
  const profitSpark = monthlyData.map((m) => m.profit);
  const ordersSpark = monthlyData.map((m) => m.count);

  // Simple period-over-period trend (last bucket vs previous), only when we have 2+ buckets
  const pctChange = (arr) => {
    if (arr.length < 2) return null;
    const prev = arr[arr.length - 2];
    const curr = arr[arr.length - 1];
    if (!prev) return null;
    return (((curr - prev) / prev) * 100).toFixed(1);
  };
  const revenueTrend = pctChange(revenueSpark);
  const profitTrend = pctChange(profitSpark);
  const ordersTrend = pctChange(ordersSpark);

  const chartTotal = monthlyData.reduce((s, m) => s + m.revenue, 0);

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: "#F8FAFC", fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      {/* Sidebar drawer (hamburger-triggered, not sticky) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl anim-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={17} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="p-4 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full">

        {/* Top bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-500" style={{ fontFamily: "Sora, sans-serif" }}>
            Analytics
          </span>
        </div>

        {/* Hero Banner */}
        <div
          className="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div className="absolute right-0 bottom-0 opacity-[0.06] translate-x-10 translate-y-10 pointer-events-none">
            <Layers size={320} />
          </div>
          <div
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(244,180,0,0.18)" }}
          />
          <div className="relative z-10">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"
              style={{ background: "rgba(244,180,0,0.14)", border: "1px solid rgba(244,180,0,0.3)", color: "#F4B400" }}
            >
              <Layers size={11} /> Business Intelligence
            </span>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ fontFamily: "Sora, sans-serif" }}>
              Analytics
            </h1>
            <p className="mt-1.5 text-slate-400 text-sm max-w-xl font-medium">
              Revenue, profit, and performance trends built from your live order data.
            </p>
          </div>
        </div>

        {/* Stat Cards — gradient, icon chip, trend pill, sparkline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">

          <StatCard
            label="Total Revenue"
            value={`£${totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="#F4B400"
            trend={revenueTrend}
            spark={revenueSpark.length > 1 ? revenueSpark : null}
            idx={0}
          />
          <StatCard
            label="Total Orders"
            value={orders.length}
            icon={ShoppingBag}
            color="#2563EB"
            trend={ordersTrend}
            spark={ordersSpark.length > 1 ? ordersSpark : null}
            idx={1}
          />
          <StatCard
            label="Net Profit"
            value={`£${totalProfit.toFixed(2)}`}
            icon={TrendingUp}
            color="#22C55E"
            trend={profitTrend}
            spark={profitSpark.length > 1 ? profitSpark : null}
            idx={2}
          />
          <StatCard
            label="Peak Margin"
            value={`${highestMargin}%`}
            icon={Percent}
            color="#22C55E"
            idx={3}
          />
          <StatCard
            label="Top Product SKU"
            value={topProduct}
            icon={Package}
            color="#2563EB"
            idx={4}
          />
          <StatCard
            label="Top Employee"
            value={topEmployee}
            icon={Award}
            color="#F59E0B"
            idx={5}
          />

        </div>

        {/* Revenue & Profit Trend Chart — built from real monthly order data */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
            <div>
              <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
                Revenue &amp; Profit
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {monthlyData.length > 0
                  ? `£${chartTotal.toFixed(0)} total across ${monthlyData.length} month${monthlyData.length !== 1 ? "s" : ""}`
                  : "Awaiting order data with valid dates"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#F4B400" }} />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />Profit</span>
            </div>
          </div>

          {monthlyData.length > 1 ? (
            <div className="h-72 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ left: -16, right: 8, top: 10 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F4B400" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#F4B400" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v) => `£${Number(v).toFixed(2)}`}
                    contentStyle={{ background: "#fff", border: "1px solid rgba(15,23,42,0.08)", borderRadius: 14, fontSize: 12, boxShadow: "0 12px 32px rgba(15,23,42,0.12)" }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#F4B400" fill="url(#revGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#22C55E" fill="url(#profGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-slate-400 mt-3">
              Need orders across more than one month to plot a trend.
            </div>
          )}
        </motion.div>

        {/* Recent Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col"
        >

          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>Recent Orders</h2>
              <p className="text-xs text-slate-400 mt-0.5">The last 10 transactions recorded.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold shadow-sm">
              <Calendar size={13} className="text-slate-400" />
              <span>Live</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-4 py-4">Employee</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                  <th className="px-4 py-4 text-right">Profit</th>
                  <th className="px-6 py-4 text-center">Margin</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <Package size={32} className="text-slate-300 stroke-[1.5]" />
                        <span>No orders found yet.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {orders
                  .slice(-10)
                  .reverse()
                  .map((order) => (
                    <tr key={order._id} className="hover:bg-[#F4B400]/[0.05] transition-all group">

                      <td className="px-6 py-4 font-bold text-xs text-slate-500 group-hover:text-[#B45F06] transition-colors" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#F4B400] transition-colors" />
                          {order.orderId || "UNKN-REF"}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white"
                            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
                          >
                            {order.employeeName?.charAt(0).toUpperCase() || <User size={12} />}
                          </div>
                          <span className="font-bold text-slate-800 text-xs">
                            {order.employeeName || "System"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap font-semibold text-slate-900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        £{Number(order.revenue || 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap font-bold text-emerald-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        <div className="flex items-center justify-end gap-1">
                          <ArrowUpRight size={12} className="opacity-70" />
                          <span>£{Number(order.profit || 0).toFixed(2)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            Number(order.margin || 0) >= 30
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : Number(order.margin || 0) >= 15
                              ? "bg-blue-50 border-blue-100 text-blue-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {Number(order.margin || 0).toFixed(2)}%
                        </span>
                      </td>

                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </motion.div>

      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) { .anim-slide-in { animation: none !important; } }
      `}</style>
    </div>
  );
}
