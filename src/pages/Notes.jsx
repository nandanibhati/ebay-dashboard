import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { Menu, X } from "lucide-react";

/* Design tokens - BuildMaster reference palette
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

const STATUS_CONFIG = {
  Todo: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700 ring-amber-200",
    menu: "hover:bg-amber-50 hover:text-amber-700",
  },
  "In Progress": {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
    badge: "bg-blue-100 text-blue-700 ring-blue-200",
    menu: "hover:bg-blue-50 hover:text-blue-700",
  },
  Completed: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    menu: "hover:bg-emerald-50 hover:text-emerald-700",
  },
};

const STATUSES = ["Todo", "In Progress", "Completed"];

function StatCard({ label, value, color, icon, gradient }) {
  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{label}</span>
          <span className="text-xl">{icon}</span>
        </div>
        <p className={`text-4xl font-bold tracking-tight tabular-nums ${color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
      </div>
    </div>
  );
}

/* Styled status dropdown — replaces the bare <select> */
function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cfg = STATUS_CONFIG[value] || STATUS_CONFIG["Todo"];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ring-1 transition-all duration-150 hover:opacity-80 ${cfg.badge}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {value}
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-slate-100 rounded-xl shadow-lg py-1 min-w-[130px]">
          {STATUSES.map((s) => {
            const c = STATUS_CONFIG[s];
            const active = s === value;
            return (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors duration-100 ${active ? `${c.bg} ${c.color}` : `text-slate-600 ${c.menu}`}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                {s}
                {active && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, index, deleteNote, editNote, updateStatus }) {
  const cfg = STATUS_CONFIG[note.status] || STATUS_CONFIG["Todo"];
  const initials = (note.createdBy || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="group bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Title + status dropdown */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-800 text-base leading-snug truncate transition-colors duration-200 flex-1 min-w-0 group-hover:text-[#B45F06]">
          {note.title}
        </h3>
        <StatusDropdown
          value={note.status}
          onChange={(newStatus) => updateStatus(note._id, newStatus)}
        />
      </div>

      {/* Content */}
      <p className="mt-2.5 text-slate-500 text-sm leading-relaxed line-clamp-3">
        {note.content}
      </p>
      {note.screenshot && (
        <div className="mt-3">
          <a
            href={note.screenshot}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100"
          >
            📷 View Screenshot
          </a>
        </div>
      )}
      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Author */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            {initials}
          </div>
          <span className="text-xs text-slate-500 font-medium truncate">{note.createdBy}</span>
        </div>

        {/* Date + actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {note.createdAt && (
            <span className="text-xs text-slate-400 hidden sm:block">
              {new Date(note.createdAt).toLocaleDateString("en-GB")}
            </span>
          )}

          <button
            onClick={() => editNote(note)}
            title="Edit note"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all duration-150 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
            Edit
          </button>

          <button
            onClick={() => deleteNote(note._id)}
            title="Delete note"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all duration-150 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const [editingId, setEditingId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state
  const role = localStorage.getItem("role");

  const [form, setForm] = useState({ title: "", content: "", status: "Todo",  screenshot: null, });

  useEffect(() => {
    ensureFonts();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/notes");
      const data = await res.json();
      if (data.success) setNotes(data.notes);
    } catch (error) { console.log(error); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const deleteNote = async (id) => {
    const ok = window.confirm("Delete this note?");
    if (!ok) return;
    try {
      await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/notes/${id}`, { method: "DELETE" });
      fetchNotes();
    } catch (error) { console.log(error); }
  };


  const updateStatus = async (id, status) => {
    try {
      const currentNote = notes.find((n) => n._id === id);

      const formData = new FormData();

      formData.append("title", currentNote.title);
      formData.append("content", currentNote.content);
      formData.append("status", status);
      formData.append("createdBy", currentNote.createdBy);

      const res = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/notes/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        fetchNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const updateNote = async () => {
    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("status", form.status);
      formData.append(
        "createdBy",
        localStorage.getItem("employeeName") || "Admin"
      );

      if (form.screenshot) {
        formData.append("screenshot", form.screenshot);
      }

      const res = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/notes/${editingId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Note Updated Successfully");

        setEditingId(null);

        setForm({
          title: "",
          content: "",
          status: "Todo",
          screenshot: null,
        });

        fetchNotes();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to Update Note");
    }
  };
  const editNote = (note) => {
    setEditingId(note._id);

    setForm({
      title: note.title,
      content: note.content,
      status: note.status,
      screenshot: null,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const createNote = async () => {
    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("status", form.status);
      formData.append(
        "createdBy",
        localStorage.getItem("employeeName") || "Admin"
      );

      if (form.screenshot) {
        formData.append("screenshot", form.screenshot);
      }

      const res = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/notes/create",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Note Created Successfully");

        setForm({
          title: "",
          content: "",
          status: "Todo",
          screenshot: null,
        });

        setEditingId(null);

        fetchNotes();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to Create Note");
    }
  };


  const filtered = filterStatus === "All" ? notes : notes.filter((n) => n.status === filterStatus);
  const FILTERS = ["All", "Todo", "In Progress", "Completed"];

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
            {role === "admin" ? <Sidebar /> : <EmployeeSidebar />}
          </div>
        </div>
      )}

      <div className="p-4 lg:p-8 max-w-[1200px]">

        {/* Top bar */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-500" style={{ fontFamily: "Sora, sans-serif" }}>
            Workspace
          </span>
        </div>

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 text-white mb-8 shadow-lg"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-2xl"
            style={{ background: "rgba(244,180,0,0.18)" }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full blur-2xl"
            style={{ background: "rgba(37,99,235,0.18)" }}
          />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#F4B400" }}>Workspace</p>
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Notes</h1>
              <p className="mt-1.5 text-slate-400 text-sm max-w-sm">
                Capture ideas, client info, and internal docs — all in one place.
              </p>
            </div>
            <div
              className="flex items-center gap-2 backdrop-blur-sm border rounded-2xl px-4 py-2.5"
              style={{ background: "rgba(244,180,0,0.12)", borderColor: "rgba(244,180,0,0.3)" }}
            >
              <span className="text-2xl font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{notes.length}</span>
              <span className="text-slate-300 text-sm leading-tight">Total<br />Notes</span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Notes" value={notes.length} color="text-slate-800" icon="🗂️" gradient="bg-gradient-to-br from-slate-50 to-blue-50" />
          <StatCard label="Todo" value={notes.filter((n) => n.status === "Todo").length} color="text-amber-500" icon="⏳" gradient="bg-gradient-to-br from-amber-50/60 to-orange-50/60" />
          <StatCard label="Completed" value={notes.filter((n) => n.status === "Completed").length} color="text-emerald-600" icon="✅" gradient="bg-gradient-to-br from-emerald-50/60 to-teal-50/60" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors duration-200"
                    style={
                      editingId
                        ? { background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "#fff" }
                        : { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }
                    }
                  >
                    {editingId ? "✏️" : "➕"}
                  </div>
                  <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
                    {editingId ? "Edit Note" : "New Note"}
                  </h2>
                </div>
                {editingId && (
                  <button
                    onClick={() => { setEditingId(null); setForm({ title: "", content: "", status: "Todo", screenshot: null, }); }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Title</label>
                  <input
                    type="text"
                    placeholder="Give your note a title…"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Content</label>
                  <textarea
                    rows="5"
                    placeholder="Write your note here…"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200 cursor-pointer"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Screenshot
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        screenshot: e.target.files[0],
                      })
                    }
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40"
                  />
                </div>

                <button
                  onClick={editingId ? updateNote : createNote}
                  className="w-full py-3 rounded-xl font-semibold text-sm shadow-md active:scale-[0.98] transition-all duration-200 mt-1"
                  style={
                    editingId
                      ? { background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "#fff", boxShadow: "0 8px 20px -6px rgba(37,99,235,0.4)" }
                      : { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A", boxShadow: "0 8px 20px -6px rgba(244,180,0,0.4)" }
                  }
                >
                  {editingId ? "💾 Update Note" : "+ Create Note"}
                </button>
              </div>
            </div>
          </div>

          {/* Notes List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>All Notes</h2>
                <div className="flex gap-1.5 flex-wrap">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterStatus(f)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150"
                      style={
                        filterStatus === f
                          ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A", boxShadow: "0 4px 12px -2px rgba(244,180,0,0.4)" }
                          : { background: "#F1F5F9", color: "#64748B" }
                      }
                    >
                      {f}
                      {f !== "All" && (
                        <span className={`ml-1 ${filterStatus === f ? "opacity-80" : "opacity-60"}`}>
                          ({notes.filter((n) => n.status === f).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-slate-500 text-sm font-medium">No notes here yet.</p>
                  <p className="text-slate-400 text-xs mt-1">Create your first note using the form.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((note, i) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      index={i}
                      deleteNote={deleteNote}
                      editNote={editNote}
                      updateStatus={updateStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) { .anim-slide-in { animation: none !important; } }
      `}</style>
    </div>
  );
}