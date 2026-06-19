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
  Info
} from "lucide-react";

export default function Salary() {
  const [salaryData, setSalaryData] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("employeeEmail");

    fetch(`https://ebay-dashboard-z7h2.onrender.com/api/salary/${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSalaryData(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <EmployeeSidebar />

      <div className="flex-1 ml-64 p-8 max-w-[1400px] mx-auto flex flex-col gap-6 w-full">
        
        {/* Module Header Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6 pointer-events-none">
            <Wallet size={220} />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              Compensation Ledger
            </h1>
            <p className="mt-1 text-violet-100/90 text-xs max-w-xl font-medium">
              Review personal base pay distributions, calculate monthly workspace hourly aggregates, and track processed operational payroll cycles.
            </p>
          </div>
        </div>

        {/* Content Matrix Layout Split */}
        {salaryData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left/Center: Master Pay Statement Document Container */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/80 overflow-hidden"
            >
              {/* Document Header Metadata Accent */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
                    <Receipt size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Earnings Statement Profile
                    </h2>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      System Reference Hash: Active Log Vector
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-center px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-md text-emerald-700 font-mono text-[10px] font-bold">
                  <ShieldCheck size={12} className="stroke-[2.5]" />
                  <span>PAYROLL AUDITED & SECURE</span>
                </div>
              </div>

              {/* Core Ledger Parameter Rows */}
              <div className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Employee Identity Target Parameter */}
                  <div className="p-4 bg-slate-50/60 border border-slate-100 rounded-xl flex items-center gap-3.5">
                    <div className="p-2 bg-white rounded-lg border text-slate-400 shadow-sm">
                      <User size={14} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Accountable Professional
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {salaryData.employee}
                      </span>
                    </div>
                  </div>

                  {/* Hourly Allocation Parameter */}
                  <div className="p-4 bg-slate-50/60 border border-slate-100 rounded-xl flex items-center gap-3.5">
                    <div className="p-2 bg-white rounded-lg border text-slate-400 shadow-sm">
                      <Clock size={14} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Logistical Cycle Metric
                      </span>
                      <span className="text-sm font-mono font-black text-slate-800">
                        {salaryData.totalHours} Hours Logged
                      </span>
                    </div>
                  </div>

                </div>

                {/* Micro Breakdowns Breakdown Board */}
                <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Base Matrix Distributions
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-all">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign size={14} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-600">Standard Shift Rate Scale (Base Monthly)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      ₹{Number(salaryData.basicSalary || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Summary Gross Payout Block Element */}
                <div className="mt-4 p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-slate-900/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 text-emerald-400 rounded-lg backdrop-blur-md">
                      <FileCheck2 size={20} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-bold tracking-tight">Total Retained Compensation</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Aggregated metrics parsed for standard active accounting node block.</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right self-stretch sm:self-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <span className="text-3xl font-black text-emerald-400 tracking-tight block">
                      ₹{Number(salaryData.salary || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                      Net Liquid Disbursements
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Right Side: Banking Compliance Information Box Contexts */}
            <div className="flex flex-col gap-4">
              
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm shadow-slate-100/50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                  <Building2 size={13} className="text-violet-500 stroke-[2.5]" />
                  Disbursement Pipeline
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Financial calculations parse system-wide logic configurations matching checked production output metrics directly to active registry IDs.
                </p>
              </div>

              <div className="bg-violet-50/60 border border-violet-100 rounded-2xl p-5 flex gap-3.5">
                <div className="text-violet-600 mt-0.5 shrink-0">
                  <Info size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-violet-900 uppercase tracking-wider">
                    Regulatory Compliance Framework
                  </h4>
                  <p className="text-xs text-violet-800/80 mt-1.5 leading-relaxed font-medium">
                    This document serves as an official cryptographically logged account balance projection metric statement. Direct inquiries relative to total hours tracked must be filed using the standard application ticket channel within the framework interface matrix.
                  </p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Sleek Informational Skeleton / Waiting Frame Entry State */
          <div className="bg-white border rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 max-w-xl mx-auto border-slate-200/60 shadow-sm mt-8">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center animate-pulse">
              <CircleDollarSign size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700">Awaiting Node Ledger Stream</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                Parsing active database variables for current session context matching stored access token schemas...
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}