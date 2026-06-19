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
  ArrowRight
} from "lucide-react";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);

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

  // Structural Derivative Metric Matrix Calculations
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
    <div className="flex min-h-screen bg-[#f8fafc]">
      <EmployeeSidebar />

      <div className="flex-1 ml-72 p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full">
        
        {/* Core Hero Banner Component */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <CalendarCheck size={320} />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              My Attendance Ledger
            </h1>
            <p className="mt-1.5 text-violet-100/90 text-sm max-w-xl font-medium">
              Verified operational shift metrics and compliance tracking. Monitor standard punch-in timelines and aggregate runtime duration records.
            </p>
          </div>
        </div>

        {/* Dynamic Matrix Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Shift Records */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Shifts Logged</p>
              <h2 className="text-3xl font-black mt-2 text-slate-900 tracking-tight">{totalDaysLogged} Days</h2>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-600">
              <UserCheck size={22} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Card 2: Cumulative Duration */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Cumulative Productive Hours</p>
              <h2 className="text-3xl font-black mt-2 text-indigo-600 tracking-tight">{totalHoursLogged.toFixed(1)} Hrs</h2>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl text-indigo-600">
              <Clock size={22} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Card 3: Shift Mean Value */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Average Shift Interval</p>
              <h2 className="text-3xl font-black mt-2 text-violet-600 tracking-tight">{avgShiftDuration} Hrs/Day</h2>
            </div>
            <div className="bg-violet-50 border border-violet-100 p-3.5 rounded-xl text-violet-600">
              <TrendingUp size={22} className="stroke-[2.5]" />
            </div>
          </div>

        </div>

        {/* Shift Logging Detailed Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col"
        >
          
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Historical Timeline Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">Granular look at structural time checkpoints, checkout procedures, and calculated duration ratios.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold shadow-sm">
              <Activity size={13} className="text-emerald-500 animate-pulse" />
              <span className="text-slate-600">Live Datastream Sink</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Calendar Epoch Date</th>
                  <th className="px-4 py-4">Initialization Punch-In</th>
                  <th className="px-4 py-4">Termination Punch-Out</th>
                  <th className="px-6 py-4 text-center">Quantified Productive Block</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-16 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <FileSpreadsheet size={32} className="text-slate-300 stroke-[1.5]" />
                        <span>No unique operational attendance logs associated with this node instance.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {attendance.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-all group">
                    
                    {/* Timestamp Calendar Date */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-violet-500 transition-all" />
                        <span>{item.date}</span>
                      </div>
                    </td>

                    {/* Punch In Flag */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                        <LogIn size={12} className="text-emerald-500 stroke-[2.5]" />
                        <span>{item.punchIn || "—:—"}</span>
                      </div>
                    </td>

                    {/* Punch Out Flag */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                        item.punchOut 
                          ? "bg-rose-50/60 border-rose-100 text-rose-800" 
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}>
                        <LogOut size={12} className={item.punchOut ? "text-rose-500 stroke-[2.5]" : "text-slate-300"} />
                        <span>{item.punchOut || "Active Active"}</span>
                      </div>
                    </td>

                    {/* Calculated Time Block Duration */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-center">
                        <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md shadow-sm">
                          {item.totalHours || 0} Hours
                        </span>
                        
                        {/* Status visualization badge for shift minimum requirements */}
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          Number(item.totalHours || 0) >= 8 
                            ? "bg-emerald-500" 
                            : Number(item.totalHours || 0) >= 4 
                            ? "bg-amber-500" 
                            : "bg-rose-500"
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
    </div>
  );
}