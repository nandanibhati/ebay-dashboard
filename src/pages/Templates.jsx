import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { Menu, X, Copy, Check, Pencil, Trash2, FileText } from "lucide-react";
import { apiFetch } from "../api";

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

const CATEGORIES = ["General", "Customer Reply", "Refund", "Listing"];

function TemplateCard({ template, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(template.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="group bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-base leading-snug truncate group-hover:text-[#B45F06] transition-colors">
            {template.title}
          </h3>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {template.category || "General"}
          </span>
        </div>
        <button
          onClick={copy}
          title="Copy to clipboard"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 flex-shrink-0 ${
            copied
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-amber-50 text-[#B45F06] border border-amber-100 hover:bg-amber-100"
          }`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p className="mt-2.5 text-slate-500 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">
        {template.content}
      </p>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400">
          {template.createdAt ? new Date(template.createdAt).toLocaleDateString("en-GB") : ""}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(template)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-all duration-150 active:scale-95"
          >
            <Pencil size={12} />
            Edit
          </button>
          <button
            onClick={() => onDelete(template._id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all duration-150 active:scale-95"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  const role = localStorage.getItem("role");
  const [templates, setTemplates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "General" });

  useEffect(() => {
    ensureFonts();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await apiFetch("/api/templates");
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const resetForm = () => {
    setForm({ title: "", content: "", category: "General" });
    setEditingId(null);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert("Title and content are required");
      return;
    }

    try {
      const body = {
        ...form,
        createdBy: localStorage.getItem("employeeName") || "Admin",
      };

      const res = await apiFetch(
        editingId ? `/api/templates/${editingId}` : "/api/templates",
        {
          method: editingId ? "PUT" : "POST",
          body,
        }
      );

      const data = await res.json();

      if (data.success) {
        resetForm();
        fetchTemplates();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to save template");
    }
  };

  const editTemplate = (template) => {
    setEditingId(template._id);
    setForm({
      title: template.title,
      content: template.content,
      category: template.category || "General",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await apiFetch(`/api/templates/${id}`, { method: "DELETE" });
      fetchTemplates();
    } catch (error) {
      console.log(error);
    }
  };

  const filtered =
    categoryFilter === "All"
      ? templates
      : templates.filter((t) => (t.category || "General") === categoryFilter);

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: "#F8FAFC", fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
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
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-500" style={{ fontFamily: "Sora, sans-serif" }}>
            Templates
          </span>
        </div>

        <div
          className="relative overflow-hidden rounded-3xl p-8 text-white mb-8 shadow-lg"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-2xl"
            style={{ background: "rgba(244,180,0,0.18)" }}
          />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#F4B400" }}>
                Reusable Text
              </p>
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
                Templates
              </h1>
              <p className="mt-1.5 text-slate-400 text-sm max-w-sm">
                Save customer replies, refund messages, and listing text you use often.
              </p>
            </div>
            <div
              className="flex items-center gap-2 backdrop-blur-sm border rounded-2xl px-4 py-2.5"
              style={{ background: "rgba(244,180,0,0.12)", borderColor: "rgba(244,180,0,0.3)" }}
            >
              <span className="text-2xl font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {templates.length}
              </span>
              <span className="text-slate-300 text-sm leading-tight">
                Total<br />Templates
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                    style={
                      editingId
                        ? { background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "#fff" }
                        : { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }
                    }
                  >
                    {editingId ? <Pencil size={14} /> : <FileText size={14} />}
                  </div>
                  <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
                    {editingId ? "Edit Template" : "New Template"}
                  </h2>
                </div>
                {editingId && (
                  <button onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">
                    ✕ Cancel
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Late delivery apology"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Content</label>
                  <textarea
                    rows="6"
                    placeholder="Write the reusable text here…"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200 resize-none"
                  />
                </div>

                <button
                  onClick={submit}
                  className="w-full py-3 rounded-xl font-semibold text-sm shadow-md active:scale-[0.98] transition-all duration-200 mt-1"
                  style={
                    editingId
                      ? { background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "#fff", boxShadow: "0 8px 20px -6px rgba(37,99,235,0.4)" }
                      : { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A", boxShadow: "0 8px 20px -6px rgba(244,180,0,0.4)" }
                  }
                >
                  {editingId ? "Save Changes" : "+ Create Template"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>All Templates</h2>
                <div className="flex gap-1.5 flex-wrap">
                  {["All", ...CATEGORIES].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategoryFilter(c)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150"
                      style={
                        categoryFilter === c
                          ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A", boxShadow: "0 4px 12px -2px rgba(244,180,0,0.4)" }
                          : { background: "#F1F5F9", color: "#64748B" }
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText size={36} className="text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No templates here yet.</p>
                  <p className="text-slate-400 text-xs mt-1">Create your first template using the form.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((template) => (
                    <TemplateCard
                      key={template._id}
                      template={template}
                      onEdit={editTemplate}
                      onDelete={deleteTemplate}
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
