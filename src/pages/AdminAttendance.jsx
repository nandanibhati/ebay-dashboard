import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Clock, Search, Bell, ChevronDown, UserCheck,
  LogIn, LogOut as LogOutIcon, Timer, CalendarDays,
  ArrowUpRight, ArrowDownRight, TrendingUp,
} from "lucide-react";

// ── Visual helpers ────────────────────────────────────────────────────────────
function Avatar({ name = "?" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const COLORS = [
    "from-violet-500 to-indigo-500",
    "from-sky-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-fuchsia-500 to-purple-500",
  ];
  const color = COLORS[initials.charCodeAt(0) % COLORS.length];
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function HoursBadge({ hours }) {
  const h = Number(hours || 0);
  const good = h >= 8;
  const mid  = h >= 5;
  if (good) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
      <ArrowUpRight size={11} />{h.toFixed(1)}h
    </span>
  );
  if (mid) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full">
      <Timer size={11} />{h.toFixed(1)}h
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
      <ArrowDownRight size={11} />{h.toFixed(1)}h
    </span>
  );
}

function TimePill({ time, type }) {
  if (!time) return <span className="text-gray-300 text-sm">—</span>;
  const isIn = type === "in";
  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
      isIn ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
    }`}>
      {isIn ? <LogIn size={11} /> : <LogOutIcon size={11} />}
      {time}
    </div>
  );
}

// ── Main export — ALL logic UNTOUCHED ─────────────────────────────────────────
export default function AdminAttendance() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetch("https://ebay-dashboard-z7h2.onrender.com/api/attendance")
      .then((res) => res.json())
      .then((data) => setAttendance(data))
      .catch((err) => console.log(err));
  }, []);

  // ── UI-only derived stats ──────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  const totalHours    = attendance.reduce((s, r) => s + Number(r.totalHours || 0), 0);
  const avgHours      = attendance.length ? (totalHours / attendance.length).toFixed(1) : "0.0";
  const presentToday  = attendance.filter((r) => r.punchIn).length;
  const fullDays      = attendance.filter((r) => Number(r.totalHours || 0) >= 8).length;

  const filtered = attendance.filter((r) =>
    !search || (r.employeeName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-8 py-4 bg-white/70 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search size={14} className="text-gray-400" />
            <input
              className="bg-transparent text-sm text-gray-500 placeholder:text-gray-400 outline-none w-full"
              placeholder="Search employee…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                AD
              </div>
              <span className="text-sm text-gray-700 font-medium">Admin</span>
              <ChevronDown size={13} className="text-gray-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8 space-y-6">

          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Management</h1>
              <p className="text-gray-400 text-sm mt-1">{attendance.length} records loaded</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-100 px-3 py-2 rounded-xl"
              style={{ boxShadow: "0 1px 4px 0 rgba(0,0,0,0.05)" }}>
              <CalendarDays size={13} />
              {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* ── Summary stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Records",
                value: attendance.length,
                icon: UserCheck,
                glow: "rgba(124,58,237,0.15)",
                iconBg: "bg-violet-100", iconColor: "text-violet-600",
                bar: "bg-gradient-to-r from-violet-400 to-indigo-400",
              },
              {
                label: "Punched In",
                value: presentToday,
                icon: LogIn,
                glow: "rgba(16,185,129,0.15)",
                iconBg: "bg-emerald-100", iconColor: "text-emerald-600",
                bar: "bg-gradient-to-r from-emerald-400 to-teal-400",
              },
              {
                label: "Full Days (8h+)",
                value: fullDays,
                icon: TrendingUp,
                glow: "rgba(14,165,233,0.15)",
                iconBg: "bg-sky-100", iconColor: "text-sky-600",
                bar: "bg-gradient-to-r from-sky-400 to-blue-400",
              },
              {
                label: "Avg Hours / Record",
                value: `${avgHours}h`,
                icon: Clock,
                glow: "rgba(245,158,11,0.15)",
                iconBg: "bg-amber-100", iconColor: "text-amber-600",
                bar: "bg-gradient-to-r from-amber-400 to-orange-400",
              },
            ].map(({ label, value, icon: Icon, glow, iconBg, iconColor, bar }) => (
              <div
                key={label}
                className="relative bg-white rounded-2xl p-5 flex flex-col gap-3 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
                style={{ boxShadow: `0 4px 24px 0 ${glow}, 0 1px 4px 0 rgba(0,0,0,0.05)` }}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <Icon size={16} className={iconColor} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-wider">{label}</p>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${bar}`} />
              </div>
            ))}
          </div>

          {/* ── Table card ── */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 20px 0 rgba(0,0,0,0.06), 0 1px 4px 0 rgba(0,0,0,0.04)" }}
          >
            {/* Table header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Attendance Records</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-gray-600">{attendance.length}</span> entries
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    {["Employee", "Date", "Punch In", "Punch Out", "Hours"].map((h) => (
                      <th key={h} className="text-left py-3 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/80">
                  {filtered.map((item) => (
                    <tr key={item._id} className="hover:bg-violet-50/40 transition-colors duration-150 group">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={item.employeeName} />
                          <span className="text-sm font-medium text-gray-700">{item.employeeName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <CalendarDays size={13} className="text-gray-400" />
                          {item.date}
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <TimePill time={item.punchIn}  type="in" />
                      </td>
                      <td className="py-3.5 px-6">
                        <TimePill time={item.punchOut} type="out" />
                      </td>
                      <td className="py-3.5 px-6">
                        <HoursBadge hours={item.totalHours} />
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <UserCheck size={28} className="text-gray-300" />
                          <p className="text-sm">{search ? "No matching records" : "Loading attendance…"}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
              <p className="text-xs text-gray-400">
                Total hours logged: <span className="font-semibold text-gray-700">{totalHours.toFixed(1)}h</span>
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />8h+ full day</span>
                <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />5–8h partial</span>
                <span className="flex items-center gap-1 text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Under 5h</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
