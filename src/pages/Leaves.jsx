import { useState } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { motion } from "framer-motion";
import {
  CalendarDays,
  FileText,
  Clock,
  SendHorizontal,
  CalendarRange,
  ShieldAlert,
  Info
} from "lucide-react";

export default function Leaves() {
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
    leaveType: "Full Day",
  });

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

  // Shared Design Parameter Tokens
  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <EmployeeSidebar />

      <div className="flex-1 ml-72 p-8 max-w-[1200px] mx-auto flex flex-col gap-6 w-full">
        
        {/* Module Header Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <CalendarDays size={280} />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Time-Off & Leave Provisioning
            </h1>
            <p className="mt-1.5 text-violet-100/90 text-sm max-w-xl font-medium">
              File absence requests, declare operational lifecycle configurations, and log programmatic justifications directly into the compliance system database.
            </p>
          </div>
        </div>

        {/* Content Matrix Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Application Interface Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/80 p-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
              <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                <CalendarRange size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Time-Off Allocation Request</h2>
                <p className="text-xs text-slate-400 mt-0.5">Specify standard calendar spans and documentation details below.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date Element */}
                <div>
                  <label className={labelCls}>
                    <CalendarDays size={12} className="text-slate-400" />
                    From Date Span
                  </label>
                  <input
                    type="date"
                    value={form.fromDate}
                    onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>

                {/* End Date Element */}
                <div>
                  <label className={labelCls}>
                    <CalendarDays size={12} className="text-slate-400" />
                    To Date Span
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

              {/* Leave Classification Category Selector */}
              <div>
                <label className={labelCls}>
                  <Clock size={12} className="text-slate-400" />
                  Leave Configuration Target
                </label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  className={inputCls}
                >
                  <option value="Full Day">Full Day (Standard Shift Block)</option>
                  <option value="Half Day">Half Day (Partial Allocation Block)</option>
                </select>
              </div>

              {/* Text Area Description Statement */}
              <div>
                <label className={labelCls}>
                  <FileText size={12} className="text-slate-400" />
                  Programmatic Justification / Reason
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Provide deep structural context regarding structural adjustments, alternate scheduling configurations, or diagnostic parameters..."
                  className={`${inputCls} resize-none leading-relaxed`}
                  rows="4"
                  required
                />
              </div>

              {/* Submission Command Button */}
              <div className="flex justify-end pt-2 border-t border-slate-100 mt-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-violet-600/10 flex items-center gap-2"
                >
                  <SendHorizontal size={14} className="stroke-[2.5]" />
                  <span>Transmit Application to Node</span>
                </button>
              </div>

            </form>
          </motion.div>

          {/* Contextual Policy Information Box */}
          <div className="flex flex-col gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm shadow-slate-100/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Info size={14} className="text-violet-500 stroke-[2.5]" />
                Compliance Metadata
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                By submitting this document, execution strings parse directly to operations leadership buffers. Ensure all dates coordinate precisely with active project backlogs to minimize workspace deadlocks.
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2 mb-2">
                <ShieldAlert size={14} className="stroke-[2.5]" />
                Identity Validation
              </h3>
              <p className="text-xs text-amber-700/90 leading-relaxed font-medium">
                This transaction will be cryptographically bound to token elements found inside the local storage keys:
              </p>
              <div className="mt-3 flex flex-col gap-1.5 font-mono text-[11px] text-amber-800">
                <div className="bg-white/80 border border-amber-200/40 px-2 py-1 rounded-md truncate">
                  <span className="font-bold opacity-60">NAME:</span> {localStorage.getItem("employeeName") || "Undefined"}
                </div>
                <div className="bg-white/80 border border-amber-200/40 px-2 py-1 rounded-md truncate">
                  <span className="font-bold opacity-60">EMAIL:</span> {localStorage.getItem("employeeEmail") || "Undefined"}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}