import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Wallet,
  Clock3,
  IndianRupee,
  Pencil,
  Users,
} from "lucide-react";

export default function AdminSalary() {
  const [employees, setEmployees] = useState([]);
  const [monthlyHours, setMonthlyHours] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [basicSalary, setBasicSalary] = useState("");

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

  // Modern structured input element style
  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 ml-72 p-8 max-w-[1600px] mx-auto flex flex-col gap-6">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <Wallet size={320} />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight">
              Salary Management Center
            </h1>
            <p className="mt-1.5 text-violet-100/90 text-sm max-w-xl font-medium">
              Overhaul active operational worker ledgers, adjust structural baseline contracts, and verify execution metrics dynamically.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                Total Roster
              </p>
              <h2 className="text-3xl font-black mt-2 text-slate-900 tracking-tight">
                {totalEmployees} <span className="text-sm font-normal text-slate-400">operators</span>
              </h2>
            </div>
            <div className="bg-violet-50 border border-violet-100 p-3.5 rounded-xl text-violet-600 shadow-inner">
              <Users size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                Salary Core Configuration
              </p>
              <h2 className="text-2xl font-black mt-2 text-emerald-600 inline-flex items-center gap-2 tracking-tight">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live System
              </h2>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-600 shadow-inner">
              <Wallet size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                Financial Ledger Dispatch
              </p>
              <h2 className="text-2xl font-black mt-2 text-indigo-600 tracking-tight">
                Execution Ready
              </h2>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl text-indigo-600 shadow-inner">
              <IndianRupee size={22} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Edit Card Component - Preserved Flow Placement */}
        {editingId && (
          <div className="bg-white rounded-2xl border-2 border-violet-500/20 shadow-xl shadow-violet-600/5 p-6 transition-all animate-fadeIn">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                <Pencil size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Modify Compensation Scale
                </h2>
                <p className="text-xs text-slate-400">Update parameters for resource token reference node.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Base Salary (₹ / Month)</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged Monthly Working Hours</label>
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
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-violet-600/10"
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

        {/* Core Operational Table Frame */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col">
          
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Staff Payroll Registry
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Calculated dynamically relative to hours and base parameters.</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee Module</th>
                  <th className="px-4 py-4">System Contact</th>
                 <th className="px-4 py-4">Join Date</th>
<th className="px-4 py-4">Salary</th>
<th className="px-4 py-4">Hours</th>
<th className="px-4 py-4">Hourly Rate</th>
<th className="px-4 py-4">Payable</th>
<th className="px-4 py-4">Due Date</th>
<th className="px-4 py-4">Overdue</th>
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
                      className="hover:bg-slate-50/80 transition-all group"
                    >
                      {/* Avatar & Name Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm tracking-wide shadow-indigo-500/10">
                            {emp.name?.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
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

                      {/* Base Fixed Compensation */}
                     <td className="px-4 py-4">
{joining.toLocaleDateString()}
</td>

<td className="px-4 py-4 font-bold">
₹{Number(emp.monthlySalary).toLocaleString("en-IN")}
</td>

                      {/* Logged Quantified Time */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                          <Clock3 size={12} className="text-slate-400 stroke-[2.5]" />
                          <span>{hours.toFixed(2)} hrs</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">
  ₹{hourlyRate.toFixed(2)}/hr
</td>


{/* Total Aggregated Pay */}
<td className="px-4 py-4 bg-emerald-50/15 font-mono font-black text-emerald-600 text-base">
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
  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
    ✅ Paid
  </span>
) : status === "Overdue" ? (
  <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">
    🔴 {overdue}
  </span>
) : status === "Due Today" ? (
  <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
    🟡 Due Today
  </span>
) : (
  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
    🔵 Upcoming
  </span>
)}
</td>

                      {/* Operational Trigger */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
  <button
    onClick={() => {
      setEditingId(emp._id);
      setBasicSalary(emp.monthlySalary || 0);
      setMonthlyHours(emp.monthlyHours || 0);
    }}
    className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 active:scale-[0.97] transition-all shadow-sm"
  >
    <Pencil size={12} className="stroke-[2.5]" />
    <span>Edit</span>
  </button>

  <button
    onClick={() => markSalaryPaid(emp._id)}
    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
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
    </div>
  );
}