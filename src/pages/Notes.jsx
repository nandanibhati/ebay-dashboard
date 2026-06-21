import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import EmployeeSidebar from "../components/EmployeeSidebar";

const STATUS_CONFIG = {
  Todo: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700 ring-amber-200",
  },
  "In Progress": {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
    badge: "bg-blue-100 text-blue-700 ring-blue-200",
  },
  Completed: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
};

function StatCard({ label, value, color, icon, gradient }) {
  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{label}</span>
          <span className="text-xl">{icon}</span>
        </div>
        <p className={`text-4xl font-extrabold tracking-tight ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function NoteCard({ note, index, deleteNote, editNote }) {
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
      {/* Title + badge */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-800 text-base leading-snug truncate group-hover:text-violet-700 transition-colors duration-200 flex-1 min-w-0">
          {note.title}
        </h3>
        <span className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ring-1 ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {note.status}
        </span>
      </div>

      {/* Content */}
      <p className="mt-2.5 text-slate-500 text-sm leading-relaxed line-clamp-3">
        {note.content}
      </p>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">

        {/* Author */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
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
  const role = localStorage.getItem("role");

  const [form, setForm] = useState({
    title: "",
    content: "",
    status: "Todo",
  });

  const fetchNotes = async () => {
    try {
      const res = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/notes");
      const data = await res.json();
      if (data.success) setNotes(data.notes);
    } catch (error) {
      console.log(error);
    }
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

  const editNote = (note) => {
    setEditingId(note._id);
    setForm({ title: note.title, content: note.content, status: note.status });
  };

  const updateNote = async () => {
    try {
      const res = await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/notes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert("Note Updated");
        setEditingId(null);
        setForm({ title: "", content: "", status: "Todo" });
        fetchNotes();
      }
    } catch (error) { console.log(error); }
  };

  const createNote = async () => {
    try {
      const res = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/notes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          createdBy: localStorage.getItem("employeeName") || "Admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Note Created Successfully");
        setForm({ title: "", content: "", status: "Todo" });
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
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {role === "admin" ? <Sidebar /> : <EmployeeSidebar />}

      <div className="flex-1 ml-72 p-8 max-w-[1200px]">

        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500 rounded-3xl p-8 text-white mb-8 shadow-lg">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-indigo-400/30 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-1">Workspace</p>
              <h1 className="text-3xl font-extrabold tracking-tight">Notes 📝</h1>
              <p className="mt-1.5 text-violet-100 text-sm max-w-sm">
                Capture ideas, client info, and internal docs — all in one place.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5">
              <span className="text-2xl font-extrabold">{notes.length}</span>
              <span className="text-violet-100 text-sm leading-tight">Total<br />Notes</span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Notes" value={notes.length} color="text-slate-800" icon="🗂️" gradient="bg-gradient-to-br from-slate-50 to-violet-50" />
          <StatCard label="Todo" value={notes.filter((n) => n.status === "Todo").length} color="text-amber-500" icon="⏳" gradient="bg-gradient-to-br from-amber-50/60 to-orange-50/60" />
          <StatCard label="Completed" value={notes.filter((n) => n.status === "Completed").length} color="text-emerald-600" icon="✅" gradient="bg-gradient-to-br from-emerald-50/60 to-teal-50/60" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm transition-colors duration-200 ${editingId ? "bg-blue-500" : "bg-violet-600"}`}>
                    {editingId ? "✏️" : "➕"}
                  </div>
                  <h2 className="text-base font-bold text-slate-800">
                    {editingId ? "Edit Note" : "New Note"}
                  </h2>
                </div>
                {editingId && (
                  <button
                    onClick={() => { setEditingId(null); setForm({ title: "", content: "", status: "Todo" }); }}
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
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Content</label>
                  <textarea
                    rows="5"
                    placeholder="Write your note here…"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <button
                  onClick={editingId ? updateNote : createNote}
                  className={`w-full text-white py-3 rounded-xl font-semibold text-sm shadow-md active:scale-[0.98] transition-all duration-200 mt-1 ${
                    editingId
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200 hover:shadow-blue-300"
                      : "bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 shadow-violet-200 hover:shadow-violet-300"
                  }`}
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
                <h2 className="text-base font-bold text-slate-800">All Notes</h2>
                <div className="flex gap-1.5 flex-wrap">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterStatus(f)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 ${
                        filterStatus === f
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
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
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
