import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Mail,
  Fingerprint,
  Calendar,
  IndianRupee,
  Briefcase,
  Pencil,
  Trash2,
  FileText,
  ShieldCheck,
  Percent,
  Menu,
  X,
} from "lucide-react";
import { apiFetch } from "../api";

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

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    joiningDate: "",
    monthlySalary: "",
  });

  useEffect(() => {
    ensureFonts();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await apiFetch(
        "/api/auth/employees"
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

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/auth/employee/${editingId}`
        : "/api/auth/signup";

      const method = editingId ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...form,
          role: "employee",
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingId ? "Employee Updated" : "Employee Added");

        setForm({
          name: "",
          email: "",
          password: "",
          employeeId: "",
          joiningDate: "",
          monthlySalary: "",
        });

        fetchEmployees();
        setEditingId(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete Employee?")) return;

    try {
      const res = await apiFetch(
        `/api/auth/employee/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        fetchEmployees();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Dashboard metrics
  const totalStaff = employees.length;
  const totalBasePayroll = employees.reduce((s, e) => s + Number(e.monthlySalary || 0), 0);
  const averageHourlyRate =
    totalStaff > 0
      ? (
          employees.reduce(
            (s, e) => s + Number(e.hourlyRate || 0),
            0
          ) / totalStaff
        ).toFixed(2)
      : "0.00";

  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-[#F4B400] focus:bg-white focus:ring-4 focus:ring-[#F4B400]/12 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1";

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
            Employees
          </span>
        </div>

        <div
          className="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div className="absolute right-0 bottom-0 opacity-[0.06] translate-x-10 translate-y-10 pointer-events-none">
            <Users size={320} />
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
              <Users size={11} /> Employee Directory
            </span>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ fontFamily: "Sora, sans-serif" }}>
              Employees
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <div
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md"
            style={{ background: "linear-gradient(160deg, rgba(37,99,235,0.06), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Employees</p>
              <h2
                className="text-3xl font-bold mt-2 text-slate-900 tracking-tight tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {totalStaff} Employees
              </h2>
            </div>
            <div className="bg-white/80 border border-blue-100 p-3.5 rounded-xl text-blue-600 shadow-sm">
              <Users size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md"
            style={{ background: "linear-gradient(160deg, rgba(244,180,0,0.08), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Average Hourly Rate</p>
              <h2
                className="text-3xl font-bold mt-2 tracking-tight tabular-nums"
                style={{ color: "#B45F06", fontFamily: "'JetBrains Mono', monospace" }}
              >
                ₹{averageHourlyRate}/hr
              </h2>
            </div>
            <div className="bg-white/80 border p-3.5 rounded-xl shadow-sm" style={{ borderColor: "rgba(244,180,0,0.3)", color: "#B45F06" }}>
              <Briefcase size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md"
            style={{ background: "linear-gradient(160deg, rgba(34,197,94,0.06), rgba(255,255,255,0.9))" }}
          >
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Base Salary</p>
              <h2
                className="text-3xl font-bold mt-2 text-emerald-600 tracking-tight tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ₹{totalBasePayroll.toLocaleString("en-IN")}
              </h2>
            </div>
            <div className="bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-emerald-600 shadow-sm">
              <IndianRupee size={22} className="stroke-[2.5]" />
            </div>
          </div>

        </div>

        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddEmployee}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/80 p-6 flex flex-col gap-5"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg" style={{ background: "rgba(244,180,0,0.12)", color: "#B45F06" }}>
              <UserPlus size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
                {editingId ? "Edit Employee" : "Add New Employee"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Set their login, ID, and salary details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

            <div>
              <label className={labelCls}>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rohan Sharma"
                className={inputCls}
                value={form.name}
                required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                placeholder="rohan@domain.com"
                className={inputCls}
                value={form.email}
                required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                placeholder={editingId ? "Leave blank to keep unchanged" : "••••••••••••"}
                className={inputCls}
                value={form.password}
                required={!editingId}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Employee ID</label>
              <input
                type="text"
                placeholder="e.g. EMP-9982"
                className={inputCls}
                value={form.employeeId}
                required
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Joining Date</label>
              <input
                type="date"
                className={inputCls}
                value={form.joiningDate}
                required
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
              />
            </div>


            <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
              <label className={labelCls}>Monthly Salary (₹)</label>
              <input
                type="number"
                placeholder="e.g. 45000"
                className={inputCls}
                value={form.monthlySalary}
                required
                onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })}
              />
            </div>

          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    name: "",
                    email: "",
                    password: "",
                    employeeId: "",
                    joiningDate: "",
                    monthlySalary: "",
                  });
                }}
                className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #F4B400, #F59E0B)",
                color: "#0F172A",
                boxShadow: "0 8px 20px -6px rgba(244,180,0,0.4)",
              }}
            >
              {editingId ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </motion.form>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col">

          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>All Employees</h2>
              <p className="text-xs text-slate-400 mt-0.5">Employee details, salaries, and joining dates.</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4 text-center">Employee ID</th>
                  <th className="px-4 py-4">Joining Date</th>
                  <th className="px-4 py-4">Salary Date</th>
                  <th className="px-4 py-4 text-right">Hourly Rate</th>
                  <th className="px-4 py-4 text-right">Monthly Salary</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-16 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <FileText size={32} className="text-slate-300 stroke-[1.5]" />
                        <span>No employees found in the directory.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-[#F4B400]/[0.05] transition-all group">

                    {/* Name Block / Initial Avatar */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-sm"
                          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
                        >
                          {emp.name?.charAt(0).toUpperCase() || "E"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-[#B45F06] transition-colors">
                            {emp.name}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-bold tracking-wide uppercase flex items-center gap-1 mt-0.5">
                            <ShieldCheck size={11} className="stroke-[2.5]" /> verified
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span
                        className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md shadow-sm"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {emp.employeeId || "N/A"}
                      </span>
                    </td>

                    {/* Joining Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>
                          {emp.joiningDate
                            ? new Date(emp.joiningDate).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })
                            : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-emerald-600">
                      {emp.salaryDate
                        ? new Date(emp.salaryDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Hourly Rate */}
                    <td className="px-4 py-4 text-right whitespace-nowrap font-semibold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ₹{Number(emp.hourlyRate || 0).toFixed(2)}<span className="text-[10px] text-slate-400 font-bold">/hr</span>
                    </td>

                    {/* Monthly Salary */}
                    <td className="px-4 py-4 text-right whitespace-nowrap font-black text-slate-900 bg-slate-50/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ₹{Number(emp.monthlySalary || 0).toLocaleString("en-IN")}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(emp._id);
                            setForm({
                              name: emp.name || "",
                              email: emp.email || "",
                              password: "",
                              employeeId: emp.employeeId || "",
                              joiningDate: emp.joiningDate ? emp.joiningDate.split("T")[0] : "",
                              monthlySalary: emp.monthlySalary || "",
                            });
                          }}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all active:scale-95 shadow-sm"
                          title="Edit"
                        >
                          <Pencil size={14} className="stroke-[2.5]" />
                        </button>

                        <button
                          onClick={() => deleteEmployee(emp._id)}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={14} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
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
