import EmployeeSidebar from "../components/EmployeeSidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LogIn, LogOut as LogOutIcon, CalendarCheck, CalendarX, CalendarClock,
  Wallet, Bell, Search, ChevronDown, ArrowUpRight, Sparkles,
  Clock, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

// ── Purely visual helpers ─────────────────────────────────────────────────────

function StatPill({ label, value, color }) {
  const styles = {
    violet:  { dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-100" },
    emerald: { dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
    amber:   { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-100" },
    rose:    { dot: "bg-rose-400",    text: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-100" },
    sky:     { dot: "bg-sky-400",     text: "text-sky-700",     bg: "bg-sky-50",     border: "border-sky-100" },
  };
  const s = styles[color] || styles.violet;
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${s.bg} ${s.border}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <span className={`text-sm font-bold ${s.text}`}>{value}</span>
    </div>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ${className}`}
      style={{ boxShadow: "0 2px 20px 0 rgba(0,0,0,0.06), 0 1px 4px 0 rgba(0,0,0,0.04)" }}
    >
      {children}
    </div>
  );
}

// ── Main export — ALL logic UNTOUCHED ─────────────────────────────────────────
export default function EmployeeDashboard() {
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(2);

  const employeeName = localStorage.getItem("employeeName") || "Employee";
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("employeeEmail");

    fetch("https://ebay-dashboard-z7h2.onrender.com/api/leaves")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeaves(data.leaves.filter((leave) => leave.employeeEmail === email));
        }
      })
      .catch((err) => console.log(err));

    fetch(`https://ebay-dashboard-z7h2.onrender.com/api/auth/employee/${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeaveBalance(data.employee.monthlyLeaveBalance || 0);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handlePunchIn = async () => {
    try {
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/attendance/punch-in",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: localStorage.getItem("employeeEmail"),
            employeeName: localStorage.getItem("employeeName"),
            employeeEmail: localStorage.getItem("employeeEmail"),
          }),
        }
      );
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.log(error);
      alert("Punch In Failed");
    }
  };

  const handlePunchOut = async () => {
    try {
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/attendance/punch-out",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeEmail: localStorage.getItem("employeeEmail"),
          }),
        }
      );
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.log(error);
      alert("Punch Out Failed");
    }
  };

  const pendingLeaves  = leaves.filter((l) => l.status === "Pending").length;
  const approvedLeaves = leaves.filter((l) => l.status === "Approved").length;
  const usedLeaves     = leaves
    .filter((l) => l.status === "Approved")
    .reduce((sum, l) => sum + Number(l.leaveDays || 0), 0);

  // ── UI only ────────────────────────────────────────────────────────────────
  const initials = employeeName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <EmployeeSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-8 py-4 bg-white/70 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search size={14} className="text-gray-400" />
            <input
              className="bg-transparent text-sm text-gray-500 placeholder:text-gray-400 outline-none w-full"
              placeholder="Search…"
              readOnly
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                {initials}
              </div>
              <span className="text-sm text-gray-700 font-medium">{employeeName}</span>
              <ChevronDown size={13} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* ── Page body ── */}
        <main className="flex-1 px-8 py-8 space-y-8">

          {/* Welcome banner */}
          <div
            className="relative rounded-2xl overflow-hidden px-8 py-7 flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #0ea5e9 100%)",
              boxShadow: "0 8px 32px 0 rgba(124,58,237,0.25)",
            }}
          >
            {/* decorative circles */}
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-12 right-24 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-violet-200" />
                <span className="text-violet-200 text-xs font-medium uppercase tracking-widest">Employee Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Welcome back, {employeeName} 👋
              </h1>
              <p className="text-white/60 text-sm mt-1">{today}</p>
            </div>

            <div className="relative z-10 hidden md:flex items-center gap-3">
              <div className="text-right mr-2">
                <p className="text-white/60 text-xs">Leave Balance</p>
                <p className="text-white text-2xl font-bold">{leaveBalance}</p>
                <p className="text-white/50 text-xs">days remaining</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-right">
                <p className="text-white/60 text-xs">Used Days</p>
                <p className="text-white text-2xl font-bold">{usedLeaves}</p>
                <p className="text-white/50 text-xs">this month</p>
              </div>
            </div>
          </div>

          {/* ── 3-column grid ── */}
          <div className="grid md:grid-cols-3 gap-5">

            {/* Attendance card */}
            <SectionCard>
              <div className="px-6 pt-6 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Clock size={17} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Attendance</h2>
                    <p className="text-xs text-gray-400">Today's Status</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-gray-500">Session active</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handlePunchIn}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all duration-150"
                    style={{ boxShadow: "0 4px 14px 0 rgba(16,185,129,0.35)" }}
                  >
                    <LogIn size={15} />
                    Punch In
                  </button>
                  <button
                    onClick={handlePunchOut}
                    className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-400 active:scale-95 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all duration-150"
                    style={{ boxShadow: "0 4px 14px 0 rgba(244,63,94,0.30)" }}
                  >
                    <LogOutIcon size={15} />
                    Punch Out
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Leave Summary card */}
            <SectionCard>
              <div className="px-6 pt-6 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                    <CalendarCheck size={17} className="text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Leave Summary</h2>
                    <p className="text-xs text-gray-400">This month's breakdown</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-2.5">
                <StatPill label="Pending Leaves"  value={pendingLeaves}  color="amber" />
                <StatPill label="Approved Leaves" value={approvedLeaves} color="emerald" />
                <StatPill label="Used Leave Days" value={usedLeaves}     color="sky" />
                <StatPill label="Available Paid Leaves" value={leaveBalance} color="violet" />

                <button
                  onClick={() => navigate("/leaves")}
                  className="w-full mt-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all duration-150"
                  style={{ boxShadow: "0 4px 14px 0 rgba(124,58,237,0.30)" }}
                >
                  <CalendarClock size={15} />
                  Apply for Leave
                  <ArrowUpRight size={14} className="ml-auto opacity-70" />
                </button>
              </div>
            </SectionCard>

            {/* Salary card */}
            <SectionCard>
              <div className="px-6 pt-6 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
                    <Wallet size={17} className="text-sky-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Salary Summary</h2>
                    <p className="text-xs text-gray-400">Current month</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div
                  className="rounded-xl p-5 flex flex-col gap-1"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                    boxShadow: "0 4px 20px 0 rgba(14,165,233,0.25)",
                  }}
                >
                  <p className="text-white/60 text-xs uppercase tracking-wider font-medium">Net Pay</p>
                  <p className="text-white text-3xl font-bold tracking-tight">₹0</p>
                  <p className="text-white/50 text-xs mt-1">Disbursement pending</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400 py-1.5 border-b border-gray-100">
                    <span>Basic</span><span className="text-gray-600 font-medium">₹—</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 py-1.5 border-b border-gray-100">
                    <span>Deductions</span><span className="text-gray-600 font-medium">₹—</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 py-1.5">
                    <span>Bonus</span><span className="text-gray-600 font-medium">₹—</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Leave history mini-table */}
          {leaves.length > 0 && (
            <SectionCard>
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Recent Leave Requests</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{leaves.length} total requests</p>
                </div>
                <button
                  onClick={() => navigate("/leaves")}
                  className="text-xs text-violet-600 hover:text-violet-500 font-medium flex items-center gap-1"
                >
                  View all <ArrowUpRight size={12} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80">
                      {["Type", "Days", "Status"].map((h) => (
                        <th key={h} className="text-left py-3 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leaves.slice(-4).reverse().map((leave, i) => {
                      const statusMap = {
                        Approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                        Pending:  { icon: AlertCircle,  color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
                        Rejected: { icon: XCircle,      color: "text-rose-600",    bg: "bg-rose-50 border-rose-100" },
                      };
                      const s = statusMap[leave.status] || statusMap.Pending;
                      const Icon = s.icon;
                      return (
                        <tr key={i} className="hover:bg-violet-50/30 transition-colors">
                          <td className="py-3.5 px-6 text-sm text-gray-700 font-medium">{leave.leaveType || "—"}</td>
                          <td className="py-3.5 px-6 text-sm text-gray-500">{leave.leaveDays || "—"} day{leave.leaveDays !== 1 ? "s" : ""}</td>
                          <td className="py-3.5 px-6">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.color}`}>
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
            </SectionCard>
          )}
        </main>
      </div>
    </div>
  );
}
