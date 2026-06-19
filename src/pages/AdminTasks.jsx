import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Pencil,
  Trash2,
  FileText,
  User,
  PlusCircle,
  TrendingUp
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

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          assignedBy: localStorage.getItem("adminName") || "Admin",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          editingId
            ? "Task Updated Successfully"
            : "Task Created Successfully"
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

  // Shared Design Blueprint Styles
  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50";
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Toaster position="top-right" />
      <Sidebar />

      <div className="flex-1 ml-72 p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <ClipboardList size={320} />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Team Task Management
            </h1>
            <p className="mt-1.5 text-violet-100/90 text-sm max-w-xl font-medium">
              Create, delegate, and track standard workflow modules. Monitor operational pipelines and milestone progress updates in real-time.
            </p>
          </div>
        </div>

        {/* Stats Grid Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Tasks</p>
              <h2 className="text-3xl font-black mt-2 text-slate-900 tracking-tight">{tasks.length}</h2>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-600">
              <ClipboardList size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Pending</p>
              <h2 className="text-3xl font-black mt-2 text-amber-500 tracking-tight">
                {tasks.filter((t) => t.status === "Todo").length}
              </h2>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-amber-600">
              <Clock size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">In Progress</p>
              <h2 className="text-3xl font-black mt-2 text-blue-500 tracking-tight">
                {tasks.filter((t) => t.status === "In Progress").length}
              </h2>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl text-blue-600">
              <TrendingUp size={22} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Completed</p>
              <h2 className="text-3xl font-black mt-2 text-emerald-500 tracking-tight">
                {tasks.filter((t) => t.status === "Done").length}
              </h2>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-600">
              <CheckCircle2 size={22} className="stroke-[2.5]" />
            </div>
          </div>

        </div>

        {/* Task Form Component Container */}
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/80 p-6 flex flex-col gap-5"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
              <PlusCircle size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "Update Task Parameter Matrix" : "Deploy New Operational Task"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure operational metadata rules and workforce tracking assignments.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label className={labelCls}>Task Header Title</label>
              <input
                type="text"
                placeholder="e.g. Optimize Database Engine"
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Workforce Node Assignment</label>
              <select
                className={inputCls}
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                required
              >
                <option value="">Assign Employee Node</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Priority Classification</label>
              <select
                className={inputCls}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelCls}>Task Objective / Operational Guidelines</label>
              <textarea
                placeholder="Provide a description of the target outcomes, criteria for verification, and workflow constraints..."
                className={`${inputCls} resize-none`}
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Current Pipeline Status</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
                <option>Closed</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Initialization Date</label>
              <input
                type="date"
                className={inputCls}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Target Deadline Completion</label>
              <input
                type="date"
                className={inputCls}
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            {/* Configured Progress Slider Layer */}
            <div className="md:col-span-2 lg:col-span-3 bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-2 mt-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quantified Execution Completion Ratio</label>
                <span className="text-xs font-mono font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">{form.progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600 transition-all focus:outline-none"
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
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-violet-600/10 flex items-center gap-2"
            >
              {editingId ? "Apply Modifications" : "Deploy Task Structure"}
            </button>
          </div>
        </motion.form>

        {/* Master Registry Table Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col">
          
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Operational Task Ledger</h2>
              <p className="text-xs text-slate-400 mt-0.5">Granular look at structural directives, timelines, and current assignment logs.</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Task Matrix / Details</th>
                  <th className="px-4 py-4">Assigned Resource</th>
                  <th className="px-4 py-4 text-center">Priority</th>
                  <th className="px-4 py-4 text-center">Pipeline State</th>
                  <th className="px-4 py-4">Deadline Target</th>
                  <th className="px-4 py-4">Progress Vector</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <FileText size={32} className="text-slate-300 stroke-[1.5]" />
                        <span>No core tasks detected within database cluster references.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/80 transition-all group">
                    
                    {/* Title & Description */}
                    <td className="px-6 py-4 max-w-sm">
                      <p className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {task.description || "No description provided."}
                      </p>
                    </td>

                    {/* Assigned User Tag */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-500/10">
                          {task.assignedTo?.charAt(0).toUpperCase() || <User size={14} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">
                            {task.assignedTo || "Unassigned"}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-semibold tracking-wide uppercase flex items-center gap-1 mt-0.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" /> Active Operator
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          task.priority === "High"
                            ? "bg-rose-50 border-rose-100 text-rose-700"
                            : task.priority === "Medium"
                            ? "bg-amber-50 border-amber-100 text-amber-700"
                            : "bg-emerald-50 border-emerald-100 text-emerald-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Pipeline Status Badge */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          task.status === "Done"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : task.status === "In Progress"
                            ? "bg-blue-50 border-blue-100 text-blue-700"
                            : task.status === "Closed"
                            ? "bg-slate-100 border-slate-200 text-slate-600"
                            : "bg-amber-50 border-amber-100 text-amber-600"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>

                    {/* Due Date Indicator */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                        <Calendar size={12} className="text-slate-400 stroke-[2.5]" />
                        <span>{task.dueDate || "N/A"}</span>
                      </div>
                    </td>

                    {/* Linear Progress Graph */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 w-28">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500">
                          <span>Progress</span>
                          <span>{task.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 border border-slate-200/60 rounded-full overflow-hidden h-2 shadow-inner">
                          <div
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action Panel */}
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
                              startDate: task.startDate || "",
                              dueDate: task.dueDate || "",
                              progress: task.progress || 0,
                            });
                          }}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-all active:scale-95 shadow-sm"
                          title="Modify Record Matrix"
                        >
                          <Pencil size={14} className="stroke-[2.5]" />
                        </button>
                        
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
                          title="Purge Task"
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