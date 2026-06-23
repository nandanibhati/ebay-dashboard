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
  Percent
} from "lucide-react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    joiningDate: "",
    
    basicSalary: "",
  });

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

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `https://ebay-dashboard-z7h2.onrender.com/api/auth/employee/${editingId}`
        : "https://ebay-dashboard-z7h2.onrender.com/api/auth/signup";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
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
          
          basicSalary: "",
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
      const res = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/auth/employee/${id}`,
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

  // Derivative Dashboard Matrix Metrics
  const totalStaff = employees.length;
  const totalBasePayroll = employees.reduce((s, e) => s + Number(e.basicSalary || 0), 0);
  const averageHourlyRate = totalStaff > 0 
    ? (employees.reduce((s, e) => s + Number(e.hourlyRate || 0), 0) / totalStaff).toFixed(2)
    : "0.00";
const today = new Date();

const salaryDueToday = employees.filter((emp) => {
  if (!emp.salaryDate) return false;

  return (
    new Date(emp.salaryDate).toDateString() ===
    today.toDateString()
  );
});


const upcomingSalary = employees.filter((emp) => {
  if (!emp.salaryDate) return false;

  const diffDays = Math.ceil(
    (new Date(emp.salaryDate) - today) /
      (1000 * 60 * 60 * 24)
  );

  return diffDays > 0 && diffDays <= 7;
});
  // Reusable Tailwind Utility Framework Styles
  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 ml-72 p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full">
        
        {/* Module Hero Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <Users size={320} />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Workforce Node Directory
            </h1>
            <p className="mt-1.5 text-violet-100/90 text-sm max-w-xl font-medium">
              Provision internal user permissions, manage global compensation models, adjust hourly overhead variables, and audit live registry keys.
            </p>
          </div>
        </div>
{salaryDueToday.length > 0 && (
  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
    <p className="font-bold">
      🚨 Salary Due Today
    </p>

    <ul className="mt-2 text-sm">
      {salaryDueToday.map((emp) => (
        <li key={emp._id}>
          • {emp.name}
        </li>
      ))}
    </ul>
  </div>
)}

{upcomingSalary.length > 0 && (
  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl">
    <p className="font-bold">
      ⏰ Salary Due Within 7 Days
    </p>

    <ul className="mt-2 text-sm">
      {upcomingSalary.map((emp) => (
        <li key={emp._id}>
          • {emp.name}
        </li>
      ))}
    </ul>
  </div>
)}
        {/* Aggregate Financial Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> 
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Active Directory Nodes</p>
              <h2 className="text-3xl font-black mt-2 text-slate-900 tracking-tight">{totalStaff} Operators</h2>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-600">
              <Users size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Mean Resource Rate</p>
              <h2 className="text-3xl font-black mt-2 text-indigo-600 tracking-tight">₹{averageHourlyRate}/hr</h2>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl text-indigo-600">
              <Briefcase size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Base Payroll Committed</p>
              <h2 className="text-3xl font-black mt-2 text-emerald-600 tracking-tight">₹{totalBasePayroll.toLocaleString("en-IN")}</h2>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-600">
              <IndianRupee size={22} className="stroke-[2.5]" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
  <div>
    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
      Salary Due Today
    </p>

    <h2 className="text-3xl font-black mt-2 text-red-600">
      {salaryDueToday.length}
    </h2>
  </div>

  <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl text-red-600">
    💰
  </div>
</div>
          
</div>
          
        {/* Identity Provisioning & Enrollment Form Container */}
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddEmployee}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/80 p-6 flex flex-col gap-5"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
              <UserPlus size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "Modify Operator Cryptographic Parameters" : "Provision New Operator Identity"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure access parameters, unique hardware identifiers, and foundational compensation matrix bounds.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            <div>
              <label className={labelCls}>Legal Identity Name</label>
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
              <label className={labelCls}>Secure Routing Email</label>
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
              <label className={labelCls}>System Access Password</label>
              <input
                type="password"
                placeholder={editingId ? "Leave blank to preserve integrity" : "••••••••••••"}
                className={inputCls}
                value={form.password}
                required={!editingId}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Unique Corporate Token ID</label>
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
              <label className={labelCls}>Initialization / Joining Date</label>
              <input
                type="date"
                className={inputCls}
                value={form.joiningDate}
                required
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
              />
            </div>


            <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
              <label className={labelCls}>Basic Monthly Operational Salary (₹)</label>
              <input
                type="number"
                placeholder="e.g. 45000"
                className={inputCls}
                value={form.basicSalary}
                required
                onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
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
                    
                    basicSalary: "",
                  });
                }}
                className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Abort Changes
              </button>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-violet-600/10 flex items-center gap-2"
            >
              {editingId ? "Commit Changes to Cluster" : "Deploy Operator Asset"}
            </button>
          </div>
        </motion.form>

        {/* Master Registry Table Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col">
          
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Master Workforce Core Log</h2>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive structural registry tracking active keys, compensation baselines, and timestamp variables.</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Operator Profile Nodes</th>
                  <th className="px-4 py-4">Secure Identifier Link</th>
                  <th className="px-4 py-4 text-center">Corporate ID</th>
                  <th className="px-4 py-4">Initialization Epoch</th>
                  <th className="px-4 py-4">Salary Date</th>
                  <th className="px-4 py-4 text-center">
  Status
</th>
                  <th className="px-4 py-4 text-right">Variable Rate</th>
                  <th className="px-4 py-4 text-right">Fixed Monthly Matrix</th>
                  <th className="px-6 py-4 text-center">Control Panel Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <FileText size={32} className="text-slate-300 stroke-[1.5]" />
                        <span>No core personnel nodes verified within directory clusters.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/80 transition-all group">
                    
                    {/* Name Block / Initial Avatar Bubble */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-500/10">
                          {emp.name?.charAt(0).toUpperCase() || "E"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                            {emp.name}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-bold tracking-wide uppercase flex items-center gap-1 mt-0.5">
                            <ShieldCheck size={11} className="stroke-[2.5]" /> verified operator
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email Verification Element */}
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                    </td>

                    {/* Employee Unique Corporate Tag */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span className="font-mono bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md shadow-sm">
                        {emp.employeeId || "N/A"}
                      </span>
                    </td>

                    {/* Processed Localization Joining Date */}
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
<td className="px-4 py-4 text-center">
  {emp.salaryDate ? (() => {
    const salaryDate = new Date(emp.salaryDate);
    const today = new Date();

    salaryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (salaryDate.getTime() === today.getTime()) {
      return (
        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
          Due Today
        </span>
      );
    }

    if (salaryDate < today) {
      return (
        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
          Overdue
        </span>
      );
    }

    return (
      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
        Upcoming
      </span>
    );
  })() : (
    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">
      N/A
    </span>
  )}
</td>

                    {/* Hourly Allocation Matrix Cell */}
                    <td className="px-4 py-4 text-right whitespace-nowrap font-semibold text-slate-700">
                      ₹{Number(emp.hourlyRate || 0).toFixed(2)}<span className="text-[10px] text-slate-400 font-bold">/hr</span>
                    </td>

                    {/* Fixed Monthly Salary Matrix Cell */}
                    <td className="px-4 py-4 text-right whitespace-nowrap font-black text-slate-900 bg-slate-50/40">
                      ₹{Number(emp.basicSalary || 0).toLocaleString("en-IN")}
                    </td>

                    {/* Interface Logic Action Controls */}
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
                              
                              basicSalary: emp.basicSalary || "",
                            });
                          }}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-all active:scale-95 shadow-sm"
                          title="Modify Record Configurations"
                        >
                          <Pencil size={14} className="stroke-[2.5]" />
                        </button>
                        
                        <button
                          onClick={() => deleteEmployee(emp._id)}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
                          title="Purge Operator Record"
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
    </div>
  );
}