import Sidebar from "../components/Sidebar";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, ShoppingBag, DollarSign, BarChart2,
  ArrowUpRight, ArrowDownRight, Clock, Search, ChevronDown,
  Menu, X, Plus, PieChart, Boxes, Layers, User, Wallet,
} from "lucide-react";
import { apiFetch } from "../api";
import NotificationBell from "../components/NotificationBell";
import { isSalaryDueToday } from "../utils/salary";

/* Design tokens - BuildMaster reference palette
   Display face: Sora  Body face: Inter  Numeral face: JetBrains Mono
   Base: #F8FAFC
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

/* ─── UI atoms ──────────────────────────────────────────────────────────── */

function Card({ children, className = "", hover = true, style = {} }) {
  return (
    <div
      className={`relative rounded-[22px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_20px_45px_-12px_rgba(30,41,59,0.14)] ${
        hover
          ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-14px_rgba(30,41,59,0.20)] hover:border-white/90"
          : ""
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        {eyebrow && (
          <p className="text-[10.5px] font-semibold tracking-[0.16em] uppercase mb-1.5" style={{ color: "#B45F06" }}>
            {eyebrow}
          </p>
        )}
        <h2 className="text-[17px] font-semibold text-slate-900 tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* ─── StatCard — visual only, each with its own gradient wash ─────────────── */
function StatCard({ title, value, icon: Icon, color, trend, trendLabel, idx = 0 }) {
  const up = trend >= 0;
  return (
    <Card
      className="p-5 group overflow-hidden anim-fade-up"
      style={{
        animationDelay: `${idx * 60}ms`,
        background: `linear-gradient(160deg, ${color}14, rgba(255,255,255,0.85))`,
      }}
    >
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/80 shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
          style={{ border: `1px solid ${color}33` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== 0 && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
              up ? "text-emerald-600" : "text-red-500"
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p
        className="mt-4 text-2xl font-bold tracking-tight text-slate-900 tabular-nums relative"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </p>
      <p className="text-xs text-slate-600 mt-1 font-medium relative">{title}</p>
      {trendLabel && <p className="text-[10.5px] text-slate-400 mt-2 relative">{trendLabel}</p>}
    </Card>
  );
}

/* ─── Profit pill ──────────────────────────────────────────────────────────── */
function ProfitPill({ value }) {
  const n = Number(value || 0);
  const pos = n >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 tabular-nums ${
        pos
          ? "bg-emerald-50 text-emerald-600 ring-emerald-500/20"
          : "bg-red-50 text-red-600 ring-red-500/20"
      }`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {pos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      £{n.toFixed(2)}
    </span>
  );
}

/* ─── Avatar initials ──────────────────────────────────────────────────────── */
function Avatar({ name = "?" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hue = (initials.charCodeAt(0) * 47) % 360;
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm"
      style={{ background: `linear-gradient(135deg, hsl(${hue},70%,58%), hsl(${hue},70%,42%))` }}
    >
      {initials}
    </div>
  );
}

/* ─── Background (light, premium, mesh gradients) ───────────────────────────── */
function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: "#F8FAFC" }} />
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
        }}
      />
      <div
        className="absolute -top-32 -left-24 w-[40rem] h-[40rem] rounded-full blur-[110px] anim-drift-a"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.14), transparent 70%)" }}
      />
      <div
        className="absolute top-1/4 right-[-8rem] w-[32rem] h-[32rem] rounded-full blur-[100px] anim-drift-b"
        style={{ background: "radial-gradient(circle, rgba(244,180,0,0.16), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-6rem] left-1/3 w-[28rem] h-[28rem] rounded-full blur-[100px] anim-drift-c"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.10), transparent 70%)" }}
      />
    </div>
  );
}

/* ── Hero pseudo-3D illustration — signature element: floating margin ring,
   mini bar chart panel, a profit cube, and connected order nodes. Pure
   CSS/SVG, no 3D library. ── */
function HeroScene({ revenue, margin }) {
  return (
    <div className="relative w-full h-[260px] md:h-[300px] select-none hidden md:block" style={{ perspective: "1400px" }}>
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-24 rounded-full blur-2xl"
        style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.16), transparent 70%)" }}
      />
      <div className="relative w-full h-full anim-scene-tilt" style={{ transformStyle: "preserve-3d" }}>
        {/* Margin ring */}
        <div
          className="absolute top-1 right-2 w-28 h-28 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_20px_45px_-10px_rgba(37,99,235,0.28)] anim-float-a flex flex-col items-center justify-center gap-1"
          style={{ transform: "translateZ(60px) rotateY(-8deg)" }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="19" stroke="#E2E8F0" strokeWidth="5.5" fill="none" />
            <circle
              cx="24" cy="24" r="19" stroke="#2563EB" strokeWidth="5.5" fill="none"
              strokeDasharray="119" strokeDashoffset="30" strokeLinecap="round"
              transform="rotate(-90 24 24)"
            />
          </svg>
          <span className="text-[10px] font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {margin}%
          </span>
          <span className="text-[8.5px] text-slate-500 -mt-0.5">Margin</span>
        </div>

        {/* Bar chart panel */}
        <div
          className="absolute top-8 left-0 w-40 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/70 shadow-[0_24px_50px_-10px_rgba(30,41,59,0.20)] p-3.5 anim-float-b"
          style={{ transform: "translateZ(90px) rotateY(6deg) rotateX(2deg)" }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-wide">Revenue</span>
            <BarChart2 size={12} className="text-[#2563EB]" />
          </div>
          <div className="flex items-end gap-1.5 h-12">
            {[45, 60, 40, 75, 55, 90, 65].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md anim-bar-grow"
                style={{
                  height: `${h}%`,
                  background: i === 5 ? "linear-gradient(180deg,#F4B400,#B45F06)" : "linear-gradient(180deg,#60A5FA,#2563EB)",
                  animationDelay: `${i * 90}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Revenue cube */}
        <div
          className="absolute top-28 left-[40%] w-20 h-20 anim-float-c"
          style={{ transform: "translateZ(130px)" }}
        >
          <div
            className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[#0F172A] shadow-[0_22px_48px_-10px_rgba(244,180,0,0.45)]"
            style={{ background: "linear-gradient(150deg,#F4B400,#F59E0B)" }}
          >
            <DollarSign size={16} />
            <span className="text-[12px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              £{Math.round(revenue)}
            </span>
            <span className="text-[8px] opacity-70">Revenue</span>
          </div>
        </div>

        {/* Box/inventory cube */}
        <div
          className="absolute bottom-2 left-10 w-16 h-16 rounded-2xl anim-float-a"
          style={{
            transform: "translateZ(40px) rotateZ(-6deg)",
            background: "linear-gradient(150deg,#22C55E,#16A34A)",
            boxShadow: "0 20px 40px -10px rgba(34,197,94,0.4)",
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <Boxes size={24} className="text-white" strokeWidth={1.6} />
          </div>
        </div>

        {/* Order flow nodes */}
        <div className="absolute bottom-6 right-4 w-32 h-14 anim-float-b" style={{ transform: "translateZ(70px)" }}>
          <svg width="128" height="56" viewBox="0 0 128 56" fill="none">
            <path d="M8 40 Q 40 8 64 28 T 120 14" stroke="#0F172A" strokeWidth="2" strokeDasharray="4 5" fill="none" opacity="0.35" />
            <circle cx="8" cy="40" r="5" fill="#0F172A" opacity="0.7" />
            <circle cx="64" cy="28" r="5.5" fill="#2563EB" />
            <circle cx="120" cy="14" r="5" fill="#F4B400" />
          </svg>
        </div>

        {/* small chip */}
        <div
          className="absolute top-0 left-[36%] w-12 h-12 rounded-full bg-white/90 backdrop-blur-xl border border-white/70 shadow-[0_14px_30px_-8px_rgba(15,23,42,0.2)] anim-float-c flex items-center justify-center"
          style={{ transform: "translateZ(150px)" }}
        >
          <PieChart size={17} className="text-[#0F172A]" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main export — ALL logic below is UNTOUCHED ───────────────────────────── */
export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only state for drawer
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    ensureFonts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    apiFetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));

    apiFetch("/api/purchases")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPurchases(data.purchases);
        }
      })
      .catch((err) => console.log(err));

    apiFetch("/api/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSubscriptions(data.subscriptions);
        }
      })
      .catch((err) => console.log(err));

    apiFetch("/api/auth/employees")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEmployees(data.employees);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  // Cancelled/returned orders never earned real revenue, so they're left out
  // of every revenue/profit/margin figure on this page.
  const billableOrders = orders.filter(
    (order) => !["Cancelled", "Returned"].includes(order.status)
  );

  const totalRevenue = billableOrders.reduce(
    (sum, order) => sum + Number(order.revenue || 0),
    0
  );

  const totalProfit = billableOrders.reduce(
    (sum, order) => sum + Number(order.profit || 0),
    0
  );

  const totalPurchases = purchases.reduce(
    (sum, item) => sum + Number(item.cost || 0),
    0
  );

  const totalSubscriptions = subscriptions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // Bottom-line profit after inventory purchases and tool subscriptions
  // are deducted too, not just per-order costs.
  const netProfit = totalProfit - totalPurchases - totalSubscriptions;

  // Margin is revenue-weighted and based on the same bottom-line profit
  // (after purchases/subscriptions) so it matches what "Net Profit" shows,
  // not just the pre-overhead order-level number.
  const avgMargin =
    totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : "0.00";

  // Real month-over-month trends (this calendar month vs the previous one),
  // computed from each order's own date instead of hardcoded placeholder %s.
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${prevMonthDate.getMonth()}`;

  const monthBuckets = { [thisMonthKey]: [], [prevMonthKey]: [] };
  billableOrders.forEach((order) => {
    if (!order.date) return;
    const d = new Date(order.date);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthBuckets[key]) monthBuckets[key].push(order);
  });

  const sumBy = (list, field) =>
    list.reduce((sum, o) => sum + Number(o[field] || 0), 0);

  const thisMonthOrders = monthBuckets[thisMonthKey];
  const prevMonthOrders = monthBuckets[prevMonthKey];

  const pctChange = (curr, prev) => {
    if (!prev) return 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  const revenueTrend = pctChange(sumBy(thisMonthOrders, "revenue"), sumBy(prevMonthOrders, "revenue"));
  const profitTrend = pctChange(sumBy(thisMonthOrders, "profit"), sumBy(prevMonthOrders, "profit"));
  const ordersTrend = pctChange(thisMonthOrders.length, prevMonthOrders.length);

  const prevMonthRevenue = sumBy(prevMonthOrders, "revenue");
  const prevMonthProfit = sumBy(prevMonthOrders, "profit");
  const prevMonthMargin = prevMonthRevenue > 0 ? (prevMonthProfit / prevMonthRevenue) * 100 : 0;
  const marginTrend = pctChange(Number(avgMargin), prevMonthMargin);

  /* ─── UI only from here ─────────────────────────────────────────────────── */
  const stats = [
    { title: "Total Revenue", value: `£${totalRevenue.toFixed(2)}`, icon: DollarSign, trend: revenueTrend, trendLabel: "vs last month", color: "#F4B400" },
    { title: "Total Profit", value: `£${totalProfit.toFixed(2)}`, icon: TrendingUp, trend: profitTrend, trendLabel: "vs last month", color: "#22C55E" },
    { title: "Orders", value: orders.length, icon: ShoppingBag, trend: ordersTrend, trendLabel: `${orders.length} total orders`, color: "#2563EB" },
    { title: "Avg Margin", value: `${avgMargin}%`, icon: BarChart2, trend: marginTrend, trendLabel: "margin efficiency", color: "#F59E0B" },
    { title: "Purchases", value: `£${totalPurchases.toFixed(2)}`, icon: ShoppingBag, trend: 0, trendLabel: "inventory expenses", color: "#EF4444" },
    { title: "Subscriptions", value: `£${totalSubscriptions.toFixed(2)}`, icon: DollarSign, trend: 0, trendLabel: "monthly tools cost", color: "#2563EB" },
    { title: "Net Profit", value: `£${netProfit.toFixed(2)}`, icon: TrendingUp, trend: 0, trendLabel: "after expenses", color: "#22C55E" },
  ];

  const employeesSalaryDueToday = employees.filter((e) => isSalaryDueToday(e));

  const query = searchQuery.trim().toLowerCase();
  const matchedOrders = query
    ? orders
        .filter(
          (o) =>
            o.orderId?.toLowerCase().includes(query) ||
            o.sku?.toLowerCase().includes(query) ||
            o.employeeName?.toLowerCase().includes(query)
        )
        .slice(0, 5)
    : [];
  const matchedEmployees = query
    ? employees
        .filter(
          (e) =>
            e.name?.toLowerCase().includes(query) ||
            e.email?.toLowerCase().includes(query)
        )
        .slice(0, 5)
    : [];
  const hasSearchResults = matchedOrders.length > 0 || matchedEmployees.length > 0;

  const goToOrders = () => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate("/orders");
  };
  const goToEmployees = () => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate("/employees");
  };

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui", color: "#0F172A" }}
    >
      <PremiumBackground />

      {/* ── Sidebar drawer (opens from header menu button) ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 shadow-[0_0_60px_rgba(15,23,42,0.35)] anim-slide-in">
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

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ── Top bar ── */}
        <header className="sticky top-0 z-20 h-[72px] flex items-center gap-3 px-5 lg:px-10 border-b border-slate-900/[0.06] bg-white/70 backdrop-blur-xl">
          {/* Menu button — opens sidebar drawer */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.07]"
          >
            <Menu size={18} />
          </button>

          <div className="relative hidden md:block w-80" ref={searchRef}>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.07] text-slate-400 focus-within:ring-1 focus-within:ring-[#F4B400]/50 focus-within:border-[#F4B400]/40 transition-all">
              <Search size={15} />
              <input
                className="bg-transparent outline-none text-sm placeholder:text-slate-400 text-slate-700 w-full"
                placeholder="Search orders, employees…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
              />
            </div>

            {searchOpen && query && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 z-50 max-h-96 overflow-y-auto">
                {!hasSearchResults ? (
                  <div className="py-8 text-center text-sm text-slate-400">No matches for "{searchQuery}"</div>
                ) : (
                  <>
                    {matchedOrders.length > 0 && (
                      <div className="py-2">
                        <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Orders</p>
                        {matchedOrders.map((o) => (
                          <button
                            key={o._id}
                            onClick={goToOrders}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
                          >
                            <ShoppingBag size={14} className="text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{o.orderId}</span>
                            <span className="text-xs text-slate-400 ml-auto flex-shrink-0">{o.sku}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {matchedEmployees.length > 0 && (
                      <div className="py-2 border-t border-slate-100">
                        <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employees</p>
                        {matchedEmployees.map((e) => (
                          <button
                            key={e._id}
                            onClick={goToEmployees}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
                          >
                            <User size={14} className="text-amber-500 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{e.name}</span>
                            <span className="text-xs text-slate-400 ml-auto flex-shrink-0 truncate max-w-[140px]">{e.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-900/[0.08] cursor-pointer">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-semibold text-white"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "linear-gradient(150deg, #2563EB, #1D4ED8)",
                  boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
                }}
              >
                AD
              </div>
              <span className="hidden sm:block text-sm text-slate-700 font-medium">Admin</span>
              <ChevronDown size={13} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 px-5 lg:px-10 py-8 max-w-[1680px] mx-auto w-full space-y-7">
          {/* ── Hero / welcome ── */}
          <Card hover={false} className="p-7 md:p-9 overflow-hidden relative">
            <div
              className="absolute -top-24 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-70 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(244,180,0,0.22), transparent 70%)" }}
            />
            <div
              className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full blur-[100px] opacity-50 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(37,99,235,0.16), transparent 70%)" }}
            />
            <div className="relative grid md:grid-cols-[1.15fr_0.85fr] gap-6 items-center">
              {/* left */}
              <div>
                <p className="text-[10.5px] font-semibold tracking-[0.16em] uppercase mb-2" style={{ color: "#B45F06" }}>
                  Overview
                </p>
                <h1
                  className="text-3xl md:text-[2.2rem] font-bold tracking-tight text-slate-900 flex items-center gap-2"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  Welcome back, Admin <span className="anim-wave inline-block">👋</span>
                </h1>
                <p className="text-slate-500 mt-2 text-[15px] max-w-lg">
                  Sales &amp; profit overview for your store.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-xl">
                  <div className="rounded-xl bg-white/80 border border-white/70 shadow-[0_10px_24px_-8px_rgba(30,41,59,0.14)] px-3.5 py-3">
                    <p className="text-lg font-bold tabular-nums" style={{ color: "#B45F06", fontFamily: "'JetBrains Mono', monospace" }}>
                      £{totalRevenue.toFixed(0)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Revenue</p>
                  </div>
                  <div className="rounded-xl bg-white/80 border border-white/70 shadow-[0_10px_24px_-8px_rgba(30,41,59,0.14)] px-3.5 py-3">
                    <p className="text-lg font-bold tabular-nums" style={{ color: "#22C55E", fontFamily: "'JetBrains Mono', monospace" }}>
                      £{netProfit.toFixed(0)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Net Profit</p>
                  </div>
                  <div className="rounded-xl bg-white/80 border border-white/70 shadow-[0_10px_24px_-8px_rgba(30,41,59,0.14)] px-3.5 py-3">
                    <p className="text-lg font-bold tabular-nums" style={{ color: "#2563EB", fontFamily: "'JetBrains Mono', monospace" }}>
                      {orders.length}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Orders</p>
                  </div>
                  <div className="rounded-xl bg-white/80 border border-white/70 shadow-[0_10px_24px_-8px_rgba(30,41,59,0.14)] px-3.5 py-3">
                    <p className="text-lg font-bold tabular-nums" style={{ color: "#F59E0B", fontFamily: "'JetBrains Mono', monospace" }}>
                      {avgMargin}%
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Avg Margin</p>
                  </div>
                </div>
              </div>

              {/* right — signature pseudo-3D hero scene */}
              <HeroScene revenue={totalRevenue} margin={avgMargin} />
            </div>
          </Card>

          {/* ── Salary due today ── */}
          {employeesSalaryDueToday.length > 0 && (
            <Card
              hover={false}
              className="p-5 flex items-center gap-4"
              style={{ background: "linear-gradient(160deg, rgba(244,180,0,0.10), rgba(255,255,255,0.9))" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)" }}
              >
                <Wallet size={20} style={{ color: "#0F172A" }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
                  Today is salary day for {employeesSalaryDueToday.length === 1 ? employeesSalaryDueToday[0].name : `${employeesSalaryDueToday.length} employees`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {employeesSalaryDueToday.map((e) => e.name).join(", ")} — not yet marked as paid this month
                </p>
              </div>
              <button
                onClick={() => navigate("/admin-salary")}
                className="ml-auto flex-shrink-0 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }}
              >
                Go to Salary
              </button>
            </Card>
          )}

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
            {stats.map((s, i) => (
              <StatCard key={s.title} {...s} idx={i} />
            ))}
          </div>

          {/* ── Recent Orders table ── */}
          <Card className="p-6 overflow-hidden" hover={false}>
            <SectionHeading
              eyebrow="Live feed"
              title="Recent Orders"
              action={
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900/[0.04] border border-slate-900/[0.06] px-3 py-1.5 rounded-xl font-medium">
                  <Clock size={12} />
                  Live
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 anim-pulse-ring ml-0.5" />
                </div>
              }
            />

            <div className="overflow-x-auto">
              <table
                className="w-full text-left text-sm min-w-[680px] border-separate"
                style={{ borderSpacing: "0 6px" }}
              >
                <thead>
                  <tr className="text-[11px] text-slate-400 uppercase tracking-wide">
                    {["Date", "Employee", "Order ID", "SKU", "Profit"].map((h) => (
                      <th key={h} className="font-semibold pb-2 px-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .slice(-5)
                    .reverse()
                    .map((order) => (
                      <tr
                        key={order._id}
                        className="bg-slate-900/[0.015] hover:bg-[#F4B400]/[0.06] transition-colors group"
                      >
                        <td className="py-3.5 px-3 rounded-l-xl text-slate-500 text-xs">
                          {order.date || "—"}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={order.employeeName || "?"} />
                            <span className="font-medium text-slate-900">
                              {order.employeeName || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className="text-xs text-slate-500 bg-slate-900/[0.04] border border-slate-900/[0.06] px-2 py-0.5 rounded-md tabular-nums"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {order.orderId}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{order.sku}</td>
                        <td className="py-3.5 px-3 rounded-r-xl">
                          <ProfitPill value={order.profit} />
                        </td>
                      </tr>
                    ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-sm text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingBag size={28} className="text-slate-300" />
                          Loading orders…
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* table footer summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-900/[0.06]">
              <p className="text-xs text-slate-400">
                Showing last <span className="font-semibold text-slate-600">5</span> of{" "}
                <span className="font-semibold text-slate-600">{orders.length}</span> orders
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>
                  Revenue: <strong style={{ color: "#B45F06" }}>£{totalRevenue.toFixed(2)}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Profit: <strong className="text-emerald-600">£{totalProfit.toFixed(2)}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Margin: <strong className="text-amber-600">{avgMargin}%</strong>
                </span>
              </div>
            </div>
          </Card>
        </main>
      </div>

      <style>{`
        @keyframes wave { 0%,100% { transform: rotate(0deg); } 20% { transform: rotate(16deg); } 40% { transform: rotate(-8deg); } 60% { transform: rotate(14deg); } 80% { transform: rotate(0deg); } }
        .anim-wave { animation: wave 2.4s ease-in-out infinite; transform-origin: 70% 70%; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .anim-fade-up { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(244,180,0,0.5); } 70% { box-shadow: 0 0 0 8px rgba(244,180,0,0); } 100% { box-shadow: 0 0 0 0 rgba(244,180,0,0); } }
        .anim-pulse-ring { animation: pulseRing 2s infinite; border-radius: 9999px; }

        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }

        @keyframes driftA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,20px); } }
        @keyframes driftB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-25px,25px); } }
        @keyframes driftC { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-20px); } }
        .anim-drift-a { animation: driftA 14s ease-in-out infinite; }
        .anim-drift-b { animation: driftB 17s ease-in-out infinite; }
        .anim-drift-c { animation: driftC 20s ease-in-out infinite; }

        /* Hero pseudo-3D scene */
        @keyframes sceneTilt { 0%,100% { transform: rotateX(4deg) rotateY(-4deg); } 50% { transform: rotateX(2deg) rotateY(4deg); } }
        .anim-scene-tilt { animation: sceneTilt 10s ease-in-out infinite; }

        @keyframes floatA { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes floatB { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes floatC { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        .anim-float-a { animation: floatA 5.5s ease-in-out infinite; }
        .anim-float-b { animation: floatB 6.5s ease-in-out infinite; }
        .anim-float-c { animation: floatC 7s ease-in-out infinite; }

        @keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        .anim-bar-grow { transform-origin: bottom; animation: barGrow 0.7s cubic-bezier(0.22,1,0.36,1) both; }

        @media (prefers-reduced-motion: reduce) {
          .anim-wave, .anim-fade-up, .anim-pulse-ring, .anim-slide-in,
          .anim-drift-a, .anim-drift-b, .anim-drift-c,
          .anim-scene-tilt, .anim-float-a, .anim-float-b, .anim-float-c, .anim-bar-grow {
            animation: none !important;
          }
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(30,41,59,0.15); border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
