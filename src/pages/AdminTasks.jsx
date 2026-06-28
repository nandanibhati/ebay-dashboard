import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
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
  UserCheck,
  X,
} from "lucide-react";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] =
  useState("All");

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    status: "Todo",
    startDate: "",
    dueDate: "",
    progress: 0,
     screenshot: null,
  });

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
       const res = await fetch(
  "https://ebay-dashboard-z7h2.onrender.com/api/tasks"
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

      const formData = new FormData();

formData.append("title", form.title);
formData.append("description", form.description);
formData.append("assignedTo", form.assignedTo);
formData.append("priority", form.priority);
formData.append("status", form.status);
formData.append("startDate", form.startDate);
formData.append("dueDate", form.dueDate);
formData.append("progress", form.progress);
formData.append(
  "assignedBy",
  localStorage.getItem("employeeName") || "Employee"
);

if (form.screenshot) {
  formData.append("screenshot", form.screenshot);
}

const res = await fetch(url, {
  method,
  body: formData,
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
          screenshot: null,
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
const employeeStats = {};

tasks.forEach((task) => {
  const employee =
    task.assignedTo || "Unassigned";

  if (!employeeStats[employee]) {
    employeeStats[employee] = {
      total: 0,
      pending: 0,
      completed: 0,
    };
  }

  employeeStats[employee].total++;

  if (
    task.status === "Done" ||
    task.status === "Closed"
  ) {
    employeeStats[employee].completed++;
  } else {
    employeeStats[employee].pending++;
  }
});

const filteredTasks =
  selectedEmployee === "All"
    ? tasks
    : tasks.filter(
        (task) =>
          task.assignedTo === selectedEmployee
      );
  // Reusable Styling Framework Constants
  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all duration-200 text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50 hover:border-slate-300";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5";

  const priorityBadge = (priority) =>
    priority === "High"
      ? "bg-rose-50 border-rose-100 text-rose-700"
      : priority === "Medium"
      ? "bg-amber-50 border-amber-100 text-amber-700"
      : "bg-emerald-50 border-emerald-100 text-emerald-700";

  const priorityDot = (priority) =>
    priority === "High" ? "bg-rose-500" : priority === "Medium" ? "bg-amber-500" : "bg-emerald-500";

  const statusBadge = (status) =>
    status === "Done" || status === "Closed"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : status === "In Progress"
      ? "bg-blue-50 border-blue-200 text-blue-700"
      : "bg-slate-100 border-slate-200 text-slate-500";

  const progressBar = (progress) =>
    Number(progress || 0) === 100
      ? "bg-emerald-500"
      : Number(progress || 0) >= 50
      ? "bg-indigo-500"
      : "bg-violet-500";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Toaster position="top-right" reverseOrder={false} />
      <Sidebar/>

      <div className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full">

        {/* Module Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden"
        >
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none rotate-12">
            <ListTodo size={260} className="sm:w-[320px] sm:h-[320px]" />
          </div>
          <div className="absolute top-0 left-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full mb-3">
              <Activity size={12} className="animate-pulse" />
              Live Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              Task Management Matrix
            </h1>
            <p className="mt-1.5 text-violet-100/90 text-sm max-w-xl font-medium">
              Organize core operations, provision sprint targets, assign tasks across system operators, and track completion progress loops in real-time.
            </p>
          </div>
        </motion.div>

        {/* High-Density Statistical Metric Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

          {[
            {
              label: "Total Backlog",
              value: `${totalTasksCount} Allocations`,
              icon: ListTodo,
              text: "text-slate-900",
              iconBg: "bg-slate-50 border-slate-100 text-slate-600",
            },
            {
              label: "Active Run-state",
              value: `${pendingTasksCount} Pending`,
              icon: Clock,
              text: "text-amber-600",
              iconBg: "bg-amber-50 border-amber-100 text-amber-600",
            },
            {
              label: "Closed Nodes",
              value: `${completedTasksCount} Resolved`,
              icon: CheckCircle2,
              text: "text-emerald-600",
              iconBg: "bg-emerald-50 border-emerald-100 text-emerald-600",
            },
            {
              label: "Mean Process Ratio",
              value: `${generalizedMeanProgress}% Index`,
              icon: BarChart3,
              text: "text-violet-600",
              iconBg: "bg-violet-50 border-violet-100 text-violet-600",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
            >
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">{stat.label}</p>
                <h2 className={`text-xl sm:text-2xl font-black mt-1.5 tracking-tight ${stat.text}`}>{stat.value}</h2>
              </div>
              <div className={`border p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon size={20} className="stroke-[2.5]" />
              </div>
            </motion.div>
          ))}

        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

  <div
    onClick={() => setSelectedEmployee("All")}
    className={`cursor-pointer p-4 rounded-2xl border shadow-sm ${
      selectedEmployee === "All"
        ? "bg-violet-600 text-white"
        : "bg-white"
    }`}
  >
    <h3 className="font-bold">
      All Employees
    </h3>

    <p className="text-sm">
      {tasks.length} Tasks
    </p>
  </div>

  {Object.entries(employeeStats).map(
    ([name, stats]) => (
      <div
        key={name}
        onClick={() =>
          setSelectedEmployee(name)
        }
        className={`cursor-pointer p-4 rounded-2xl border shadow-sm transition-all ${
          selectedEmployee === name
            ? "bg-violet-600 text-white"
            : "bg-white hover:shadow-md"
        }`}
      >
        <h3 className="font-bold text-lg">
          {name}
        </h3>

        <p>Total: {stats.total}</p>

        <p>
          Pending: {stats.pending}
        </p>

        <p>
          Completed:
          {stats.completed}
        </p>
      </div>
    )
  )}
</div>

        {/* Dynamic Interactive Allocation Form */}
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/80 p-5 sm:p-6 flex flex-col gap-5"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 bg-violet-50 rounded-lg text-violet-600 shrink-0">
              {editingId ? <Pencil size={18} className="stroke-[2.5]" /> : <Plus size={18} className="stroke-[2.5]" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
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
  <label className={labelCls}>
    Upload Screenshot
  </label>

  <input
    type="file"
    accept="image/*"
    className={inputCls}
    onChange={(e) =>
      setForm({
        ...form,
        screenshot: e.target.files[0],
      })
    }
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

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2 border-t border-slate-100">
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
                    screenshot: null,
                  });
                }}
                className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <X size={14} className="stroke-[2.5]" />
                Abort Editing
              </button>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-600/30 flex items-center justify-center gap-1.5"
            >
              {editingId ? <CheckCircle2 size={15} className="stroke-[2.5]" /> : <Plus size={15} className="stroke-[2.5]" />}
              {editingId ? "Commit Task Modifications" : "Deploy Task Vector"}
            </button>
          </div>
        </motion.form>

        {/* Task Ledger Container */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col"
        >

          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Operational Backlog Index</h2>
              <p className="text-xs text-slate-400 mt-0.5">Chronological index tracking priority bounds, current iteration cycles, and verification tasks.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold shadow-sm self-start sm:self-auto">
              <Activity size={13} className="text-emerald-500 animate-pulse" />
              <span className="text-slate-600">Active Buffer Synchronized</span>
            </div>
          </div>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center gap-2 justify-center py-16 px-6 text-slate-400 font-medium">
              <FileText size={32} className="text-slate-300 stroke-[1.5]" />
              <span className="text-center">No unique functional tasks mapped to this workspace array.</span>
            </div>
          )}

          {/* Desktop / large screen table */}
          {tasks.length > 0 && (
            <div className="hidden lg:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4 w-[40%]">Task Schema Parameters</th>
                    <th className="px-4 py-4">Resource Target</th>
                    <th className="px-4 py-4">Assigned By</th>
                    <th className="px-4 py-4">Impact Priority</th>
                    <th className="px-4 py-4">State Module</th>
                    <th className="px-4 py-4">Due Epoch</th>
                    <th className="px-4 py-4">Completion Status</th>
                    <th className="px-4 py-4">Screenshot</th>
                    <th className="px-6 py-4 text-center">Controls</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  <AnimatePresence>
                    {filteredTasks.map((task, idx) => (
                      <motion.tr
                        key={task._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.02 }}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >

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
                  {/* Assigned To */}
<td className="px-4 py-4 whitespace-nowrap font-medium text-slate-700">
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
      <User size={12} />
    </div>

    <span className="text-xs font-semibold">
      {task.assignedTo || "Unassigned"}
    </span>
  </div>
</td>

{/* Assigned By */}
<td className="px-4 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 rounded-md bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-600">
      <UserCheck size={12} />
    </div>

    <span className="text-xs font-semibold">
      {task.assignedBy || "Admin"}
    </span>
  </div>
</td>
                 
                        {/* High contrast priority flags */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${priorityBadge(task.priority)}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(task.priority)}`} />
                            {task.priority}
                          </span>
                        </td>

                        {/* Execution status parameters */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${statusBadge(task.status)}`}>
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
                                className={`h-full rounded-full ${progressBar(task.progress)}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${task.progress || 0}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
  {task.screenshot ? (
    <a
      href={task.screenshot}
      target="_blank"
      rel="noreferrer"
      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold"
    >
      View
    </a>
  ) : (
    "-"
  )}
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
                                  screenshot: null,
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

                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile / tablet card list (same data, same handlers) */}
          {tasks.length > 0 && (
            <div className="lg:hidden flex flex-col divide-y divide-slate-100">
              <AnimatePresence>
                {tasks.map((task, idx) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className="p-4 sm:p-5 flex flex-col gap-3 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-bold text-slate-900 truncate">{task.title}</span>
                        <span className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {task.description || "No supplemental descriptor properties configured."}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
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
                              screenshot: null,
                            });
                          }}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg active:scale-95 transition-all"
                          title="Edit Task Parameter Matrix"
                        >
                          <Pencil size={14} className="stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg active:scale-95 transition-all"
                          title="Purge Task Document Instance"
                        >
                          <Trash2 size={14} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm ${priorityBadge(task.priority)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(task.priority)}`} />
                        {task.priority}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${statusBadge(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <User size={11} />
                        {task.assignedTo || "Unassigned"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600">
  <UserCheck size={11} />
  Assigned By: {task.assignedBy || "Admin"}
</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Calendar size={11} />
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })
                          : "No Bounds Set"}
                      </span>
                      {task.screenshot && (
  <a
    href={task.screenshot}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600"
  >
    📷 View Screenshot
  </a>
)}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                        <span>Progress</span>
                        <span>{task.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 border border-slate-200/60 rounded-full h-2 overflow-hidden shadow-inner">
                        <motion.div
                          className={`h-full rounded-full ${progressBar(task.progress)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress || 0}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </motion.div>

      </div>
    </div>
  );
}
