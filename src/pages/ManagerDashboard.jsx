import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ManagerSidebar from "../components/ManagerSidebar";
import TaskManagerBoard from "../components/TaskManagerBoard";
import PendingSignups from "../components/PendingSignups";
import { Toaster } from "react-hot-toast";
import { Menu, X, Package, Clock3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "../api";
import InstallAppBar from "../components/InstallAppBar";

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

function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: "#F8FAFC" }} />
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
        }}
      />
      <div
        className="absolute -top-40 -left-32 w-[36rem] h-[36rem] rounded-full blur-3xl anim-drift-a"
        style={{ background: "radial-gradient(circle, rgba(244,180,0,0.10), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 right-0 w-[30rem] h-[30rem] rounded-full blur-3xl anim-drift-b"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)" }}
      />
    </div>
  );
}

function GlassPanel({ children, className = "", style = {} }) {
  return (
    <div
      className={`relative rounded-[22px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_20px_45px_-12px_rgba(30,41,59,0.14)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [presentTodayCount, setPresentTodayCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    ensureFonts();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await apiFetch("/api/tasks");
      const data = await res.json();
      if (data.success) setTasks(data.tasks);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await apiFetch("/api/auth/employees");
      const data = await res.json();
      if (data.success) setEmployees(data.employees);
    } catch (error) {
      console.log(error);
    }
  };

  // Read-only, non-financial team summary — counts only, no cost/profit data.
  const fetchSummary = async () => {
    try {
      const [stockRes, attendanceRes] = await Promise.all([
        apiFetch("/api/stock"),
        apiFetch("/api/attendance"),
      ]);

      const stock = await stockRes.json();
      const attendance = await attendanceRes.json();

      if (Array.isArray(stock)) {
        setLowStockCount(
          stock.filter((s) => Number(s.quantity || 0) <= Number(s.minimumStock || 5)).length
        );
      }

      if (Array.isArray(attendance)) {
        // Attendance rows are tagged with the business's Asia/Kolkata date
        // (see attendanceRoutes.js) regardless of the server's or this
        // viewer's own timezone, so "today" here must match that, not UTC.
        const todayIST = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
        setPresentTodayCount(
          attendance.filter((a) => a.date === todayIST && a.punchIn).length
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
    fetchSummary();
  }, []);

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui", color: "#0F172A" }}
    >
      <PremiumBackground />
      <Toaster position="top-right" reverseOrder={false} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl anim-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={17} />
            </button>
            <ManagerSidebar />
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <InstallAppBar />
        <header className="sticky top-0 z-20 h-[72px] flex items-center gap-3 px-5 lg:px-10 border-b border-slate-900/[0.06] bg-white/70 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.06]"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-sm font-semibold text-slate-700 tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
            Manager Workspace
          </h1>
        </header>

        <div className="flex-1 px-5 lg:px-10 py-8 max-w-[1800px] mx-auto w-full flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <GlassPanel className="p-6 sm:p-8 overflow-hidden relative">
              <div
                className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-60 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(244,180,0,0.18), transparent 70%)" }}
              />
              <div className="relative z-10">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
                  style={{ background: "rgba(244,180,0,0.12)", border: "1px solid rgba(244,180,0,0.28)", color: "#B45F06" }}
                >
                  <Sparkles size={12} /> Manager Overview
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>
                  Team Overview
                </h1>
                <p className="mt-1.5 text-slate-500 text-sm max-w-xl font-medium">
                  Track your team's tasks and day-to-day operations at a glance.
                </p>
              </div>
            </GlassPanel>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { label: "Team Members", value: employees.length, icon: Sparkles, color: "#2563EB" },
              { label: "Low Stock Items", value: lowStockCount, icon: Package, color: "#F59E0B" },
              { label: "Present Today", value: presentTodayCount, icon: Clock3, color: "#22C55E" },
            ].map((stat) => (
              <GlassPanel
                key={stat.label}
                className="p-5 flex justify-between items-center"
                style={{ background: `linear-gradient(160deg, ${stat.color}14, rgba(255,255,255,0.85))` }}
              >
                <div>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">{stat.label}</p>
                  <h2
                    className="text-xl sm:text-2xl font-bold mt-1.5 tracking-tight text-slate-900 tabular-nums"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {stat.value}
                  </h2>
                </div>
                <div className="p-3 rounded-xl bg-white/80 shadow-[0_4px_14px_rgba(0,0,0,0.08)]" style={{ border: `1px solid ${stat.color}33` }}>
                  <stat.icon size={20} className="stroke-[2.5]" style={{ color: stat.color }} />
                </div>
              </GlassPanel>
            ))}
          </div>

          <PendingSignups isAdmin={false} />

          <TaskManagerBoard
            tasks={tasks}
            employees={employees}
            currentUserName={localStorage.getItem("employeeName") || "Manager"}
            onTasksChanged={fetchTasks}
            initialViewMode={searchParams.get("view") === "archived" ? "archived" : "active"}
            canDeleteAnyTask={false}
          />
        </div>
      </div>

      <style>{`
        @keyframes driftA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,20px); } }
        @keyframes driftB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-25px,25px); } }
        .anim-drift-a { animation: driftA 14s ease-in-out infinite; }
        .anim-drift-b { animation: driftB 17s ease-in-out infinite; }

        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }

        @media (prefers-reduced-motion: reduce) {
          .anim-drift-a, .anim-drift-b, .anim-slide-in { animation: none !important; }
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.12); border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
