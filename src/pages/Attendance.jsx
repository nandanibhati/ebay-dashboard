import { useEffect, useState } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  LogIn,
  LogOut,
  UserCheck,
  TrendingUp,
  FileSpreadsheet,
  Activity,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

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

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state

  useEffect(() => {
    ensureFonts();
  }, []);

  useEffect(() => {
    fetch("https://ebay-dashboard-z7h2.onrender.com/api/attendance")
      .then((res) => res.json())
      .then((data) => {
        const email = localStorage.getItem("employeeEmail");
        const filtered = data.filter((item) => item.employeeEmail === email);
        setAttendance(filtered);
      })
      .catch((err) => console.log(err));
  }, []);

  // Derived metrics
  const totalDaysLogged = attendance.length;

  const totalHoursLogged = attendance.reduce(
    (sum, item) => sum + Number(item.totalHours || 0),
    0
  );

  const avgShiftDuration =
    totalDaysLogged > 0
      ? (totalHoursLogged / totalDaysLogged).toFixed(1)
      : "0.0";

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
            <EmployeeSidebar />
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
            Attendance
          </span>
        </div>

        {/* Hero Banner */}
        <div
          className="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div className="absolute right-0 bottom-0 opacity-[0.06] translate-x-10 translate-y-10 pointer-events-none">
            <CalendarCheck size={320} />
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
              <CalendarCheck size={11} /> Attendance
            </span>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ fontFamily: "Sora, sans-serif" }}>
              My Attendance
            </h1>
            <p className="mt-1.5 text-slate-400 text-sm max-w-xl font-medium">
              Track your shift history, punch-in and punch-out times, and total hours worked.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md"
            style={{ background: "linear-gradient(160deg, rgba(37,99,235,0.06), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Shifts Logged</p>
              <h2
                className="text-3xl font-bold mt-2 text-slate-900 tracking-tight tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {totalDaysLogged} Days
              </h2>
            </div>
            <div className="bg-white/80 border border-blue-100 p-3.5 rounded-xl text-blue-600 shadow-sm">
              <UserCheck size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md"
            style={{ background: "linear-gradient(160deg, rgba(34,197,94,0.06), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Hours Logged</p>
              <h2
                className="text-3xl font-bold mt-2 text-emerald-600 tracking-tight tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {totalHoursLogged.toFixed(1)} Hrs
              </h2>
            </div>
            <div className="bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-emerald-600 shadow-sm">
              <Clock size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md"
            style={{ background: "linear-gradient(160deg, rgba(244,180,0,0.08), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Average Shift Length</p>
              <h2
                className="text-3xl font-bold mt-2 tracking-tight tabular-nums"
                style={{ color: "#B45F06", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {avgShiftDuration} Hrs/Day
              </h2>
            </div>
            <div className="bg-white/80 border p-3.5 rounded-xl shadow-sm" style={{ borderColor: "rgba(244,180,0,0.3)", color: "#B45F06" }}>
              <TrendingUp size={22} className="stroke-[2.5]" />
            </div>
          </div>

        </div>

        {/* History Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col"
        >

          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>Attendance History</h2>
              <p className="text-xs text-slate-400 mt-0.5">Detailed log of punch-in and punch-out times and durations.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold shadow-sm">
              <Activity size={13} className="text-emerald-500 animate-pulse" />
              <span className="text-slate-600">Live</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-4 py-4">Punch In</th>
                  <th className="px-4 py-4">Punch Out</th>
                  <th className="px-6 py-4 text-center">Hours Worked</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-16 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <FileSpreadsheet size={32} className="text-slate-300 stroke-[1.5]" />
                        <span>No attendance records found for your account yet.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {attendance.map((item) => (
                  <tr key={item._id} className="hover:bg-[#F4B400]/[0.05] transition-all group">

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 group-hover:text-[#B45F06] transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-[#F4B400] transition-all" />
                        <span>{item.date}</span>
                      </div>
                    </td>

                    {/* Punch In */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-800 text-xs font-bold"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        <LogIn size={12} className="text-emerald-500 stroke-[2.5]" />
                        <span>{item.punchIn || "—:—"}</span>
                      </div>
                    </td>

                    {/* Punch Out */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          item.punchOut
                            ? "bg-red-50/60 border-red-100 text-red-800"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        <LogOut size={12} className={item.punchOut ? "text-red-500 stroke-[2.5]" : "text-slate-300"} />
                        <span>{item.punchOut || "Active"}</span>
                      </div>
                    </td>

                    {/* Hours Worked */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-center">
                        <span
                          className="text-xs font-black text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md shadow-sm"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {item.totalHours || 0} Hours
                        </span>

                        <span className={`w-1.5 h-1.5 rounded-full ${
                          Number(item.totalHours || 0) >= 8
                            ? "bg-emerald-500"
                            : Number(item.totalHours || 0) >= 4
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`} />
                      </div>
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
