import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ListTodo,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  BarChart3,
  FileText,
  Activity,
  UserCheck,
  X,
  Zap,
  Video,
  GraduationCap,
  ClipboardCheck,
  Power,
  Search,
  Archive,
  RotateCcw,
  ArrowLeft,
  Timer,
  FileBarChart,
  StickyNote,
} from "lucide-react";
import { apiFetch } from "../api";
import socket from "../socket";

const inputCls =
  "w-full px-4 py-3 text-sm bg-white/70 border border-slate-900/[0.08] rounded-xl outline-none focus:border-[#F4B400]/60 focus:bg-white focus:ring-4 focus:ring-[#F4B400]/10 transition-all duration-200 text-slate-800 placeholder:text-slate-400 shadow-sm shadow-slate-100/50 hover:border-slate-900/[0.14]";
const labelCls =
  "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5";

const EMPTY_TASK_FORM = {
  title: "",
  description: "",
  group: "",
  assignedBy: "",
  assignedTo: "",
  priority: "Medium",
  status: "Todo",
  startDate: "",
  dueDate: "",
  progress: 0,
  etcMinutes: "",
  atcMinutes: "",
  l1: "",
  l2: "",
  trainingLink: "",
  videoLink: "",
  formLink: "",
  formReportLink: "",
  checklistLink: "",
  screenshot: null,
};

const EMPTY_AUTOMATED_FORM = {
  title: "",
  description: "",
  group: "",
  etcMinutes: "",
  assignedTo: "",
  priority: "Medium",
  l1: "",
  l2: "",
  trainingLink: "",
  videoLink: "",
  formLink: "",
  formReportLink: "",
  checklistLink: "",
  image: null,
  time: "09:00",
  frequency: "Daily",
  weekday: "1",
  dayOfMonth: "1",
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function GlassPanel({ children, className = "", style = {} }) {
  return (
    <div
      className={`relative rounded-[22px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_20px_45px_-12px_rgba(30,41,59,0.14)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function Modal({ title, icon, onClose, children, wide = true }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full ${wide ? "max-w-4xl" : "max-w-lg"} my-6`}
      >
        <GlassPanel className="!bg-white/95 overflow-hidden flex flex-col max-h-[88vh]">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-900/[0.06] bg-white/60 shrink-0">
            <div
              className="p-2 rounded-lg"
              style={{ background: "rgba(244,180,0,0.12)", color: "#B45F06" }}
            >
              {icon}
            </div>
            <h2
              className="text-base sm:text-lg font-semibold text-slate-800 flex-1"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}

function StatPill({ label, value, color, icon: Icon, subtitle, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full shrink-0 text-white shadow-sm ${onClick ? "cursor-pointer active:scale-95 transition-transform" : ""}`}
      style={{ background: color }}
      title={subtitle}
    >
      <Icon size={13} className="stroke-[2.5] opacity-90" />
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{label}</span>
      <span className="text-sm font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </span>
    </Tag>
  );
}

export default function TaskManagerBoard({
  tasks,
  employees,
  currentUserName,
  onTasksChanged,
  canManageAutomation = true,
  archivedScopeName = null,
  initialViewMode = "active",
  canDeleteAnyTask = true,
}) {
  const [editingId, setEditingId] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAutomatedModal, setShowAutomatedModal] = useState(false);
  const [automatedTasks, setAutomatedTasks] = useState([]);
  const [automatedLoaded, setAutomatedLoaded] = useState(false);
  const [taskPriorities, setTaskPriorities] = useState(["High", "Medium", "Low"]);
  const [taskGroups, setTaskGroups] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [form, setForm] = useState(EMPTY_TASK_FORM);
  const [automatedForm, setAutomatedForm] = useState(EMPTY_AUTOMATED_FORM);
  const [doneTask, setDoneTask] = useState(null);
  const [pendingStatus, setPendingStatus] = useState("Done");
  const [atcInput, setAtcInput] = useState("");
  const [viewingNote, setViewingNote] = useState(null);

  const [viewMode, setViewMode] = useState(initialViewMode);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [archivedLoaded, setArchivedLoaded] = useState(false);
  const [deletedByFilter, setDeletedByFilter] = useState("All");

  // Local calendar date, not UTC — toISOString() would show yesterday's
  // date for hours after local midnight but before UTC midnight (e.g. IST).
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const groups = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.group).filter(Boolean))),
    [tasks]
  );

  const isOverdue = (task) =>
    task.dueDate &&
    task.dueDate.split("T")[0] < todayStr &&
    task.status !== "Done" &&
    task.status !== "Closed";

  // Overdue tasks show how many days past their due date they are, instead
  // of just the due date itself, so the age of the miss is visible at a glance.
  const overdueDays = (task) => {
    if (!isOverdue(task)) return 0;
    const due = new Date(task.dueDate.split("T")[0]);
    const today = new Date(todayStr);
    return Math.round((today - due) / (1000 * 60 * 60 * 24));
  };

  // Automated Tasks blade — its own filters, over the automated-task templates.
  const automatedFilteredTasks = automatedTasks.filter((at) => {
    if (search) {
      const q = search.toLowerCase();
      if (!at.title?.toLowerCase().includes(q) && !at.description?.toLowerCase().includes(q))
        return false;
    }
    if (groupFilter !== "All" && (at.group || "Ungrouped") !== groupFilter) return false;
    if (assigneeFilter !== "All" && at.assignedTo !== assigneeFilter) return false;
    return true;
  });
  const automatedStats = {
    total: automatedTasks.length,
    active: automatedTasks.filter((at) => at.active).length,
    paused: automatedTasks.filter((at) => !at.active).length,
  };

  const filteredTasks = tasks.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !t.title?.toLowerCase().includes(q) &&
        !t.description?.toLowerCase().includes(q)
      )
        return false;
    }
    if (groupFilter !== "All" && (t.group || "Ungrouped") !== groupFilter) return false;
    if (assigneeFilter !== "All" && t.assignedTo !== assigneeFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    return true;
  });

  // Stats
  const pendingCount = tasks.filter(
    (t) => t.status === "Todo" || t.status === "In Progress"
  ).length;
  const overdueCount = tasks.filter(isOverdue).length;
  // ETC/ATC summarize whatever's currently showing in the table below, so
  // they change as filters (including the Status filter) change — e.g.
  // clicking the ETC pill narrows to Done tasks, and the value narrows
  // along with it instead of staying the same "Done-only" number always.
  const totalEtcHrs = (
    filteredTasks.reduce((sum, t) => sum + Number(t.etcMinutes || 0), 0) / 60
  ).toFixed(1);
  const avgProgress = tasks.length
    ? (
        tasks.reduce((sum, t) => sum + Number(t.progress || 0), 0) / tasks.length
      ).toFixed(0)
    : 0;
  const totalAtcHrs = (
    filteredTasks.reduce((sum, t) => sum + Number(t.atcMinutes || 0), 0) / 60
  ).toFixed(1);
  const doneTasks = tasks.filter((t) => t.status === "Done" || t.status === "Closed");
  const avgTatDays = doneTasks.length
    ? (
        doneTasks.reduce(
          (sum, t) =>
            sum + (new Date(t.updatedAt) - new Date(t.createdAt)) / (1000 * 60 * 60 * 24),
          0
        ) / doneTasks.length
      ).toFixed(1)
    : 0;

  const canDeleteTask = (task) => canDeleteAnyTask || task.assignedBy === currentUserName;
  const selectableIds = filteredTasks.filter(canDeleteTask).map((t) => t._id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : selectableIds);
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const bulkDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Archive ${selectedIds.length} selected task(s)?`)) return;

    setBulkDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          apiFetch(`/api/tasks/${id}`, {
            method: "DELETE",
            body: { deletedBy: currentUserName || "Unknown" },
          })
        )
      );
      toast.success(`${selectedIds.length} task(s) archived`);
      setSelectedIds([]);
      onTasksChanged();
    } catch (error) {
      console.log(error);
      toast.error("Some tasks failed to archive");
    } finally {
      setBulkDeleting(false);
    }
  };

  // Archived view — its own filters (adds Deleted By) over the archived list.
  const archivedFilteredTasks = archivedTasks.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.title?.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q))
        return false;
    }
    if (groupFilter !== "All" && (t.group || "Ungrouped") !== groupFilter) return false;
    if (assigneeFilter !== "All" && t.assignedTo !== assigneeFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (deletedByFilter !== "All" && t.deletedBy !== deletedByFilter) return false;
    return true;
  });

  const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };
  const isWithinLast30 = (date) => date && new Date(date) >= daysAgo(30);
  // Local calendar date of a timestamp — deletedAt/createdAt come back as
  // UTC ISO strings, so a naive .split("T")[0] would drift a day off near
  // the local/UTC midnight boundary.
  const localDateStr = (input) => {
    if (!input) return "";
    const d = new Date(input);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const archivedStats = {
    totalDeleted: archivedTasks.length,
    thisMonth: archivedTasks.filter((t) => {
      const d = t.deletedAt && new Date(t.deletedAt);
      const now = new Date();
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    thisWeek: archivedTasks.filter((t) => isWithinLast30(t.deletedAt) && new Date(t.deletedAt) >= daysAgo(7)).length,
    today: archivedTasks.filter((t) => t.deletedAt && localDateStr(t.deletedAt) === todayStr).length,
  };
  const last30Archived = archivedTasks.filter((t) => isWithinLast30(t.deletedAt));
  const archivedAvgTat = last30Archived.length
    ? (
        last30Archived.reduce(
          (sum, t) =>
            sum + (new Date(t.deletedAt) - new Date(t.createdAt)) / (1000 * 60 * 60 * 24),
          0
        ) / last30Archived.length
      ).toFixed(1)
    : 0;
  const archivedMissed = last30Archived.filter(
    (t) => t.dueDate && t.deletedAt && t.dueDate.split("T")[0] < localDateStr(t.deletedAt)
  ).length;
  const archivedTotalEtcHrs = (
    archivedFilteredTasks.reduce((sum, t) => sum + Number(t.etcMinutes || 0), 0) / 60
  ).toFixed(1);
  const archivedTotalAtcHrs = (
    archivedFilteredTasks.reduce((sum, t) => sum + Number(t.atcMinutes || 0), 0) / 60
  ).toFixed(1);
  const tatDaysFor = (task) =>
    task.deletedAt
      ? Math.max(0, Math.round((new Date(task.deletedAt) - new Date(task.createdAt)) / (1000 * 60 * 60 * 24)))
      : "-";

  const priorityBadge = (priority) =>
    priority === "High"
      ? "bg-red-50 border-red-100 text-red-700"
      : priority === "Medium"
      ? "bg-amber-50 border-amber-100 text-amber-700"
      : priority === "Low"
      ? "bg-emerald-50 border-emerald-100 text-emerald-700"
      : "bg-slate-100 border-slate-200 text-slate-600";

  const priorityDot = (priority) =>
    priority === "High"
      ? "bg-red-500"
      : priority === "Medium"
      ? "bg-amber-500"
      : priority === "Low"
      ? "bg-emerald-500"
      : "bg-slate-400";

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

  const resetTaskForm = () => {
    setForm(EMPTY_TASK_FORM);
    setEditingId(null);
  };

  const openCreateTask = () => {
    resetTaskForm();
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      group: task.group || "",
      assignedBy: task.assignedBy || "",
      assignedTo: task.assignedTo || "",
      priority: task.priority || "Medium",
      status: task.status || "Todo",
      startDate: task.startDate ? task.startDate.split("T")[0] : "",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      progress: task.progress || 0,
      etcMinutes: task.etcMinutes || "",
      atcMinutes: task.atcMinutes || "",
      l1: task.l1 || "",
      l2: task.l2 || "",
      trainingLink: task.trainingLink || "",
      videoLink: task.videoLink || "",
      formLink: task.formLink || "",
      formReportLink: task.formReportLink || "",
      checklistLink: task.checklistLink || "",
      screenshot: null,
    });
    setShowTaskModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const markingDone = form.status === "Done" || form.status === "Closed";
    if (markingDone && form.atcMinutes === "") {
      toast.error("Enter Actual Time Taken (ATC) before marking this task Done — or use the Mark Done button instead.");
      return;
    }

    try {
      const url = editingId ? `/api/tasks/${editingId}` : "/api/tasks/create";
      const method = editingId ? "PUT" : "POST";

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "screenshot" || key === "assignedBy" || key === "progress") return;
        formData.append(key, value ?? "");
      });
      formData.append("progress", markingDone ? 100 : form.progress);
      // A create always assigns the current user; an edit must keep the
      // task's original assignor instead of overwriting it with the editor.
      formData.append("assignedBy", editingId ? (form.assignedBy || currentUserName || "Employee") : (currentUserName || "Employee"));
      if (form.screenshot) formData.append("screenshot", form.screenshot);

      const res = await apiFetch(url, { method, body: formData });
      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Task Updated Successfully" : "Task Created Successfully");

        if (!editingId) {
          socket.emit("taskAssigned", {
            assignedToName: form.assignedTo,
            assignedByName: currentUserName || "Employee",
            title: form.title,
          });
        }

        resetTaskForm();
        setShowTaskModal(false);
        onTasksChanged();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete Task? It will move to Archived Tasks.")) return;

    try {
      const res = await apiFetch(`/api/tasks/${id}`, {
        method: "DELETE",
        body: { deletedBy: currentUserName || "Unknown" },
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Task Archived");
        onTasksChanged();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadArchivedTasks = async () => {
    try {
      const url = archivedScopeName
        ? `/api/tasks/archived?name=${encodeURIComponent(archivedScopeName)}`
        : "/api/tasks/archived";
      const res = await apiFetch(url);
      const data = await res.json();
      if (data.success) {
        setArchivedTasks(data.tasks);
        setArchivedLoaded(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openArchivedView = () => {
    if (!archivedLoaded) loadArchivedTasks();
    setViewMode("archived");
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [search, groupFilter, assigneeFilter, statusFilter, priorityFilter, viewMode]);

  useEffect(() => {
    setViewMode(initialViewMode);
    if (initialViewMode === "archived") loadArchivedTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialViewMode]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch("/api/settings");
        const data = await res.json();
        if (data.success) {
          if (data.settings.taskPriorities?.length) setTaskPriorities(data.settings.taskPriorities);
          setTaskGroups(data.settings.taskGroups || []);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSettings();
  }, []);

  const restoreTask = async (id) => {
    try {
      const res = await apiFetch(`/api/tasks/${id}/restore`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        toast.success("Task Restored");
        loadArchivedTasks();
        onTasksChanged();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const permanentDeleteTask = async (id) => {
    if (!window.confirm("Permanently delete this task? This cannot be undone.")) return;

    try {
      const res = await apiFetch(`/api/tasks/${id}/permanent`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Task Permanently Deleted");
        loadArchivedTasks();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openDonePrompt = (task, targetStatus = "Done") => {
    setDoneTask(task);
    setPendingStatus(targetStatus);
    setAtcInput(task.atcMinutes || "");
  };

  const confirmDone = async (e) => {
    e.preventDefault();
    if (!doneTask) return;

    try {
      const formData = new FormData();
      formData.append("title", doneTask.title);
      formData.append("description", doneTask.description || "");
      formData.append("group", doneTask.group || "");
      formData.append("assignedTo", doneTask.assignedTo);
      formData.append("assignedBy", doneTask.assignedBy);
      formData.append("priority", doneTask.priority);
      formData.append("status", pendingStatus);
      formData.append("startDate", doneTask.startDate || "");
      formData.append("dueDate", doneTask.dueDate || "");
      formData.append("progress", 100);
      formData.append("etcMinutes", doneTask.etcMinutes || 0);
      formData.append("atcMinutes", atcInput || 0);
      formData.append("l1", doneTask.l1 || "");
      formData.append("l2", doneTask.l2 || "");
      formData.append("trainingLink", doneTask.trainingLink || "");
      formData.append("videoLink", doneTask.videoLink || "");
      formData.append("formLink", doneTask.formLink || "");
      formData.append("formReportLink", doneTask.formReportLink || "");
      formData.append("checklistLink", doneTask.checklistLink || "");

      const res = await apiFetch(`/api/tasks/${doneTask._id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Task marked ${pendingStatus}`);
        setDoneTask(null);
        setAtcInput("");
        onTasksChanged();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Quick inline status change from the table dropdown. Done/Closed still
  // require the ATC popup; other transitions apply immediately.
  const quickStatusChange = async (task, newStatus) => {
    if (newStatus === "Done" || newStatus === "Closed") {
      openDonePrompt(task, newStatus);
      return;
    }

    try {
      let progress = task.progress || 0;
      if (newStatus === "In Progress" && progress === 0) progress = 25;

      const formData = new FormData();
      formData.append("title", task.title);
      formData.append("description", task.description || "");
      formData.append("group", task.group || "");
      formData.append("assignedTo", task.assignedTo);
      formData.append("assignedBy", task.assignedBy);
      formData.append("priority", task.priority);
      formData.append("status", newStatus);
      formData.append("startDate", task.startDate || "");
      formData.append("dueDate", task.dueDate || "");
      formData.append("progress", progress);
      formData.append("etcMinutes", task.etcMinutes || 0);
      formData.append("atcMinutes", task.atcMinutes || 0);
      formData.append("l1", task.l1 || "");
      formData.append("l2", task.l2 || "");
      formData.append("trainingLink", task.trainingLink || "");
      formData.append("videoLink", task.videoLink || "");
      formData.append("formLink", task.formLink || "");
      formData.append("formReportLink", task.formReportLink || "");
      formData.append("checklistLink", task.checklistLink || "");

      const res = await apiFetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Status Updated");
        onTasksChanged();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  const loadAutomatedTasks = async () => {
    try {
      const res = await apiFetch("/api/automated-tasks");
      const data = await res.json();
      if (data.success) {
        setAutomatedTasks(data.automatedTasks);
        setAutomatedLoaded(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openAutomatedView = () => {
    if (!automatedLoaded) loadAutomatedTasks();
    setViewMode("automated");
  };

  const toggleAutomated = async (id) => {
    try {
      const res = await apiFetch(`/api/automated-tasks/${id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) loadAutomatedTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteAutomated = async (id) => {
    if (!window.confirm("Delete this automated task?")) return;
    try {
      const res = await apiFetch(`/api/automated-tasks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Automated Task Deleted");
        loadAutomatedTasks();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAutomatedSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.entries(automatedForm).forEach(([key, value]) => {
        if (key === "image") return;
        formData.append(key, value ?? "");
      });
      formData.append("assignedBy", currentUserName || "Employee");
      if (automatedForm.image) formData.append("image", automatedForm.image);

      const res = await apiFetch("/api/automated-tasks/create", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Automated Task Created");
        setAutomatedForm(EMPTY_AUTOMATED_FORM);
        setShowAutomatedModal(false);
        setAutomatedLoaded(false);
        loadAutomatedTasks();
        setViewMode("automated");
      } else {
        toast.error(data.message || "Failed to create automated task");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const linkIcons = (task) => {
    const items = [];
    if (task.trainingLink) items.push({ key: "training", icon: GraduationCap, href: task.trainingLink, title: "Training" });
    if (task.videoLink) items.push({ key: "video", icon: Video, href: task.videoLink, title: "Video" });
    if (task.formLink) items.push({ key: "form", icon: FileText, href: task.formLink, title: "Form" });
    if (task.formReportLink) items.push({ key: "formReport", icon: FileBarChart, href: task.formReportLink, title: "Form Report" });
    if (task.checklistLink) items.push({ key: "checklist", icon: ClipboardCheck, href: task.checklistLink, title: "Checklist" });
    if (!items.length) return <span className="text-slate-300">-</span>;
    return (
      <div className="flex items-center gap-1.5">
        {items.map(({ key, icon: Icon, href, title }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            title={title}
            className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-100"
          >
            <Icon size={12} />
          </a>
        ))}
      </div>
    );
  };

  const noteCell = (item) =>
    item.description ? (
      <button
        onClick={() => setViewingNote(item)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100 transition-colors"
      >
        <StickyNote size={12} className="stroke-[2.5]" />
        View
      </button>
    ) : (
      <span className="text-slate-300">-</span>
    );

  return (
    <div className="flex flex-col gap-6">
      <datalist id="task-groups-list">
        {taskGroups.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <GlassPanel className="p-6 sm:p-8 overflow-hidden relative">
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-60 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(244,180,0,0.18), transparent 70%)" }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
                style={{ background: "rgba(244,180,0,0.12)", border: "1px solid rgba(244,180,0,0.28)", color: "#B45F06" }}
              >
                <Activity size={12} className="animate-pulse" />
                Live Workspace
              </span>
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                {viewMode === "archived" ? "Archived Tasks" : viewMode === "automated" ? "Automated Tasks" : "Task Manager"}
              </h1>
              <p className="mt-1.5 text-slate-500 text-sm font-medium">
                Home &gt; Task Manager
                {viewMode === "archived" && <> &gt; Archived Tasks</>}
                {viewMode === "automated" && <> &gt; Automated Tasks</>}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {viewMode === "archived" || viewMode === "automated" ? (
                <>
                  <button
                    onClick={() => setViewMode("active")}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                  >
                    <ArrowLeft size={15} className="stroke-[2.5]" />
                    Back to Tasks
                  </button>
                  {viewMode === "automated" && canManageAutomation && (
                    <button
                      onClick={() => setShowAutomatedModal(true)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all duration-200 text-[#0F172A] flex items-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", boxShadow: "0 8px 22px -4px rgba(244,180,0,0.4)" }}
                    >
                      <Plus size={15} className="stroke-[2.5]" />
                      New Automated Task
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={openArchivedView}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                  >
                    <Archive size={15} className="stroke-[2.5]" />
                    Archived Tasks
                  </button>
                  {canManageAutomation && (
                    <>
                  <button
                    onClick={openAutomatedView}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                  >
                    <Zap size={15} className="stroke-[2.5]" />
                    Automated Tasks
                  </button>
                  <button
                    onClick={() => setShowAutomatedModal(true)}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                  >
                    <Clock size={15} className="stroke-[2.5]" />
                    New Automated Task
                  </button>
                    </>
                  )}
                  <button
                    onClick={openCreateTask}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all duration-200 text-[#0F172A] flex items-center gap-1.5"
                    style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", boxShadow: "0 8px 22px -4px rgba(244,180,0,0.4)" }}
                  >
                    <Plus size={15} className="stroke-[2.5]" />
                    New Task
                  </button>
                </>
              )}
            </div>
          </div>
        </GlassPanel>
      </motion.div>

      {/* Stat pills + filter toolbar share one row so the filters fill the
          leftover space next to the pills instead of stacking below them. */}
      <GlassPanel className="p-4 flex flex-wrap items-center gap-3">
        {viewMode === "archived" ? (
          <div className="flex gap-2.5 overflow-x-auto pb-0.5 shrink-0">
            <StatPill label="Total Deleted" value={archivedStats.totalDeleted} color="#EC4899" icon={Archive} />
            <StatPill label="This Month" value={archivedStats.thisMonth} color="#F59E0B" icon={Calendar} />
            <StatPill label="This Week" value={archivedStats.thisWeek} color="#8B5CF6" icon={Calendar} />
            <StatPill label="Today" value={archivedStats.today} color="#EC4899" icon={Calendar} />
            <StatPill label="TAT" value={`${archivedAvgTat}d`} color="#10B981" icon={Timer} subtitle="Avg last 30 days" />
            <StatPill label="Missed" value={archivedMissed} color="#DC2626" icon={AlertTriangle} subtitle="Last 30 days" />
            <StatPill label="Total ETC" value={`${archivedTotalEtcHrs}h`} color="#2563EB" icon={Clock} subtitle="Updates with filters" />
            <StatPill label="Total ATC" value={`${archivedTotalAtcHrs}h`} color="#22C55E" icon={Timer} subtitle="Updates with filters" />
          </div>
        ) : viewMode === "automated" ? (
          <div className="flex gap-2.5 overflow-x-auto pb-0.5 shrink-0">
            <StatPill label="Total" value={automatedStats.total} color="#8B5CF6" icon={Zap} />
            <StatPill label="Active" value={automatedStats.active} color="#22C55E" icon={Power} />
            <StatPill label="Paused" value={automatedStats.paused} color="#94A3B8" icon={Power} />
          </div>
        ) : (
        <div className="flex gap-2.5 overflow-x-auto pb-0.5 shrink-0">
          <StatPill label="Pending" value={pendingCount} color="#2563EB" icon={ListTodo} />
          <StatPill label="Overdue" value={overdueCount} color="#EF4444" icon={AlertTriangle} />
          <StatPill
            label="ETC"
            value={`${totalEtcHrs}h`}
            color="#F59E0B"
            icon={Clock}
            onClick={() => setStatusFilter(statusFilter === "Done" ? "All" : "Done")}
            subtitle="Estimated time of tasks matching filters — click to filter Done"
          />
          <StatPill label="ATC" value={`${totalAtcHrs}h`} color="#10B981" icon={Timer} subtitle="Actual time of tasks matching filters" />
          <StatPill label="TAT" value={`${avgTatDays}d`} color="#06B6D4" icon={Timer} subtitle="Avg turnaround time" />
          <StatPill label="Avg Score" value={`${avgProgress}%`} color="#8B5CF6" icon={BarChart3} />
          <StatPill label="Missed" value={overdueCount} color="#DC2626" icon={AlertTriangle} subtitle="Overdue tasks" />
          <StatPill
            label="Completed"
            value={doneTasks.length}
            color="#22C55E"
            icon={CheckCircle2}
            onClick={() => setStatusFilter(statusFilter === "Done" ? "All" : "Done")}
            subtitle="Click to filter Done tasks"
          />
        </div>
        )}

        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px] lg:justify-end">
          <div className="relative flex-1 min-w-[160px] max-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputCls} pl-8 !py-2 !w-full text-xs`}
            />
          </div>

          <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className={`${inputCls} !py-2 !w-auto text-xs`}>
            <option value="All">All Groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className={`${inputCls} !py-2 !w-auto text-xs`}>
            <option value="All">All Assignees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp.name}>{emp.name}</option>
            ))}
          </select>

          {viewMode !== "automated" && (
            <>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputCls} !py-2 !w-auto text-xs`}>
            <option value="All">Status: All</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
            <option value="Closed">Closed</option>
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={`${inputCls} !py-2 !w-auto text-xs`}>
            <option value="All">Priority: All</option>
            {taskPriorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
            </>
          )}

          {viewMode === "archived" && (
            <select value={deletedByFilter} onChange={(e) => setDeletedByFilter(e.target.value)} className={`${inputCls} !py-2 !w-auto text-xs`}>
              <option value="All">Deleted By: All</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          )}
        </div>
      </GlassPanel>

      {viewMode === "active" && selectedIds.length > 0 && (
        <GlassPanel className="p-4 flex items-center justify-between gap-3" style={{ background: "rgba(244,180,0,0.08)" }}>
          <span className="text-sm font-bold text-slate-700">{selectedIds.length} task(s) selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              Clear
            </button>
            <button
              onClick={bulkDeleteSelected}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all active:scale-95"
            >
              <Trash2 size={13} className="stroke-[2.5]" />
              {bulkDeleting ? "Archiving..." : "Delete Selected"}
            </button>
          </div>
        </GlassPanel>
      )}

      {/* Table */}
      {viewMode === "archived" ? (
      <GlassPanel className="overflow-hidden w-full flex flex-col">
        {archivedFilteredTasks.length === 0 && (
          <div className="flex flex-col items-center gap-2 justify-center py-16 px-6 text-slate-400 font-medium">
            <Archive size={32} className="text-slate-300 stroke-[1.5]" />
            <span className="text-center">No archived tasks match your filters.</span>
          </div>
        )}

        {archivedFilteredTasks.length > 0 && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900/[0.06] bg-white/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-4">Task</th>
                  <th className="px-4 py-4">Links</th>
                  <th className="px-4 py-4">Note</th>
                  <th className="px-4 py-4">Group</th>
                  <th className="px-4 py-4">Assignor</th>
                  <th className="px-4 py-4">Assignee</th>
                  <th className="px-4 py-4">ETC / ATC</th>
                  <th className="px-4 py-4">Priority</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">TAT</th>
                  <th className="px-4 py-4">Archived By</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/[0.06] text-sm text-slate-700">
                {archivedFilteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-900 text-xs leading-snug">{task.title}</span>
                    </td>
                    <td className="px-4 py-4">{linkIcons(task)}</td>
                    <td className="px-4 py-4">{noteCell(task)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-500">{task.group || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-600">{task.assignedBy || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-600">{task.assignedTo || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-500 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <div className="flex flex-col leading-tight">
                        <span>ETC {task.etcMinutes ? `${task.etcMinutes}m` : "-"}</span>
                        <span className="text-violet-500">ATC {task.atcMinutes ? `${task.atcMinutes}m` : "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${priorityBadge(task.priority)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(task.priority)}`} />
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold border ${statusBadge(task.status)}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-slate-500 tabular-nums">{tatDaysFor(task)}{typeof tatDaysFor(task) === "number" ? " days" : ""}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-red-600">{task.deletedBy || "-"}</span>
                        <span className="text-[10px] text-slate-400">
                          {task.deletedAt
                            ? new Date(task.deletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => restoreTask(task._id)}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all active:scale-95 shadow-sm"
                          title="Restore Task"
                        >
                          <RotateCcw size={14} className="stroke-[2.5]" />
                        </button>
                        {canManageAutomation && (
                          <button
                            onClick={() => permanentDeleteTask(task._id)}
                            className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 shadow-sm"
                            title="Delete Permanently"
                          >
                            <Trash2 size={14} className="stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
      ) : viewMode === "automated" ? (
      <GlassPanel className="overflow-hidden w-full flex flex-col">
        {automatedFilteredTasks.length === 0 && (
          <div className="flex flex-col items-center gap-2 justify-center py-16 px-6 text-slate-400 font-medium">
            <Zap size={32} className="text-slate-300 stroke-[1.5]" />
            <span className="text-center">No automated tasks match your filters.</span>
          </div>
        )}

        {automatedFilteredTasks.length > 0 && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900/[0.06] bg-white/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-4">Task</th>
                  <th className="px-4 py-4">Links</th>
                  <th className="px-4 py-4">Note</th>
                  <th className="px-4 py-4">Group</th>
                  <th className="px-4 py-4">Assignee</th>
                  <th className="px-4 py-4">ETC</th>
                  <th className="px-4 py-4">Priority</th>
                  <th className="px-4 py-4">Schedule</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/[0.06] text-sm text-slate-700">
                {automatedFilteredTasks.map((at) => (
                  <tr key={at._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-900 text-xs leading-snug flex items-start gap-1.5">
                        <Zap size={12} className="text-amber-500 shrink-0 mt-0.5" />
                        {at.title}
                      </span>
                    </td>
                    <td className="px-4 py-4">{linkIcons(at)}</td>
                    <td className="px-4 py-4">{noteCell(at)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-500">{at.group || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                          <User size={12} />
                        </div>
                        <span className="text-xs font-semibold">{at.assignedTo || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-500 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {at.etcMinutes ? `${at.etcMinutes}m` : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${priorityBadge(at.priority)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(at.priority)}`} />
                        {at.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-500">
                      {at.frequency} @ {at.time}
                      {at.frequency === "Weekly" && at.weekday !== null && ` (${WEEKDAYS[at.weekday]})`}
                      {at.frequency === "Monthly" && at.dayOfMonth !== null && ` (Day ${at.dayOfMonth})`}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold border ${at.active ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                        {at.active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => toggleAutomated(at._id)}
                          title={at.active ? "Active — click to pause" : "Paused — click to activate"}
                          className={`flex items-center justify-center p-2 rounded-lg border transition-all active:scale-95 shadow-sm ${
                            at.active ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-100 border-slate-200 text-slate-400"
                          }`}
                        >
                          <Power size={14} className="stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => deleteAutomated(at._id)}
                          className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 shadow-sm"
                          title="Delete"
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
        )}
      </GlassPanel>
      ) : (
      <GlassPanel className="overflow-hidden w-full flex flex-col">
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center gap-2 justify-center py-16 px-6 text-slate-400 font-medium">
            <FileText size={32} className="text-slate-300 stroke-[1.5]" />
            <span className="text-center">No tasks match your filters.</span>
          </div>
        )}

        {filteredTasks.length > 0 && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900/[0.06] bg-white/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded cursor-pointer accent-[#F4B400]"
                    />
                  </th>
                  <th className="px-4 py-4">Group</th>
                  <th className="px-4 py-4 w-[28%]">Task</th>
                  <th className="px-4 py-4">Assignor</th>
                  <th className="px-4 py-4">Assignee</th>
                  <th className="px-4 py-4">Due</th>
                  <th className="px-4 py-4">ETC / ATC</th>
                  <th className="px-4 py-4">Priority</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Progress</th>
                  <th className="px-4 py-4">Links</th>
                  <th className="px-4 py-4">Note</th>
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
                      transition={{ duration: 0.2, delay: idx * 0.015 }}
                      className="hover:bg-[#F4B400]/[0.06] transition-colors group"
                    >
                      <td className="px-4 py-4">
                        {canDeleteTask(task) && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(task._id)}
                            onChange={() => toggleSelectOne(task._id)}
                            className="w-4 h-4 rounded cursor-pointer accent-[#F4B400]"
                          />
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-500">
                        {task.group || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-900 text-xs leading-snug group-hover:text-[#B45F06] transition-colors flex items-start gap-1.5">
                          {task.sourceAutomatedTask && <Zap size={12} className="text-amber-500 shrink-0 mt-0.5" />}
                          <span>{task.title}</span>
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <UserCheck size={12} />
                          </div>
                          <span className="text-xs font-semibold">{task.assignedBy || "Admin"}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                            <User size={12} />
                          </div>
                          <span className="text-xs font-semibold">{task.assignedTo || "Unassigned"}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap font-medium text-xs">
                        <div className={`flex items-center gap-1.5 ${isOverdue(task) ? "text-red-600 font-bold" : "text-slate-500"}`}>
                          <Calendar size={13} />
                          <span>
                            {task.dueDate
                              ? isOverdue(task)
                                ? `Overdue by ${overdueDays(task)}d`
                                : new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                              : "No due date"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-500 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        <div className="flex flex-col leading-tight">
                          <span>ETC {task.etcMinutes ? `${task.etcMinutes}m` : "-"}</span>
                          <span className="text-violet-500">
                            ATC {task.atcMinutes ? `${task.atcMinutes}m` : "-"}
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
                        <select
                          value={task.status}
                          onChange={(e) => quickStatusChange(task, e.target.value)}
                          className={`px-2 py-1 rounded-md text-xs font-bold border outline-none cursor-pointer transition-colors hover:brightness-95 ${statusBadge(task.status)}`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <option value="Todo">Todo</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 w-24">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 tabular-nums">
                            <span>{task.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-100 border border-slate-200/60 rounded-full h-2 overflow-hidden shadow-inner">
                            <motion.div
                              className={`h-full rounded-full ${progressBar(task.progress)}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${task.progress || 0}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">{linkIcons(task)}</td>

                      <td className="px-4 py-4">{noteCell(task)}</td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center gap-2">
                          {task.status !== "Done" && task.status !== "Closed" && (
                            <button
                              onClick={() => openDonePrompt(task)}
                              className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all active:scale-95 shadow-sm"
                              title="Mark Done"
                            >
                              <CheckCircle2 size={14} className="stroke-[2.5]" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditTask(task)}
                            className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all active:scale-95 shadow-sm"
                            title="Edit Task"
                          >
                            <Pencil size={14} className="stroke-[2.5]" />
                          </button>
                          {(canDeleteAnyTask || task.assignedBy === currentUserName) && (
                            <button
                              onClick={() => deleteTask(task._id)}
                              className="flex items-center justify-center p-2 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 shadow-sm"
                              title="Delete Task"
                            >
                              <Trash2 size={14} className="stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
      )}

      {/* Create / Edit Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <Modal
            title={editingId ? "Modify Task" : "Create New Task"}
            icon={editingId ? <Pencil size={18} className="stroke-[2.5]" /> : <Plus size={18} className="stroke-[2.5]" />}
            onClose={() => {
              setShowTaskModal(false);
              resetTaskForm();
            }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelCls}>Task Title *</label>
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
                  <label className={labelCls}>Group</label>
                  <input
                    type="text"
                    list="task-groups-list"
                    placeholder="e.g. New Item"
                    className={inputCls}
                    value={form.group}
                    onChange={(e) => setForm({ ...form, group: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelCls}>Assigned To *</label>
                  <select
                    className={inputCls}
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp.name}>{emp.name}</option>
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
                    {taskPriorities.map((p) => (
                      <option key={p} value={p}>{p} Priority</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelCls}>Description</label>
                  <textarea
                    placeholder="Milestones, environment variables, conditions..."
                    className={`${inputCls} resize-none`}
                    rows="2"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Closed">Closed</option>
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
                  <label className={labelCls}>Due Date *</label>
                  <input
                    type="date"
                    required
                    className={inputCls}
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelCls}>ETC (Minutes) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    className={inputCls}
                    value={form.etcMinutes}
                    onChange={(e) => setForm({ ...form, etcMinutes: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelCls}>ATC (Actual Minutes)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Set on completion"
                    className={inputCls}
                    value={form.atcMinutes}
                    onChange={(e) => setForm({ ...form, atcMinutes: e.target.value })}
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

                <div>
                  <label className={labelCls}>Upload Screenshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    className={inputCls}
                    onChange={(e) => setForm({ ...form, screenshot: e.target.files[0] })}
                  />
                </div>

                <div>
                  <label className={labelCls}>L1</label>
                  <input type="text" className={inputCls} value={form.l1} onChange={(e) => setForm({ ...form, l1: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>L2</label>
                  <input type="text" className={inputCls} value={form.l2} onChange={(e) => setForm({ ...form, l2: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Training Link</label>
                  <input type="text" className={inputCls} value={form.trainingLink} onChange={(e) => setForm({ ...form, trainingLink: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Video Link</label>
                  <input type="text" className={inputCls} value={form.videoLink} onChange={(e) => setForm({ ...form, videoLink: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Form Link</label>
                  <input type="text" className={inputCls} value={form.formLink} onChange={(e) => setForm({ ...form, formLink: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Checklist Link</label>
                  <input type="text" className={inputCls} value={form.checklistLink} onChange={(e) => setForm({ ...form, checklistLink: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-3 border-t border-slate-900/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    resetTaskForm();
                  }}
                  className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <X size={14} className="stroke-[2.5]" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all duration-200 text-[#0F172A] flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", boxShadow: "0 8px 22px -4px rgba(244,180,0,0.4)" }}
                >
                  {editingId ? <CheckCircle2 size={15} className="stroke-[2.5]" /> : <Plus size={15} className="stroke-[2.5]" />}
                  {editingId ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Create Automated Task Modal */}
      <AnimatePresence>
        {showAutomatedModal && (
          <Modal
            title="Automated Task Information"
            icon={<Zap size={18} className="stroke-[2.5]" />}
            onClose={() => {
              setShowAutomatedModal(false);
              setAutomatedForm(EMPTY_AUTOMATED_FORM);
            }}
          >
            <form onSubmit={handleAutomatedSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Group</label>
                  <input type="text" list="task-groups-list" placeholder="Enter Group" className={inputCls} value={automatedForm.group} onChange={(e) => setAutomatedForm({ ...automatedForm, group: e.target.value })} />
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className={labelCls}>Task *</label>
                  <input type="text" placeholder="Enter Task" className={inputCls} required value={automatedForm.title} onChange={(e) => setAutomatedForm({ ...automatedForm, title: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>ETC (Min) *</label>
                  <input type="number" min="0" required className={inputCls} value={automatedForm.etcMinutes} onChange={(e) => setAutomatedForm({ ...automatedForm, etcMinutes: e.target.value })} />
                </div>

                <div>
                  <label className={labelCls}>Assignee *</label>
                  <select className={inputCls} required value={automatedForm.assignedTo} onChange={(e) => setAutomatedForm({ ...automatedForm, assignedTo: e.target.value })}>
                    <option value="">Please Select</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Priority</label>
                  <select className={inputCls} value={automatedForm.priority} onChange={(e) => setAutomatedForm({ ...automatedForm, priority: e.target.value })}>
                    {taskPriorities.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Time *</label>
                  <input type="time" required className={inputCls} value={automatedForm.time} onChange={(e) => setAutomatedForm({ ...automatedForm, time: e.target.value })} />
                </div>

                <div>
                  <label className={labelCls}>L1</label>
                  <input type="text" className={inputCls} value={automatedForm.l1} onChange={(e) => setAutomatedForm({ ...automatedForm, l1: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>L2</label>
                  <input type="text" className={inputCls} value={automatedForm.l2} onChange={(e) => setAutomatedForm({ ...automatedForm, l2: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Training Link</label>
                  <input type="text" placeholder="Training Link" className={inputCls} value={automatedForm.trainingLink} onChange={(e) => setAutomatedForm({ ...automatedForm, trainingLink: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Video Link</label>
                  <input type="text" placeholder="Video Link" className={inputCls} value={automatedForm.videoLink} onChange={(e) => setAutomatedForm({ ...automatedForm, videoLink: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Form Link</label>
                  <input type="text" placeholder="Form Link" className={inputCls} value={automatedForm.formLink} onChange={(e) => setAutomatedForm({ ...automatedForm, formLink: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Form Report Link</label>
                  <input type="text" placeholder="Report Link" className={inputCls} value={automatedForm.formReportLink} onChange={(e) => setAutomatedForm({ ...automatedForm, formReportLink: e.target.value })} />
                </div>

                <div>
                  <label className={labelCls}>Checklist Link</label>
                  <input type="text" placeholder="Checklist Link" className={inputCls} value={automatedForm.checklistLink} onChange={(e) => setAutomatedForm({ ...automatedForm, checklistLink: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Image</label>
                  <input type="file" accept="image/*" className={inputCls} onChange={(e) => setAutomatedForm({ ...automatedForm, image: e.target.files[0] })} />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelCls}>Description</label>
                  <textarea rows="2" className={`${inputCls} resize-none`} value={automatedForm.description} onChange={(e) => setAutomatedForm({ ...automatedForm, description: e.target.value })} />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelCls}>Frequency *</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {["Daily", "Weekly", "Monthly"].map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setAutomatedForm({ ...automatedForm, frequency: freq })}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={
                          automatedForm.frequency === freq
                            ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }
                            : { background: "#F1F5F9", color: "#475569" }
                        }
                      >
                        {freq.charAt(0)}
                      </button>
                    ))}

                    {automatedForm.frequency === "Weekly" && (
                      <select
                        className={`${inputCls} w-auto`}
                        value={automatedForm.weekday}
                        onChange={(e) => setAutomatedForm({ ...automatedForm, weekday: e.target.value })}
                      >
                        {WEEKDAYS.map((day, idx) => (
                          <option key={day} value={idx}>{day}</option>
                        ))}
                      </select>
                    )}

                    {automatedForm.frequency === "Monthly" && (
                      <input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Day of month"
                        className={`${inputCls} w-auto`}
                        value={automatedForm.dayOfMonth}
                        onChange={(e) => setAutomatedForm({ ...automatedForm, dayOfMonth: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-3 border-t border-slate-900/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAutomatedModal(false);
                    setAutomatedForm(EMPTY_AUTOMATED_FORM);
                  }}
                  className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all duration-200 text-[#0F172A] flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", boxShadow: "0 8px 22px -4px rgba(244,180,0,0.4)" }}
                >
                  <CheckCircle2 size={15} className="stroke-[2.5]" />
                  Create
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Mark Done — ATC entry popup */}
      <AnimatePresence>
        {doneTask && (
          <Modal
            title={`Mark Task as ${pendingStatus}`}
            icon={<CheckCircle2 size={18} className="stroke-[2.5]" />}
            onClose={() => setDoneTask(null)}
            wide={false}
          >
            <form onSubmit={confirmDone} className="flex flex-col gap-5">
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-800">{doneTask.title}</span> — enter the actual time
                taken (ATC) to complete this task.
              </p>
              <div>
                <label className={labelCls}>Actual Time Taken (Minutes) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  autoFocus
                  placeholder="e.g. 15"
                  className={inputCls}
                  value={atcInput}
                  onChange={(e) => setAtcInput(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-900/[0.06]">
                <button
                  type="button"
                  onClick={() => setDoneTask(null)}
                  className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all duration-200 text-[#0F172A] flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", boxShadow: "0 8px 22px -4px rgba(244,180,0,0.4)" }}
                >
                  <CheckCircle2 size={15} className="stroke-[2.5]" />
                  Confirm {pendingStatus}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* View Note popup */}
      <AnimatePresence>
        {viewingNote && (
          <Modal
            title={viewingNote.title}
            icon={<StickyNote size={18} className="stroke-[2.5]" />}
            onClose={() => setViewingNote(null)}
            wide={false}
          >
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
              {viewingNote.description}
            </p>
          </Modal>
        )}
      </AnimatePresence>

    </div>
  );
}
