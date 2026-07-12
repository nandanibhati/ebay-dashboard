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
  Menu,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "../api";
import socket from "../socket";

/* Design tokens - matched to BuildMaster reference palette
   Display face: Sora (headings)
   Body face: Inter
   Numeral face: JetBrains Mono (stat digits)
   Base: #F8FAFC
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

function GlassPanel({ children, className = "", hover = true, style = {} }) {
  return (
    <div
      className={`relative rounded-[22px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_20px_45px_-12px_rgba(30,41,59,0.14)] ${
        hover
          ? "transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_28px_60px_-14px_rgba(30,41,59,0.20)] hover:border-white/90"
          : ""
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: "#F8FAFC" }} />
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
        }}
      />
      <div
        className="absolute -top-40 -left-32 w-[36rem] h-[36rem] rounded-full blur-3xl anim-drift-a"
        style={{ background: "radial-gradient(circle, rgba(244,180,0,0.10), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 right-0 w-[30rem] h-[30rem] rounded-full blur-3xl anim-drift-b"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[26rem] h-[26rem] rounded-full blur-3xl anim-drift-c"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.07), transparent 70%)" }}
      />
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state

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

  useEffect(() => {
    ensureFonts();
  }, []);

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      const res = await apiFetch(
        "/api/tasks"
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
      const res = await apiFetch(
        "/api/auth/employees"
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
        ? `/api/tasks/${editingId}`
        : "/api/tasks/create";

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

      const res = await apiFetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          editingId ? "Task Updated Successfully" : "Task Created Successfully"
        );

        if (!editingId) {
          socket.emit("taskAssigned", {
            assignedToName: form.assignedTo,
            assignedByName: localStorage.getItem("employeeName") || "Employee",
            title: form.title,
          });
        }

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
      const res = await apiFetch(
        `/api/tasks/${id}`,
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

  // Task stats
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === "Done" || t.status === "Closed").length;
  const pendingTasksCount = tasks.filter(t => t.status === "Todo" || t.status === "In Progress").length;

  const generalizedMeanProgress = totalTasksCount > 0
    ? (tasks.reduce((sum, t) => sum + Number(t.progress || 0), 0) / totalTasksCount).toFixed(0)
    : 0;

  const employeeStats = {};

  tasks.forEach((task) => {
    const employee = task.assignedTo || "Unassigned";

    if (!employeeStats[employee]) {
      employeeStats[employee] = {
        total: 0,
        pending: 0,
        completed: 0,
      };
    }

    employeeStats[employee].total++;

    if (task.status === "Done" || task.status === "Closed") {
      employeeStats[employee].completed++;
    } else {
      employeeStats[employee].pending++;
    }
  });

  const filteredTasks =
    selectedEmployee === "All"
      ? tasks
      : tasks.filter((task) => task.assignedTo === selectedEmployee);

  // Reusable styling constants
  const inputCls = "w-full px-4 py-3 text-sm bg-white/70 border border-slate-900/[0.08] rounded-xl outline-none focus:border-[#F4B400]/60 focus:bg-white focus:ring-4 focus:ring-[#F4B400]/10 transition-all duration-200 text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50 hover:border-slate-900/[0.14]";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5";

  const priorityBadge = (priority) =>
    priority === "High"
      ? "bg-red-50 border-red-100 text-red-700"
      : priority === "Medium"
      ? "bg-amber-50 border-amber-100 text-amber-700"
      : "bg-emerald-50 border-emerald-100 text-emerald-700";

  const priorityDot = (priority) =>
    priority === "High" ? "bg-red-500" : priority === "Medium" ? "bg-amber-500" : "bg-emerald-500";

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
      ? "bg-[#2563EB]"
      : "bg-[#F4B400]";

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui", color: "#0F172A" }}
    >
      <PremiumBackground />
      <Toaster position="top-right" reverseOrder={false} />

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

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-[72px] flex items-center gap-3 px-5 lg:px-10 border-b border-slate-900/[0.06] bg-white/70 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.06]"
          >
            <Menu size={18} />
          </button>
          <h1
            className="text-sm font-semibold text-slate-700 tracking-tight"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            Task Management
          </h1>
        </header>

        <div className="flex-1 px-5 lg:px-10 py-8 max-w-[1600px] mx-auto w-full flex flex-col gap-6">

          {/* Module Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassPanel hover={false} className="p-6 sm:p-8 overflow-hidden relative">
              <div
                className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-60 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(244,180,0,0.18), transparent 70%)" }}
              />
              <div className="relative z-10">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
                  style={{ background: "rgba(244,180,0,0.12)", border: "1px solid rgba(244,180,0,0.28)", color: "#B45F06" }}
                >
                  <Activity size={12} className="animate-pulse" />
                  Live Workspace
                </span>
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  Task Management Matrix
                </h1>
                <p className="mt-1.5 text-slate-500 text-sm max-w-xl font-medium">
                  Organize core operations, provision sprint targets, assign tasks across system operators, and track completion progress loops in real-time.
                </p>
              </div>
            </GlassPanel>
          </motion.div>

          {/* Stat panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                label: "Total Backlog",
                value: `${totalTasksCount} Allocations`,
                icon: ListTodo,
                color: "#2563EB",
              },
              {
                label: "Active Run-state",
                value: `${pendingTasksCount} Pending`,
                icon: Clock,
                color: "#F59E0B",
              },
              {
                label: "Closed Nodes",
                value: `${completedTasksCount} Resolved`,
                icon: CheckCircle2,
                color: "#22C55E",
              },
              {
                label: "Mean Process Ratio",
                value: `${generalizedMeanProgress}% Index`,
                icon: BarChart3,
                color: "#F4B400",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                whileHover={{ y: -3 }}
              >
                <GlassPanel
                  className="p-5 flex justify-between items-center"
                  style={{ background: `linear-gradient(160deg, ${stat.color}14, rgba(255,255,255,0.85))` }}
                >
                  <div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">{stat.label}</p>
                    <h2
                      className="text-xl sm:text-2xl font-bold mt-1.5 tracking-tight text-slate-900 tabular-nums"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {stat.value}
                    </h2>
                  </div>
                  <div
                    className="p-3 rounded-xl bg-white/80 shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
                    style={{ border: `1px solid ${stat.color}33` }}
                  >
                    <stat.icon size={20} className="stroke-[2.5]" style={{ color: stat.color }} />
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>

          {/* Employee filter cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setSelectedEmployee("All")}
              className="cursor-pointer transition-all"
            >
              <GlassPanel
                hover={false}
                className="p-4"
                style={
                  selectedEmployee === "All"
                    ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }
                    : {}
                }
              >
                <h3 className="font-bold">All Employees</h3>
                <p className="text-sm mt-0.5 opacity-80">{tasks.length} Tasks</p>
              </GlassPanel>
            </div>

            {Object.entries(employeeStats).map(([name, stats]) => (
              <div
                key={name}
                onClick={() => setSelectedEmployee(name)}
                className="cursor-pointer transition-all"
              >
                <GlassPanel
                  hover={selectedEmployee !== name}
                  className="p-4"
                  style={
                    selectedEmployee === name
                      ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }
                      : {}
                  }
                >
                  <h3 className="font-bold text-lg">{name}</h3>
                  <p className="text-sm opacity-80">Total: {stats.total}</p>
                  <p className="text-sm opacity-80">Pending: {stats.pending}</p>
                  <p className="text-sm opacity-80">Completed: {stats.completed}</p>
                </GlassPanel>
              </div>
            ))}
          </div>

          {/* Task Form */}
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onSubmit={handleSubmit}
          >
            <GlassPanel hover={false} className="p-5 sm:p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-900/[0.06]">
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{ background: "rgba(244,180,0,0.12)", color: "#B45F06" }}
                >
                  {editingId ? <Pencil size={18} className="stroke-[2.5]" /> : <Plus size={18} className="stroke-[2.5]" />}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
                    {editingId ? "Modify Task" : "Create New Task"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Define development sprints, map accountability scopes, and balance operational delivery priority.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
                  <label className={labelCls}>Task Title</label>
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
                  <label className={labelCls}>Assigned To</label>
                  <select
                    className={inputCls}
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp.name}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Priority</label>
                  <select
                    className={inputCls}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                  <label className={labelCls}>Description</label>
                  <textarea
                    placeholder="Map comprehensive milestones, required environment variables, and programmatic conditions..."
                    className={`${inputCls} resize-none`}
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelCls}>Upload Screenshot</label>
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
                  <label className={labelCls}>Status</label>
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
                  <label className={labelCls}>Start Date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelCls}>Due Date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelCls}>Progress ({form.progress}%)</label>
                  <div className="flex items-center h-[46px] bg-white/70 border border-slate-900/[0.08] px-4 rounded-xl shadow-sm shadow-slate-100/50">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="w-full accent-[#F4B400] bg-slate-200 cursor-pointer rounded-lg h-1.5"
                      value={form.progress}
                      onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                    />
                  </div>
                </div>

              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2 border-t border-slate-900/[0.06]">
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
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all duration-200 text-[#0F172A] flex items-center justify-center gap-1.5"
                  style={{
                    background: "linear-gradient(135deg, #F4B400, #F59E0B)",
                    boxShadow: "0 8px 22px -4px rgba(244,180,0,0.4)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 28px -4px rgba(244,180,0,0.55)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 8px 22px -4px rgba(244,180,0,0.4)")}
                >
                  {editingId ? <CheckCircle2 size={15} className="stroke-[2.5]" /> : <Plus size={15} className="stroke-[2.5]" />}
                  {editingId ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </GlassPanel>
          </motion.form>

          {/* Task Ledger Container */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <GlassPanel hover={false} className="overflow-hidden w-full flex flex-col">

              <div className="p-5 sm:p-6 border-b border-slate-900/[0.06] bg-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
                    All Tasks
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Chronological index tracking priority bounds, current iteration cycles, and verification tasks.</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-slate-900/[0.08] text-slate-500 text-xs font-bold shadow-sm self-start sm:self-auto">
                  <Activity size={13} className="text-emerald-500 animate-pulse" />
                  <span className="text-slate-600">Live</span>
                </div>
              </div>

              {tasks.length === 0 && (
                <div className="flex flex-col items-center gap-2 justify-center py-16 px-6 text-slate-400 font-medium">
                  <FileText size={32} className="text-slate-300 stroke-[1.5]" />
                  <span className="text-center">No tasks found for this workspace yet.</span>
                </div>
              )}

              {/* Desktop / large screen table */}
              {tasks.length > 0 && (
                <div className="hidden lg:block overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900/[0.06] bg-white/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4 w-[40%]">Task</th>
                        <th className="px-4 py-4">Assigned To</th>
                        <th className="px-4 py-4">Assigned By</th>
                        <th className="px-4 py-4">Priority</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Due Date</th>
                        <th className="px-4 py-4">Progress</th>
                        <th className="px-4 py-4">Screenshot</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-900/[0.06] text-sm text-slate-700">
                      <AnimatePresence>
                        {filteredTasks.map((task, idx) => (
                          <motion.tr
                            key={task._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.02 }}
                            className="hover:bg-[#F4B400]/[0.06] transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5 max-w-md">
                                <span className="font-bold text-slate-900 group-hover:text-[#B45F06] transition-colors block truncate">
                                  {task.title}
                                </span>
                                <span className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                  {task.description || "No description provided."}
                                </span>
                              </div>
                            </td>

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

                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                  <UserCheck size={12} />
                                </div>
                                <span className="text-xs font-semibold">
                                  {task.assignedBy || "Admin"}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${priorityBadge(task.priority)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(task.priority)}`} />
                                {task.priority}
                              </span>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold border ${statusBadge(task.status)}`}
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {task.status}
                              </span>
                            </td>

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
                                    : "No due date"}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1 w-28">
                                <div
                                  className="flex items-center justify-between text-[10px] font-bold text-slate-400 tabular-nums"
                                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                >
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
                                  className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all active:scale-95 shadow-sm"
                                  title="Edit Task"
                                >
                                  <Pencil size={14} className="stroke-[2.5]" />
                                </button>

                                <button
                                  onClick={() => deleteTask(task._id)}
                                  className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 shadow-sm"
                                  title="Delete Task"
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

              {/* Mobile / tablet card list */}
              {tasks.length > 0 && (
                <div className="lg:hidden flex flex-col divide-y divide-slate-900/[0.06]">
                  <AnimatePresence>
                    {tasks.map((task, idx) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.03 }}
                        className="p-4 sm:p-5 flex flex-col gap-3 hover:bg-[#F4B400]/[0.05] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-bold text-slate-900 truncate">{task.title}</span>
                            <span className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {task.description || "No description provided."}
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
                              title="Edit Task"
                            >
                              <Pencil size={14} className="stroke-[2.5]" />
                            </button>
                            <button
                              onClick={() => deleteTask(task._id)}
                              className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg active:scale-95 transition-all"
                              title="Delete Task"
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
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusBadge(task.status)}`}
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {task.status}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <User size={11} />
                            {task.assignedTo || "Unassigned"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "#B45F06" }}>
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
                              : "No due date"}
                          </span>
                          {task.screenshot && (
                            <a
                              href={task.screenshot}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600"
                            >
                              View Screenshot
                            </a>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <div
                            className="flex items-center justify-between text-[10px] font-bold text-slate-400 tabular-nums"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
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

            </GlassPanel>
          </motion.div>

        </div>
      </div>

      <style>{`
        @keyframes driftA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,20px); } }
        @keyframes driftB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-25px,25px); } }
        @keyframes driftC { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-20px); } }
        .anim-drift-a { animation: driftA 14s ease-in-out infinite; }
        .anim-drift-b { animation: driftB 17s ease-in-out infinite; }
        .anim-drift-c { animation: driftC 20s ease-in-out infinite; }

        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }

        @media (prefers-reduced-motion: reduce) {
          .anim-drift-a, .anim-drift-b, .anim-drift-c, .anim-slide-in { animation: none !important; }
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.12); border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
