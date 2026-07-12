import { useEffect, useState } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { motion } from "framer-motion";
import {
  Wallet,
  User,
  Clock,
  CircleDollarSign,
  Receipt,
  FileCheck2,
  ShieldCheck,
  Building2,
  Info,
  Menu,
  X,
} from "lucide-react";
import { apiFetch } from "../api";

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

export default function Salary() {
  const [salaryData, setSalaryData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state

  useEffect(() => {
    ensureFonts();
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("employeeEmail");

    apiFetch(`/api/salary/${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSalaryData(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

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

      <div className="p-4 lg:p-8 max-w-[1400px] mx-auto flex flex-col gap-6 w-full">

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

        {/* Module Header Banner */}
        <div
          className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div className="absolute right-0 bottom-0 opacity-[0.06] translate-x-6 translate-y-6 pointer-events-none">
            <Wallet size={220} />
          </div>
          <div
            className="absolute -top-14 -left-14 w-56 h-56 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(244,180,0,0.18)" }}
          />
          <div className="relative z-10">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"
              style={{ background: "rgba(244,180,0,0.14)", border: "1px solid rgba(244,180,0,0.3)", color: "#F4B400" }}
            >
              <Wallet size={11} /> Payroll
            </span>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5" style={{ fontFamily: "Sora, sans-serif" }}>
              Salary Details
            </h1>
            <p className="mt-1 text-slate-400 text-xs max-w-xl font-medium">
              View your salary, working hours, and monthly payment details.
            </p>
          </div>
        </div>

        {/* Content */}
        {salaryData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Left/Center: Salary Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/80 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl border" style={{ background: "rgba(244,180,0,0.1)", borderColor: "rgba(244,180,0,0.28)", color: "#B45F06" }}>
                    <Receipt size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide" style={{ fontFamily: "Sora, sans-serif" }}>
                      Salary Summary
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      Salary Record
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-center px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-md text-emerald-700 text-[10px] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <ShieldCheck size={12} className="stroke-[2.5]" />
                  <span>VERIFIED PAYROLL</span>
                </div>
              </div>

              {/* Employee Details */}
              <div className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="p-4 bg-slate-50/60 border border-slate-100 rounded-xl flex items-center gap-3.5">
                    <div className="p-2 bg-white rounded-lg border text-slate-400 shadow-sm">
                      <User size={14} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Employee
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {salaryData.employee}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/60 border border-slate-100 rounded-xl flex items-center gap-3.5">
                    <div className="p-2 bg-white rounded-lg border text-slate-400 shadow-sm">
                      <Clock size={14} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Working Hours
                      </span>
                      <span className="text-sm font-bold text-slate-800 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {salaryData.totalHours} Hours Worked
                      </span>
                    </div>
                  </div>

                </div>

                {/* Salary Breakdown */}
                <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Salary Breakdown
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-all">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign size={14} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-600">Basic Salary</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ₹{Number(salaryData.basicSalary || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total Salary */}
                <div
                  className="mt-4 p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
                  style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", borderColor: "#0B1220", boxShadow: "0 20px 40px -12px rgba(15,23,42,0.3)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 text-emerald-400 rounded-lg backdrop-blur-md">
                      <FileCheck2 size={20} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-bold tracking-tight">Total Salary</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Calculated based on your working hours and salary details.</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right self-stretch sm:self-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <span className="text-3xl font-bold text-emerald-400 tracking-tight block tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ₹{Number(salaryData.salary || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      Final Salary
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Right Side: Payment Information */}
            <div className="flex flex-col gap-4">

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm shadow-slate-100/50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                  <Building2 size={13} className="stroke-[2.5]" style={{ color: "#B45F06" }} />
                  Payment Method
                </h3>
              </div>

              <div className="rounded-2xl p-5 flex gap-3.5" style={{ background: "rgba(244,180,0,0.06)", border: "1px solid rgba(244,180,0,0.2)" }}>
                <div className="mt-0.5 shrink-0" style={{ color: "#B45F06" }}>
                  <Info size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#7C4A05" }}>
                    Salary Payment
                  </h4>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Loading state */
          <div className="bg-white border rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 max-w-xl mx-auto border-slate-200/60 shadow-sm mt-8">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center animate-pulse">
              <CircleDollarSign size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700">Loading Salary Details</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                Please wait while we fetch your salary details.
              </p>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) { .anim-slide-in { animation: none !important; } }
      `}</style>
    </div>
  );
}
