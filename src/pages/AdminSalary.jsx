import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Wallet,
  Clock3,
  IndianRupee,
  Pencil,
  Users,
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

export default function AdminSalary() {
  const [employees, setEmployees] = useState([]);
  const [monthlyHours, setMonthlyHours] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [basicSalary, setBasicSalary] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state

  useEffect(() => {
    ensureFonts();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/auth/employees"
      );

      const data = await res.json();

      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const updateSalary = async () => {
    try {
      const res = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/auth/employee/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthlySalary: basicSalary,
            monthlyHours,
          }),
        }
      );

      const data = await res.json();

      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === editingId
            ? {
                ...emp,
                monthlySalary: Number(basicSalary),
                monthlyHours: Number(monthlyHours),
              }
            : emp
        )
      );

      if (data.success) {
        alert("Salary Updated Successfully");

        setEditingId(null);
        setBasicSalary("");
        setMonthlyHours("");

        fetchEmployees();
      }
    } catch (error) {
      console.log(error);
      alert("Failed to Update Salary");
    }
  };

  const totalEmployees = employees.length;
  const markSalaryPaid = async (id) => {
    try {
      await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/auth/employee/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lastSalaryPaidMonth: new Date().getMonth() + 1,
            lastSalaryPaidYear: new Date().getFullYear(),
          }),
        }
      );

      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-[#F4B400] focus:bg-white focus:ring-4 focus:ring-[#F4B400]/12 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50";

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

      <div className="p-4 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">

        {/* Top bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-500" style={{ fontFamily: "Sora, sans-serif" }}>
            Payroll
          </span>
        </div>

        {/* Hero Section */}
        <div
          className="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div className="absolute right-0 bottom-0 opacity-[0.06] translate-x-10 translate-y-10 pointer-events-none">
            <Wallet size={320} />
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
              <Wallet size={11} /> Payroll Operations
            </span>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
              Salary Management
            </h1>
            <p className="mt-1.5 text-slate-400 text-sm max-w-xl font-medium">
              Manage employee pay ledgers, adjust baseline compensation, and track payment status dynamically.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md"
            style={{ background: "linear-gradient(160deg, rgba(37,99,235,0.06), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                Total Roster
              </p>
              <h2
                className="text-3xl font-bold mt-2 text-slate-900 tracking-tight tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {totalEmployees} <span className="text-sm font-normal text-slate-400">employees</span>
              </h2>
            </div>
            <div className="bg-white/80 border border-blue-100 p-3.5 rounded-xl text-blue-600 shadow-sm">
              <Users size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md"
            style={{ background: "linear-gradient(160deg, rgba(34,197,94,0.06), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                Salary Configuration
              </p>
              <h2 className="text-2xl font-bold mt-2 text-emerald-600 inline-flex items-center gap-2 tracking-tight">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live System
              </h2>
            </div>
            <div className="bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-emerald-600 shadow-sm">
              <Wallet size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md"
            style={{ background: "linear-gradient(160deg, rgba(244,180,0,0.08), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                Financial Ledger
              </p>
              <h2 className="text-2xl font-bold mt-2 tracking-tight" style={{ color: "#B45F06" }}>
                Ready
              </h2>
            </div>
            <div className="bg-white/80 border p-3.5 rounded-xl shadow-sm" style={{ borderColor: "rgba(244,180,0,0.3)", color: "#B45F06" }}>
              <IndianRupee size={22} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Edit Card Component */}
        {editingId && (
          <div
            className="bg-white rounded-2xl border-2 shadow-xl p-6 transition-all animate-fadeIn"
            style={{ borderColor: "rgba(244,180,0,0.3)", boxShadow: "0 20px 45px -14px rgba(244,180,0,0.15)" }}
          >
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-lg" style={{ background: "rgba(244,180,0,0.12)", color: "#B45F06" }}>
                <Pencil size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Modify Compensation
                </h2>
                <p className="text-xs text-slate-400">Update pay parameters for this employee.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Salary (₹ / Month)</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Working Hours</label>
                <input
                  type="number"
                  placeholder="e.g. 168"
                  value={monthlyHours}
                  onChange={(e) => setMonthlyHours(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={updateSalary}
                className="px-5 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all"
                style={{
                  background: "linear-gradient(135deg, #F4B400, #F59E0B)",
                  color: "#0F172A",
                  boxShadow: "0 8px 20px -6px rgba(244,180,0,0.4)",
                }}
              >
                Apply Changes
              </button>

              <button
                onClick={() => {
                  setEditingId(null);
                  setBasicSalary("");
                  setMonthlyHours("");
                }}
                className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Payroll Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col">

          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
                Staff Payroll Registry
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Calculated dynamically relative to hours and base parameters.</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-4 py-4">Contact</th>
                  <th className="px-4 py-4">Join Date</th>
                  <th className="px-4 py-4">Salary</th>
                  <th className="px-4 py-4">Hours</th>
                  <th className="px-4 py-4">Hourly Rate</th>
                  <th className="px-4 py-4">Payable</th>
                  <th className="px-4 py-4">Due Date</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {employees.map((emp) => {
                  const hours = Number(emp.monthlyHours || 0);
                  const hourlyRate = Number(emp.monthlySalary || 0) / (8 * 6 * 4.33);
                  const salary = hours * hourlyRate;
                  const joining = new Date(emp.joiningDate);

                  const payoutDay = joining.getDate();

                  const today = new Date();

                  const dueDate = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    payoutDay
                  );

                  const diffDays = Math.floor(
                    (today - dueDate) / (1000 * 60 * 60 * 24)
                  );

                  const currentMonth = today.getMonth() + 1;
                  const currentYear = today.getFullYear();

                  const alreadyPaid =
                    emp.lastSalaryPaidMonth === currentMonth &&
                    emp.lastSalaryPaidYear === currentYear;

                  let status = "";
                  let overdue = "";

                  if (alreadyPaid) {
                    status = "Paid";
                    overdue = "-";
                  } else if (diffDays > 0) {
                    status = "Overdue";
                    overdue = `${diffDays} Days`;
                  } else if (diffDays === 0) {
                    status = "Due Today";
                    overdue = "0 Days";
                  } else {
                    status = "Upcoming";
                    overdue = "-";
                  }

                  return (
                    <tr
                      key={emp._id}
                      className="hover:bg-[#F4B400]/[0.05] transition-all group"
                    >
                      {/* Avatar & Name Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-sm tracking-wide"
                            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
                          >
                            {emp.name?.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#B45F06] transition-colors">
                              {emp.name}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-bold tracking-wide uppercase mt-0.5 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" /> Active
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Email */}
                      <td className="px-4 py-4 font-medium text-slate-500 text-xs">
                        {emp.email}
                      </td>

                      <td className="px-4 py-4">
                        {joining.toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4 font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        ₹{Number(emp.monthlySalary).toLocaleString("en-IN")}
                      </td>

                      {/* Logged hours */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                          <Clock3 size={12} className="text-slate-400 stroke-[2.5]" />
                          <span>{hours.toFixed(2)} hrs</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        ₹{hourlyRate.toFixed(2)}/hr
                      </td>

                      {/* Total Pay */}
                      <td
                        className="px-4 py-4 font-black text-emerald-600 text-base"
                        style={{ background: "rgba(34,197,94,0.05)", fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        ₹{salary.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-4">
                        {dueDate.toLocaleDateString("en-GB")}
                      </td>

                      <td className="px-4 py-4">
                        {status === "Paid" ? (
                          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            ✅ Paid
                          </span>
                        ) : status === "Overdue" ? (
                          <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                            🔴 {overdue}
                          </span>
                        ) : status === "Due Today" ? (
                          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                            🟡 Due Today
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            🔵 Upcoming
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(emp._id);
                              setBasicSalary(emp.monthlySalary || 0);
                              setMonthlyHours(emp.monthlyHours || 0);
                            }}
                            className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:scale-[0.97] transition-all shadow-sm"
                          >
                            <Pencil size={12} className="stroke-[2.5]" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => markSalaryPaid(emp._id)}
                            className="text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
                          >
                            ✓ Paid
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) { .anim-slide-in { animation: none !important; } }
      `}</style>
    </div>
  );
}
