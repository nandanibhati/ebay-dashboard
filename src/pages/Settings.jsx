import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  Settings as SettingsIcon,
  Plus,
  X,
  Menu,
  Store,
  ClipboardList,
  Tag,
  Layers,
  Truck,
  Save,
  Lock,
} from "lucide-react";
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

const REQUIRED_ORDER_STATUSES = ["Cancelled", "Returned"];

function EditableList({ icon: Icon, title, description, items, onChange, locked = [] }) {
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const value = draft.trim();
    if (!value || items.includes(value)) {
      setDraft("");
      return;
    }
    onChange([...items, value]);
    setDraft("");
  };

  const removeItem = (value) => {
    if (locked.includes(value)) {
      toast.error(`"${value}" can't be removed — it's used by stock/status logic.`);
      return;
    }
    onChange(items.filter((i) => i !== value));
  };

  return (
    <GlassPanel className="p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: "rgba(244,180,0,0.12)", color: "#B45F06" }}>
          <Icon size={18} className="stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
            {title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.length === 0 && (
          <span className="text-xs text-slate-400 italic">No items yet — add one below.</span>
        )}
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700"
          >
            {item}
            {locked.includes(item) ? (
              <Lock size={11} className="text-slate-400" title="Required — can't be removed" />
            ) : (
              <button
                onClick={() => removeItem(item)}
                className="text-slate-400 hover:text-red-600 transition-colors"
                title="Remove"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add new..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
          className="flex-1 px-3 py-2 text-sm bg-white/70 border border-slate-900/[0.08] rounded-xl outline-none focus:border-[#F4B400]/60 focus:bg-white focus:ring-4 focus:ring-[#F4B400]/10 transition-all"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-1.5"
        >
          <Plus size={14} className="stroke-[2.5]" />
          Add
        </button>
      </div>
    </GlassPanel>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensureFonts();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiFetch("/api/settings");
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/settings", {
        method: "PUT",
        body: {
          orderSites: settings.orderSites,
          orderStatuses: settings.orderStatuses,
          taskPriorities: settings.taskPriorities,
          taskGroups: settings.taskGroups,
          purchaseSuppliers: settings.purchaseSuppliers,
        },
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        toast.success("Settings Saved");
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: "#F8FAFC", fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      <Toaster position="top-right" reverseOrder={false} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
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

      <div className="p-4 lg:p-8 max-w-[1200px] mx-auto flex flex-col gap-6 w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-500" style={{ fontFamily: "Sora, sans-serif" }}>
            Settings
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div className="absolute right-0 bottom-0 opacity-[0.06] translate-x-10 translate-y-10 pointer-events-none">
            <SettingsIcon size={320} />
          </div>
          <div
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(244,180,0,0.18)" }}
          />
          <div className="relative z-10">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"
              style={{ background: "rgba(244,180,0,0.14)", border: "1px solid rgba(244,180,0,0.3)", color: "#F4B400" }}
            >
              <SettingsIcon size={11} /> App Configuration
            </span>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ fontFamily: "Sora, sans-serif" }}>
              Settings
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-xl">
              Manage the dropdown and filter option lists used across Orders, Tasks, and Purchases.
            </p>
          </div>
        </motion.div>

        {!settings ? (
          <GlassPanel className="p-10 text-center text-slate-400 text-sm">Loading settings...</GlassPanel>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EditableList
                icon={Store}
                title="Order Sites"
                description="Marketplace options shown when logging or filtering orders."
                items={settings.orderSites}
                onChange={(v) => updateField("orderSites", v)}
              />
              <EditableList
                icon={Layers}
                title="Order Statuses"
                description="Cancelled and Returned trigger stock restocking and can't be removed."
                items={settings.orderStatuses}
                onChange={(v) => updateField("orderStatuses", v)}
                locked={REQUIRED_ORDER_STATUSES}
              />
              <EditableList
                icon={Tag}
                title="Task Priorities"
                description="Priority levels available when creating or filtering tasks."
                items={settings.taskPriorities}
                onChange={(v) => updateField("taskPriorities", v)}
              />
              <EditableList
                icon={ClipboardList}
                title="Task Groups"
                description="Suggested groups shown while typing a task's Group field."
                items={settings.taskGroups}
                onChange={(v) => updateField("taskGroups", v)}
              />
              <EditableList
                icon={Truck}
                title="Purchase Suppliers"
                description="Supplier options on the Purchases page."
                items={settings.purchaseSuppliers}
                onChange={(v) => updateField("purchaseSuppliers", v)}
              />
            </div>

            <GlassPanel className="p-4 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400 max-w-md">
                Task Status (Todo / In Progress / Done / Closed) isn't editable here — it's wired directly
                into overdue tracking, the ATC popup, and auto-archiving, so changing it would break those features.
              </p>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all duration-200 text-[#0F172A] flex items-center gap-1.5 shrink-0"
                style={{
                  background: saving ? "#E2E8F0" : "linear-gradient(135deg, #F4B400, #F59E0B)",
                  boxShadow: saving ? "none" : "0 8px 22px -4px rgba(244,180,0,0.4)",
                }}
              >
                <Save size={15} className="stroke-[2.5]" />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </GlassPanel>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) { .anim-slide-in { animation: none !important; } }
      `}</style>
    </div>
  );
}
