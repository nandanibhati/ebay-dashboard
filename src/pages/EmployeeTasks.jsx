import { useEffect, useState } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ListTodo,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  BarChart3,
  FileText,
  Activity,
  UserCheck
} from "lucide-react";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    status: "Todo",
    startDate: "",
    dueDate: "",
    progress: 0,
  });

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      const employeeName = localStorage.getItem("employeeName");
      const res = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/tasks/my-tasks/${employeeName}`
      );
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/auth/employees"
      );
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  // Add / Update Task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `https://ebay-dashboard-z7h2.onrender.com/api/tasks/${editingId}`
        : "https://ebay-dashboard-z7h2.onrender.com/api/tasks/create";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          assignedBy: localStorage.getItem("employeeName") || "Employee",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          editingId ? "Task Updated Successfully" : "Task Created Successfully"
        );

        setForm({
          title: "",
          description: "",
          assignedTo: "",
          priority: "Medium",
          status: "Todo",
          startDate: "",
          dueDate: "",
          progress: 0,
        });

        setEditingId(null);
        fetchTasks();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    if (!window.confirm("Delete Task?")) return;

    try {
      const res = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/tasks/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Task Deleted");
        fetchTasks();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Micro-Derivative Analytical Matrix Computations
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === "Done" || t.status === "Closed").length;
  const pendingTasksCount = tasks.filter(t => t.status === "Todo" || t.status === "In Progress").length;
  
  const generalizedMeanProgress = totalTasksCount > 0
    ? (tasks.reduce((sum, t) => sum + Number(t.progress || 0), 0) / totalTasksCount).toFixed(0)
    : 0;

  // Reusable Styling Framework Constants
  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Toaster position="top-right" reverseOrder={false} />
      <EmployeeSidebar />

      <div className="flex-1 ml-72 p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full">
        
        {/* Module Hero Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <ListTodo size={320} />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Task Management Matrix
            </h1>
            <p className="mt-1.5 text-violet-100/90 text-sm max-w-xl font-medium">
              Organize core operations, provision sprint targets, assign tasks across system operators, and track completion progress loops in real-time.
            </p>
          </div>
        </div>

        {/* High-Density Statistical Metric Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Backlog</p>
              <h2 className="text-2xl font-black mt-1.5 text-slate-900 tracking-tight">{totalTasksCount} Allocations</h2>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-600">
              <ListTodo size={20} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Active Run-state</p>
              <h2 className="text-2xl font-black mt-1.5 text-amber-600 tracking-tight">{pendingTasksCount} Pending</h2>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-amber-600">
              <Clock size={20} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Closed Nodes</p>
              <h2 className="text-2xl font-black mt-1.5 text-emerald-600 tracking-tight">{completedTasksCount} Resolved</h2>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-600">
              <CheckCircle2 size={20} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Mean Process Ratio</p>
              <h2 className="text-2xl font-black mt-1.5 text-violet-600 tracking-tight">{generalizedMeanProgress}% Index</h2>
            </div>
            <div className="bg-violet-50 border border-violet-100 p-3 rounded-xl text-violet-600">
              <BarChart3 size={20} className="stroke-[2.5]" />
            </div>
          </div>

        </div>

        {/* Dynamic Interactive Allocation Form */}
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/80 p-6 flex flex-col gap-5"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
              <Plus size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "Modify Operational Task Parameters" : "Provision New Task Vector"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Define development sprints, map accountability scopes, and balance operational delivery priority.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
              <label className={labelCls}>Task Descriptive Heading</label>
              <input
                type="text"
                placeholder="e.g. Integrate Payment Webhooks"
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Accountable Operator Target</label>
              <select
                className={inputCls}
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                required
              >
                <option value="">Select Resource Node</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Impact Priority Ranking</label>
              <select
                className={inputCls}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
              <label className={labelCls}>Granular Functional Description</label>
              <textarea
                placeholder="Map comprehensive milestones, required environment variables, and programmatic conditions..."
                className={`${inputCls} resize-none`}
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Lifecycle State</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Todo">Todo (Staged)</option>
                <option value="In Progress">In Progress (Active)</option>
                <option value="Done">Done (Resolved)</option>
                <option value="Closed">Closed (Archived)</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Initialization Epoch (Start)</label>
              <input
                type="date"
                className={inputCls}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Termination Deadline (Due)</label>
              <input
                type="date"
                className={inputCls}
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            {/* Complete synchronization with form schema state variables */}
            <div>
              <label className={labelCls}>Quantified Progress Track ({form.progress}%)</label>
              <div className="flex items-center h-[46px] bg-slate-50/60 border border-slate-200 px-4 rounded-xl shadow-sm shadow-slate-100/50">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="w-full accent-violet-600 bg-slate-200 cursor-pointer rounded-lg h-1.5"
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                />
              </div>
            </div>

          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    title: "",
                    description: "",
                    assignedTo: "",
                    priority: "Medium",
                    status: "Todo",
                    startDate: "",
                    dueDate: "",
                    progress: 0,
                  });
                }}
                className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Abort Editing
              </button>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-violet-600/10"
            >
              {editingId ? "Commit Task Modifications" : "Deploy Task Vector"}
            </button>
          </div>
        </motion.form>

        {/* Task Ledger Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col">
          
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Operational Backlog Index</h2>
              <p className="text-xs text-slate-400 mt-0.5">Chronological index tracking priority bounds, current iteration cycles, and verification tasks.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold shadow-sm">
              <Activity size={13} className="text-emerald-500 animate-pulse" />
              <span className="text-slate-600">Active Buffer Synchronized</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 w-[40%]">Task Schema Parameters</th>
                  <th className="px-4 py-4">Resource Target</th>
                  <th className="px-4 py-4">Impact Priority</th>
                  <th className="px-4 py-4">State Module</th>
                  <th className="px-4 py-4">Due Epoch</th>
                  <th className="px-4 py-4">Completion Status</th>
                  <th className="px-6 py-4 text-center">Controls</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <FileText size={32} className="text-slate-300 stroke-[1.5]" />
                        <span>No unique functional tasks mapped to this workspace array.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/80 transition-all group">
                    
                    {/* Heading / Subtext parameters */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 max-w-md">
                        <span className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors block truncate">
                          {task.title}
                        </span>
                        <span className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {task.description || "No supplemental descriptor properties configured."}
                        </span>
                      </div>
                    </td>

                    {/* Assigned operator column */}
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                          <User size={12} className="stroke-[2.5]" />
                        </div>
                        <span className="text-xs font-semibold">{task.assignedTo || "Unassigned"}</span>
                      </div>
                    </td>

                    {/* High contrast priority flags */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${
                          task.priority === "High"
                            ? "bg-rose-50 border-rose-100 text-rose-700"
                            : task.priority === "Medium"
                            ? "bg-amber-50 border-amber-100 text-amber-700"
                            : "bg-emerald-50 border-emerald-100 text-emerald-700"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          task.priority === "High" ? "bg-rose-500" : task.priority === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        {task.priority}
                      </span>
                    </td>

                    {/* Execution status parameters */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${
                        task.status === "Done" || task.status === "Closed"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : task.status === "In Progress"
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}>
                        {task.status}
                      </span>
                    </td>

                    {/* Processed timeline deadlines */}
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })
                            : "No Bounds Set"}
                        </span>
                      </div>
                    </td>

                    {/* Micro horizontal workflow gauge components */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 w-28">
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                          <span>Progress</span>
                          <span>{task.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 border border-slate-200/60 rounded-full h-2 overflow-hidden shadow-inner">
                          <motion.div
                            className={`h-full rounded-full ${
                              Number(task.progress || 0) === 100
                                ? "bg-emerald-500"
                                : Number(task.progress || 0) >= 50
                                ? "bg-indigo-500"
                                : "bg-violet-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress || 0}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Command actions panel operations */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(task._id);
                            setForm({
                              title: task.title || "",
                              description: task.description || "",
                              assignedTo: task.assignedTo || "",
                              priority: task.priority || "Medium",
                              status: task.status || "Todo",
                              startDate: task.startDate ? task.startDate.split("T")[0] : "",
                              dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
                              progress: task.progress || 0,
                            });
                          }}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-all active:scale-95 shadow-sm"
                          title="Edit Task Parameter Matrix"
                        >
                          <Pencil size={14} className="stroke-[2.5]" />
                        </button>
                        
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
                          title="Purge Task Document Instance"
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