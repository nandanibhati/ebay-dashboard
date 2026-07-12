import EmployeeSidebar from "../components/EmployeeSidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import NotificationBell from "../components/NotificationBell";
import {
  LogIn, LogOut as LogOutIcon, CalendarCheck, CalendarX, CalendarClock,
  Wallet, Search, ChevronDown, ArrowUpRight, Sparkles,
  Clock, CheckCircle2, XCircle, AlertCircle, Menu, X,
  ClipboardList, CalendarDays, AlertTriangle, TrendingUp, BarChart3, PieChart,
} from "lucide-react";

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

/* ── UI atoms ─────────────────────────────────────────────────────────── */

function GlassPanel({ children, className = "", hover = true, style = {} }) {
  return (
    <div
      className={`relative rounded-[22px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_20px_45px_-12px_rgba(30,41,59,0.14)] ${
        hover
          ? "transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_28px_60px_-14px_rgba(30,41,59,0.20)] hover:border-white/90"
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
          <p
            className="text-[10.5px] font-semibold tracking-[0.16em] uppercase mb-1.5"
            style={{ color: "#B45F06" }}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className="text-[17px] font-semibold text-slate-900 tracking-tight"
          style={{ fontFamily: "Sora, sans-serif" }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-900/[0.05] bg-slate-900/[0.025]">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span className="text-[13px] text-slate-500">{label}</span>
      </div>
      <span
        className="text-sm font-semibold tabular-nums"
        style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </span>
    </div>
  );
}

/* Big-number task card — each with its own gradient wash */
function TaskStatCard({ label, value, icon: Icon, gradient, iconColor, glow, idx = 0 }) {
  return (
    <GlassPanel
      className="p-6 group overflow-hidden anim-fade-up flex flex-col items-center justify-center text-center min-h-[148px]"
      style={{ animationDelay: `${idx * 80}ms`, background: gradient }}
    >
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
        style={{ background: glow }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 relative bg-white/80 shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
        style={{ border: `1px solid ${iconColor}33` }}
      >
        <Icon size={17} style={{ color: iconColor }} />
      </div>
      <p className="text-[13px] font-medium text-slate-600">{label}</p>
      <p
        className="text-[2.6rem] leading-none font-bold tracking-tight text-slate-900 mt-2 tabular-nums"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </p>
    </GlassPanel>
  );
}

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
      <div
        className="absolute bottom-1/4 right-1/4 w-[22rem] h-[22rem] rounded-full blur-[90px] anim-drift-a"
        style={{ background: "radial-gradient(circle, rgba(15,23,42,0.06), transparent 70%)" }}
      />
    </div>
  );
}

/* ── Hero pseudo-3D illustration ──────────────────────────────────────────
   CSS/SVG layered widgets on a perspective stage: floating KPI cubes,
   a mini bar chart panel, a revenue ring and a trend card — all drifting
   gently to suggest depth without any 3D library.
──────────────────────────────────────────────────────────────────────── */
function HeroScene() {
  return (
    <div className="relative w-full h-[300px] md:h-[340px] select-none" style={{ perspective: "1400px" }}>
      {/* floor glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-24 rounded-full blur-2xl"
        style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.18), transparent 70%)" }}
      />

      <div
        className="relative w-full h-full anim-scene-tilt"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Revenue ring card — top right */}
        <div
          className="absolute top-1 right-2 md:right-8 w-32 h-32 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_20px_45px_-10px_rgba(37,99,235,0.28)] anim-float-a flex flex-col items-center justify-center gap-1"
          style={{ transform: "translateZ(60px) rotateY(-8deg)" }}
        >
          <svg width="54" height="54" viewBox="0 0 54 54">
            <circle cx="27" cy="27" r="22" stroke="#E2E8F0" strokeWidth="6" fill="none" />
            <circle
              cx="27" cy="27" r="22" stroke="#2563EB" strokeWidth="6" fill="none"
              strokeDasharray="138" strokeDashoffset="34" strokeLinecap="round"
              transform="rotate(-90 27 27)"
            />
          </svg>
          <span className="text-[11px] font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>76%</span>
          <span className="text-[9px] text-slate-500 -mt-0.5">Target</span>
        </div>

        {/* Bar chart panel — center-left */}
        <div
          className="absolute top-10 left-0 md:left-4 w-44 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/70 shadow-[0_24px_50px_-10px_rgba(30,41,59,0.20)] p-4 anim-float-b"
          style={{ transform: "translateZ(90px) rotateY(6deg) rotateX(2deg)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Sales</span>
            <BarChart3 size={13} className="text-[#2563EB]" />
          </div>
          <div className="flex items-end gap-1.5 h-14">
            {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
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

        {/* Revenue cube — center */}
        <div
          className="absolute top-32 left-1/2 -translate-x-1/2 md:left-[42%] w-24 h-24 anim-float-c"
          style={{ transform: "translateZ(130px)" }}
        >
          <div
            className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[#0F172A] shadow-[0_22px_48px_-10px_rgba(244,180,0,0.45)]"
            style={{ background: "linear-gradient(150deg,#F4B400,#F59E0B)" }}
          >
            <TrendingUp size={18} />
            <span className="text-[15px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>+18%</span>
            <span className="text-[9px] opacity-70">Revenue</span>
          </div>
        </div>

        {/* Package / product cube — bottom left */}
        <div
          className="absolute bottom-2 left-6 md:left-16 w-20 h-20 rounded-2xl anim-float-a"
          style={{
            transform: "translateZ(40px) rotateZ(-6deg)",
            background: "linear-gradient(150deg,#22C55E,#16A34A)",
            boxShadow: "0 20px 40px -10px rgba(34,197,94,0.4)",
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6">
              <path d="M21 8l-9-5-9 5 9 5 9-5z" />
              <path d="M3 8v8l9 5 9-5V8" />
              <path d="M12 13v8" />
            </svg>
          </div>
        </div>

        {/* Order flow nodes — connecting line, bottom right */}
        <div
          className="absolute bottom-6 right-4 md:right-12 w-36 h-16 anim-float-b"
          style={{ transform: "translateZ(70px)" }}
        >
          <svg width="140" height="60" viewBox="0 0 140 60" fill="none">
            <path d="M8 44 Q 45 8 70 30 T 132 16" stroke="#0F172A" strokeWidth="2" strokeDasharray="4 5" fill="none" opacity="0.35" />
            <circle cx="8" cy="44" r="5" fill="#0F172A" opacity="0.7" />
            <circle cx="70" cy="30" r="6" fill="#2563EB" />
            <circle cx="132" cy="16" r="5" fill="#F4B400" />
          </svg>
        </div>

        {/* Small floating percentage chip */}
        <div
          className="absolute top-0 left-1/2 md:left-[38%] w-14 h-14 rounded-full bg-white/90 backdrop-blur-xl border border-white/70 shadow-[0_14px_30px_-8px_rgba(15,23,42,0.2)] anim-float-c flex items-center justify-center"
          style={{ transform: "translateZ(150px)" }}
        >
          <PieChart size={20} className="text-[#0F172A]" />
        </div>
      </div>
    </div>
  );
}

/* ── Main export — existing logic UNTOUCHED, tasks fetch added ───────────── */
export default function EmployeeDashboard() {
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(2);
  const [tasks, setTasks] = useState([]);
  const [salary, setSalary] = useState({ basicSalary: 0, totalHours: "0.00", salary: "0.00" });
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state

  const employeeName = localStorage.getItem("employeeName") || "Employee";
  const navigate = useNavigate();

  useEffect(() => {
    ensureFonts();
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("employeeEmail");
    const name = localStorage.getItem("employeeName");

    apiFetch("/api/leaves")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeaves(data.leaves.filter((leave) => leave.employeeEmail === email));
        }
      })
      .catch((err) => console.log(err));

    apiFetch(`/api/auth/employee/${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeaveBalance(data.employee.monthlyLeaveBalance || 0);
        }
      })
      .catch((err) => console.log(err));

    // Tasks assigned to this employee (backend matches by name)
    apiFetch(`/api/tasks/employee/${name}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTasks(data.tasks);
        }
      })
      .catch((err) => console.log(err));

    apiFetch(`/api/salary/${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSalary(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handlePunchIn = async () => {
    try {
      const response = await apiFetch("/api/attendance/punch-in", {
        method: "POST",
        body: {
          employeeId: localStorage.getItem("employeeEmail"),
          employeeName: localStorage.getItem("employeeName"),
          employeeEmail: localStorage.getItem("employeeEmail"),
        },
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.log(error);
      alert("Punch In Failed");
    }
  };

  const handlePunchOut = async () => {
    try {
      const response = await apiFetch("/api/attendance/punch-out", {
        method: "POST",
        body: {
          employeeEmail: localStorage.getItem("employeeEmail"),
        },
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.log(error);
      alert("Punch Out Failed");
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
  const approvedLeaves = leaves.filter((l) => l.status === "Approved").length;
  const usedLeaves = leaves
    .filter((l) => l.status === "Approved")
    .reduce((sum, l) => sum + Number(l.leaveDays || 0), 0);

  // Task counts — matches Task schema (status: Todo / In Progress / Done / Closed)
  const todayStr = new Date().toISOString().slice(0, 10);

  const openTasks = tasks.filter(
    (t) => t.status === "Todo" || t.status === "In Progress"
  );

  const myTasksCount = openTasks.length;

  const dueTodayCount = openTasks.filter(
    (t) => t.dueDate && String(t.dueDate).slice(0, 10) === todayStr
  ).length;

  const overdueCount = openTasks.filter(
    (t) => t.dueDate && String(t.dueDate).slice(0, 10) < todayStr
  ).length;

  /* ── UI only ─────────────────────────────────────────────────────────── */
  const initials = employeeName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui", color: "#0F172A" }}
    >
      <PremiumBackground />

      {/* ── Sidebar drawer ── */}
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
            <EmployeeSidebar />
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ── Top bar ── */}
        <header className="sticky top-0 z-20 h-[72px] flex items-center gap-3 px-5 lg:px-10 border-b border-slate-900/[0.06] bg-white/70 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.07]"
          >
            <Menu size={18} />
          </button>

          <div className="hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.07] w-80 text-slate-400 focus-within:ring-1 focus-within:ring-[#F4B400]/50 focus-within:border-[#F4B400]/40 transition-all">
            <Search size={15} />
            <input
              className="bg-transparent outline-none text-sm placeholder:text-slate-400 text-slate-700 w-full"
              placeholder="Search…"
              readOnly
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-900/[0.08] cursor-pointer select-none">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-semibold text-white relative"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "linear-gradient(150deg, #2563EB, #1D4ED8)",
                  boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
                }}
              >
                {initials}
              </div>
              <span className="hidden sm:block text-sm text-slate-700 font-medium">{employeeName}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* ── Page body ── */}
        <main className="flex-1 px-5 lg:px-10 py-8 max-w-[1680px] mx-auto w-full space-y-7">

          {/* Hero / welcome */}
          <GlassPanel hover={false} className="p-7 md:p-9 overflow-hidden relative">
            <div
              className="absolute -top-24 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-70 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(244,180,0,0.22), transparent 70%)" }}
            />
            <div
              className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full blur-[100px] opacity-50 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(37,99,235,0.16), transparent 70%)" }}
            />
            <div className="relative grid md:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
              {/* left */}
              <div>
                <p
                  className="text-[10.5px] font-semibold tracking-[0.16em] uppercase mb-2 flex items-center gap-1.5"
                  style={{ color: "#B45F06" }}
                >
                  <Sparkles size={12} /> Employee Portal
                </p>
                <h1
                  className="text-3xl md:text-[2.35rem] font-bold tracking-tight text-slate-900 flex items-center gap-2.5"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  Welcome back, {employeeName} <span className="anim-wave inline-block">👋</span>
                </h1>
                <p className="text-slate-500 mt-2.5 text-[15px]">{today}</p>

                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <div className="rounded-xl bg-white/80 border border-white/70 shadow-[0_10px_24px_-8px_rgba(30,41,59,0.14)] px-4 py-3 text-left min-w-[112px]">
                    <p className="text-[10.5px] text-slate-500 tracking-wide uppercase">Leave Balance</p>
                    <p
                      className="text-2xl font-bold tabular-nums"
                      style={{ color: "#B45F06", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {leaveBalance}
                    </p>
                    <p className="text-[10px] text-slate-400">days remaining</p>
                  </div>
                  <div className="rounded-xl bg-white/80 border border-white/70 shadow-[0_10px_24px_-8px_rgba(30,41,59,0.14)] px-4 py-3 text-left min-w-[112px]">
                    <p className="text-[10.5px] text-slate-500 tracking-wide uppercase">Used Days</p>
                    <p
                      className="text-2xl font-bold tabular-nums"
                      style={{ color: "#2563EB", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {usedLeaves}
                    </p>
                    <p className="text-[10px] text-slate-400">this month</p>
                  </div>
                </div>
              </div>

              {/* right — signature pseudo-3D hero scene */}
              <HeroScene />
            </div>
          </GlassPanel>

          {/* ── Task overview cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TaskStatCard
              label="My Tasks"
              value={myTasksCount}
              icon={ClipboardList}
              iconColor="#2563EB"
              gradient="linear-gradient(160deg, rgba(219,234,254,0.55), rgba(255,255,255,0.8))"
              glow="rgba(37,99,235,0.35)"
              idx={0}
            />
            <TaskStatCard
              label="Open Tasks Due Today"
              value={dueTodayCount}
              icon={CalendarDays}
              iconColor="#B45F06"
              gradient="linear-gradient(160deg, rgba(254,243,199,0.6), rgba(255,255,255,0.8))"
              glow="rgba(244,180,0,0.35)"
              idx={1}
            />
            <TaskStatCard
              label="My Overdue Tasks"
              value={overdueCount}
              icon={AlertTriangle}
              iconColor="#DC2626"
              gradient="linear-gradient(160deg, rgba(254,226,226,0.6), rgba(255,255,255,0.8))"
              glow="rgba(239,68,68,0.3)"
              idx={2}
            />
          </div>

          {/* ── 3-column grid ── */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Attendance card */}
            <GlassPanel className="p-6 relative overflow-hidden" hover={false}>
              <SectionHeading
                eyebrow="Today"
                title="Attendance"
                action={
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}
                  >
                    <Clock size={16} style={{ color: "#22C55E" }} />
                  </div>
                }
              />
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-50/70 border border-emerald-900/[0.06] relative overflow-hidden">
                  <span className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full anim-halo-spin" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 relative z-10" style={{ boxShadow: "0 0 8px rgba(34,197,94,0.6)" }} />
                  </span>
                  <span className="text-sm text-slate-600">Session active</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handlePunchIn}
                    className="flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl text-white active:scale-[0.97] transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #22C55E, #16A34A)",
                      boxShadow: "0 8px 22px -4px rgba(34,197,94,0.4)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 28px -4px rgba(34,197,94,0.55)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 8px 22px -4px rgba(34,197,94,0.4)")}
                  >
                    <LogIn size={15} />
                    Punch In
                  </button>
                  <button
                    onClick={handlePunchOut}
                    className="flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl text-white active:scale-[0.97] transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #EF4444, #DC2626)",
                      boxShadow: "0 8px 22px -4px rgba(239,68,68,0.4)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 28px -4px rgba(239,68,68,0.55)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 8px 22px -4px rgba(239,68,68,0.4)")}
                  >
                    <LogOutIcon size={15} />
                    Punch Out
                  </button>
                </div>
              </div>
            </GlassPanel>

            {/* Leave Summary card */}
            <GlassPanel className="p-6" hover={false}>
              <SectionHeading
                eyebrow="This month"
                title="Leave Summary"
                action={
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(244,180,0,0.1)", border: "1px solid rgba(244,180,0,0.28)" }}
                  >
                    <CalendarCheck size={16} style={{ color: "#B45F06" }} />
                  </div>
                }
              />
              <div className="space-y-2.5">
                <StatPill label="Pending" value={pendingLeaves} color="#D97706" />
                <StatPill label="Approved" value={approvedLeaves} color="#22C55E" />
                <StatPill label="Used Days" value={usedLeaves} color="#2563EB" />
                <StatPill label="Available Paid Leaves" value={leaveBalance} color="#B45F06" />

                <button
                  onClick={() => navigate("/leaves")}
                  className="w-full mt-1.5 flex items-center gap-2 justify-center text-sm font-semibold px-4 py-3 rounded-xl text-[#0F172A] active:scale-[0.97] transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #F4B400, #F59E0B)",
                    boxShadow: "0 8px 22px -4px rgba(244,180,0,0.4)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 28px -4px rgba(244,180,0,0.55)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 8px 22px -4px rgba(244,180,0,0.4)")}
                >
                  <CalendarClock size={15} />
                  Apply for Leave
                  <ArrowUpRight size={14} className="ml-auto opacity-80" />
                </button>
              </div>
            </GlassPanel>

            {/* Salary card */}
            <GlassPanel className="p-6" hover={false}>
              <SectionHeading
                eyebrow="Current month"
                title="Salary"
                action={
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)" }}
                  >
                    <Wallet size={16} style={{ color: "#2563EB" }} />
                  </div>
                }
              />
              <div className="space-y-4">
                <div
                  className="rounded-xl p-5 flex flex-col gap-1 relative overflow-hidden border border-white/60"
                  style={{ background: "linear-gradient(160deg, #EFF6FF, #FFFFFF)" }}
                >
                  <div
                    className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl"
                    style={{ background: "rgba(244,180,0,0.25)" }}
                  />
                  <p className="text-slate-500 text-[10px] uppercase tracking-[0.16em] font-semibold relative">Net Pay</p>
                  <p
                    className="text-slate-900 text-3xl font-bold tracking-tight relative tabular-nums"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    ₹{Number(salary.salary || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 relative">Based on hours logged this month</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 py-1.5 border-b border-slate-900/[0.06]">
                    <span>Basic</span><span className="text-slate-600 font-medium tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>₹{Number(salary.basicSalary || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 py-1.5">
                    <span>Hours Logged</span><span className="text-slate-600 font-medium tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{salary.totalHours}h</span>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Leave history mini-table */}
          {leaves.length > 0 && (
            <GlassPanel className="p-6 overflow-hidden" hover={false}>
              <SectionHeading
                eyebrow="History"
                title="Recent Leave Requests"
                action={
                  <button
                    onClick={() => navigate("/leaves")}
                    className="text-xs font-medium flex items-center gap-1 hover:gap-1.5 transition-all"
                    style={{ color: "#B45F06" }}
                  >
                    View all <ArrowUpRight size={13} />
                  </button>
                }
              />
              <div className="overflow-x-auto">
                <table
                  className="w-full text-left text-sm min-w-[480px] border-separate"
                  style={{ borderSpacing: "0 6px" }}
                >
                  <thead>
                    <tr className="text-[11px] text-slate-400 uppercase tracking-wide">
                      {["Type", "Days", "Status"].map((h) => (
                        <th key={h} className="font-semibold pb-2 px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.slice(-4).reverse().map((leave, i) => {
                      const statusMap = {
                        Approved: { icon: CheckCircle2, bg: "bg-emerald-50 text-emerald-600 ring-emerald-500/20" },
                        Pending: { icon: AlertCircle, bg: "bg-amber-50 text-amber-600 ring-amber-500/20" },
                        Rejected: { icon: XCircle, bg: "bg-red-50 text-red-600 ring-red-500/20" },
                      };
                      const s = statusMap[leave.status] || statusMap.Pending;
                      const Icon = s.icon;
                      return (
                        <tr key={i} className="bg-slate-900/[0.015] hover:bg-[#F4B400]/[0.06] transition-colors">
                          <td className="py-3.5 px-3 rounded-l-xl font-medium text-slate-900">
                            {leave.leaveType || "—"}
                          </td>
                          <td className="py-3.5 px-3 text-slate-500 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {leave.leaveDays || "—"} day{leave.leaveDays !== 1 ? "s" : ""}
                          </td>
                          <td className="py-3.5 px-3 rounded-r-xl">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${s.bg}`}>
                              <Icon size={11} />
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          )}
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

        @keyframes haloSpin { to { transform: rotate(360deg); } }
        .anim-halo-spin { background: conic-gradient(from 0deg, rgba(34,197,94,0.5), transparent 60%, rgba(34,197,94,0.5)); animation: haloSpin 3.2s linear infinite; border-radius: 9999px; -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px)); mask: radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px)); }

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
          .anim-wave, .anim-fade-up, .anim-pulse-ring, .anim-slide-in, .anim-halo-spin,
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
