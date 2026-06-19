import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  CalendarDays, Search, Bell, ChevronDown,
  CheckCircle2, XCircle, Clock, AlertCircle,
  CalendarCheck, CalendarX, Loader2, Filter,
} from "lucide-react";

// ── Visual helpers ────────────────────────────────────────────────────────────
function Avatar({ name = "?" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const COLORS = [
    "from-violet-500 to-indigo-500", "from-sky-500 to-blue-500",
    "from-emerald-500 to-teal-500",  "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",     "from-fuchsia-500 to-purple-500",
  ];
  const color = COLORS[initials.charCodeAt(0) % COLORS.length];
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Approved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
    Rejected: { cls: "bg-rose-50 text-rose-600 border-rose-100",         icon: XCircle },
    Pending:  { cls: "bg-amber-50 text-amber-700 border-amber-100",       icon: Clock },
  };
  const { cls, icon: Icon } = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      <Icon size={11} />{status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, glow, iconBg, iconColor, bar }) {
  return (
    <div
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
  );
}

// ── Main export — ALL logic UNTOUCHED ─────────────────────────────────────────
export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = async () => {
    try {
      const response = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/leaves");
      const data = await response.json();
      if (data.success) setLeaves(data.leaves);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const approveLeave = async (id) => {
    try {
      await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/leaves/approve/${id}`, { method: "PUT" });
      fetchLeaves();
    } catch (error) { console.log(error); }
  };

  const rejectLeave = async (id) => {
    try {
      await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/leaves/reject/${id}`, { method: "PUT" });
      fetchLeaves();
    } catch (error) { console.log(error); }
  };

  // ── UI-only state ──────────────────────────────────────────────────────────
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");
  const [actioning, setActioning] = useState(null);

  const pending  = leaves.filter((l) => l.status === "Pending").length;
  const approved = leaves.filter((l) => l.status === "Approved").length;
  const rejected = leaves.filter((l) => l.status === "Rejected").length;
  const totalDays = leaves
    .filter((l) => l.status === "Approved")
    .reduce((s, l) => s + Number(l.leaveDays || 0), 0);

  const filtered = leaves.filter((l) => {
    const matchSearch = !search || (l.employeeName || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || l.status === filter;
    return matchSearch && matchFilter;
  });

  const handleApprove = async (id) => { setActioning(id + "_approve"); await approveLeave(id); setActioning(null); };
  const handleReject  = async (id) => { setActioning(id + "_reject");  await rejectLeave(id);  setActioning(null); };

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
              {pending > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {pending}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">AD</div>
              <span className="text-sm text-gray-700 font-medium">Admin</span>
              <ChevronDown size={13} className="text-gray-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8 space-y-6">

          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leave Management</h1>
              <p className="text-gray-400 text-sm mt-1">{leaves.length} total requests</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-100 px-3 py-2 rounded-xl"
              style={{ boxShadow: "0 1px 4px 0 rgba(0,0,0,0.05)" }}>
              <CalendarDays size={13} />
              {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* ── Summary stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Requests" value={leaves.length}  icon={CalendarDays}  glow="rgba(124,58,237,0.15)"  iconBg="bg-violet-100"  iconColor="text-violet-600"  bar="bg-gradient-to-r from-violet-400 to-indigo-400" />
            <StatCard label="Pending"        value={pending}         icon={AlertCircle}   glow="rgba(245,158,11,0.15)"  iconBg="bg-amber-100"   iconColor="text-amber-600"   bar="bg-gradient-to-r from-amber-400 to-orange-400" />
            <StatCard label="Approved"       value={approved}        icon={CalendarCheck} glow="rgba(16,185,129,0.15)"  iconBg="bg-emerald-100" iconColor="text-emerald-600" bar="bg-gradient-to-r from-emerald-400 to-teal-400" />
            <StatCard label="Days Approved"  value={`${totalDays}d`} icon={CalendarX}     glow="rgba(244,63,94,0.12)"   iconBg="bg-rose-100"    iconColor="text-rose-500"    bar="bg-gradient-to-r from-rose-400 to-pink-400" />
          </div>

          {/* ── Table card ── */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 20px 0 rgba(0,0,0,0.06), 0 1px 4px 0 rgba(0,0,0,0.04)" }}
          >
            {/* Table toolbar */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 gap-4 flex-wrap">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Leave Requests</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-gray-600">{leaves.length}</span>
                </p>
              </div>
              {/* Filter tabs */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                {["All", "Pending", "Approved", "Rejected"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      filter === tab
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                    {tab === "Pending" && pending > 0 && (
                      <span className="ml-1.5 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {pending}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    {["Employee", "From", "To", "Type", "Days", "Reason", "Status", "Action"].map((h) => (
                      <th key={h} className="text-left py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/80">
                  {filtered.map((leave) => {
                    const appKey = leave._id + "_approve";
                    const rejKey = leave._id + "_reject";
                    return (
                      <tr key={leave._id} className="hover:bg-violet-50/30 transition-colors duration-150">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={leave.employeeName} />
                            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{leave.employeeName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-sm text-gray-500 whitespace-nowrap">{leave.fromDate}</td>
                        <td className="py-3.5 px-5 text-sm text-gray-500 whitespace-nowrap">{leave.toDate}</td>
                        <td className="py-3.5 px-5">
                          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg whitespace-nowrap">
                            {leave.leaveType}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="text-sm font-bold text-gray-800">{leave.leaveDays}</span>
                          <span className="text-xs text-gray-400 ml-0.5">d</span>
                        </td>
                        <td className="py-3.5 px-5 max-w-[160px]">
                          <p className="text-sm text-gray-500 truncate" title={leave.reason}>{leave.reason}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <StatusBadge status={leave.status} />
                        </td>
                        <td className="py-3.5 px-5">
                          {leave.status === "Pending" ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(leave._id)}
                                disabled={!!actioning}
                                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-all"
                                style={{ boxShadow: "0 2px 8px 0 rgba(16,185,129,0.30)" }}
                              >
                                {actioning === appKey
                                  ? <Loader2 size={11} className="animate-spin" />
                                  : <CheckCircle2 size={11} />}
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(leave._id)}
                                disabled={!!actioning}
                                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-400 active:scale-95 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-all"
                                style={{ boxShadow: "0 2px 8px 0 rgba(244,63,94,0.25)" }}
                              >
                                {actioning === rejKey
                                  ? <Loader2 size={11} className="animate-spin" />
                                  : <XCircle size={11} />}
                                Reject
                              </button>
                            </div>
                          ) : leave.status === "Approved" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                              <CheckCircle2 size={11} /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg">
                              <XCircle size={11} /> Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <CalendarDays size={28} className="text-gray-300" />
                          <p className="text-sm">{search || filter !== "All" ? "No matching requests" : "Loading leaves…"}</p>
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
                Approved days total: <span className="font-semibold text-gray-700">{totalDays} days</span>
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Pending review</span>
                <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Approved</span>
                <span className="flex items-center gap-1 text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Rejected</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
