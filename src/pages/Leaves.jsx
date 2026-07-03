import { useEffect, useState } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { motion } from "framer-motion";
import {
  CalendarDays,
  FileText,
  Clock,
  SendHorizontal,
  CalendarRange,
  ShieldAlert,
  Info,
  Menu,
  X,
} from "lucide-react";

/* Design tokens - BuildMaster reference palette
   Gold: #F4B400  Blue: #2563EB  Emerald: #22C55E
   Dark navy: #0F172A
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

export default function Leaves() {
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
    leaveType: "Full Day",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state

  useEffect(() => {
    ensureFonts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/leaves/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeName: localStorage.getItem("employeeName"),
            employeeEmail: localStorage.getItem("employeeEmail"),
            fromDate: form.fromDate,
            toDate: form.toDate,
            reason: form.reason,
            leaveType: form.leaveType,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Leave Applied Successfully ✅");

        setForm({
          fromDate: "",
          toDate: "",
          reason: "",
          leaveType: "Full Day",
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed To Apply Leave");
    }
  };

  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-[#F4B400] focus:bg-white focus:ring-4 focus:ring-[#F4B400]/12 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5";

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

      <div className="p-4 lg:p-8 max-w-[1200px] mx-auto flex flex-col gap-6 w-full">

        {/* Top bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-500" style={{ fontFamily: "Sora, sans-serif" }}>
            Time Off
          </span>
        </div>

        {/* Module Header Banner */}
        <div
          className="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div className="absolute right-0 bottom-0 opacity-[0.06] translate-x-10 translate-y-10 pointer-events-none">
            <CalendarDays size={280} />
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
              <CalendarDays size={11} /> Time Off
            </span>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ fontFamily: "Sora, sans-serif" }}>
              Leave Management
            </h1>
            <p className="mt-1.5 text-slate-400 text-sm max-w-xl font-medium">
              Apply for leave and track your leave requests.
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Leave Application Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/80 p-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
              <div className="p-2 rounded-lg" style={{ background: "rgba(244,180,0,0.12)", color: "#B45F06" }}>
                <CalendarRange size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>Apply for Leave</h2>
                <p className="text-xs text-slate-400 mt-0.5">Fill in the details below to submit your leave request.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className={labelCls}>
                    <CalendarDays size={12} className="text-slate-400" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={form.fromDate}
                    onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className={labelCls}>
                    <CalendarDays size={12} className="text-slate-400" />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={form.toDate}
                    onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              {/* Leave Type */}
              <div>
                <label className={labelCls}>
                  <Clock size={12} className="text-slate-400" />
                  Leave Type
                </label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  className={inputCls}
                >
                  <option value="Full Day">Full Day</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className={labelCls}>
                  <FileText size={12} className="text-slate-400" />
                  Reason
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Enter the reason for your leave."
                  className={`${inputCls} resize-none leading-relaxed`}
                  rows="4"
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2 border-t border-slate-100 mt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-sm font-bold active:scale-[0.98] transition-all flex items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #F4B400, #F59E0B)",
                    color: "#0F172A",
                    boxShadow: "0 8px 20px -6px rgba(244,180,0,0.4)",
                  }}
                >
                  <SendHorizontal size={14} className="stroke-[2.5]" />
                  <span>Submit Leave Request</span>
                </button>
              </div>

            </form>
          </motion.div>

          {/* Leave Policy / Info */}
          <div className="flex flex-col gap-4">

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm shadow-slate-100/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Info size={14} className="stroke-[2.5]" style={{ color: "#B45F06" }} />
                Important Information
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your leave request will be sent to your manager for approval. Please make sure the dates are correct before submitting.
              </p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: "rgba(244,180,0,0.06)", border: "1px solid rgba(244,180,0,0.2)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2" style={{ color: "#7C4A05" }}>
                <ShieldAlert size={14} className="stroke-[2.5]" />
                Employee Information
              </h3>
              <p className="text-xs leading-relaxed font-medium" style={{ color: "#8A5A0A" }}>
                Your leave request will be submitted using your employee account.
              </p>
              <div className="mt-3 flex flex-col gap-1.5 text-[11px]" style={{ color: "#7C4A05", fontFamily: "'JetBrains Mono', monospace" }}>
                <div className="bg-white/80 border px-2 py-1 rounded-md truncate" style={{ borderColor: "rgba(244,180,0,0.25)" }}>
                  <span className="font-bold opacity-60">Employee Name:</span> {localStorage.getItem("employeeName") || "Undefined"}
                </div>
                <div className="bg-white/80 border px-2 py-1 rounded-md truncate" style={{ borderColor: "rgba(244,180,0,0.25)" }}>
                  <span className="font-bold opacity-60">Employee Email:</span> {localStorage.getItem("employeeEmail") || "Undefined"}
                </div>
              </div>
            </div>

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
